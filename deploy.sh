#!/usr/bin/env bash
set -euo pipefail

# ── Configure these two lines ──────────────────────────────────────────────
REGION="us-east-1"           # AWS region where Cloudloop_Data_MO lives
REPO_URL="https://github.com/jmoser2004/rocksat-odin"
# ──────────────────────────────────────────────────────────────────────────

NAME="rocksat"
log() { printf '\033[34m▶\033[0m %s\n' "$*"; }
die() { printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

command -v aws &>/dev/null || die "AWS CLI not found. Run: brew install awscli"
aws sts get-caller-identity &>/dev/null || die "AWS credentials not configured. Run: aws configure"

# ── Key pair ───────────────────────────────────────────────────────────────
log "Key pair"
if [[ ! -f "${NAME}.pem" ]]; then
  aws ec2 delete-key-pair --key-name "$NAME" --region "$REGION" &>/dev/null || true
  aws ec2 create-key-pair \
    --key-name "$NAME" --region "$REGION" \
    --query 'KeyMaterial' --output text > "${NAME}.pem"
  chmod 400 "${NAME}.pem"
  log "  Saved ${NAME}.pem — keep this file, you need it to SSH in"
fi

# ── Security group ─────────────────────────────────────────────────────────
log "Security group"
VPC_ID=$(aws ec2 describe-vpcs \
  --filters Name=isDefault,Values=true --region "$REGION" \
  --query 'Vpcs[0].VpcId' --output text)
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$NAME" "Name=vpc-id,Values=$VPC_ID" \
  --region "$REGION" \
  --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null)
if [[ -z "$SG_ID" || "$SG_ID" == "None" ]]; then
  SG_ID=$(aws ec2 create-security-group \
    --group-name "$NAME" --description "RockSat dashboard" \
    --vpc-id "$VPC_ID" --region "$REGION" \
    --query 'GroupId' --output text)
  for PORT in 22 80 443; do
    aws ec2 authorize-security-group-ingress \
      --group-id "$SG_ID" --protocol tcp --port "$PORT" \
      --cidr 0.0.0.0/0 --region "$REGION" &>/dev/null
  done
fi

# ── IAM role + instance profile ────────────────────────────────────────────
log "IAM role"
if ! aws iam get-role --role-name "${NAME}-role" &>/dev/null; then
  aws iam create-role --role-name "${NAME}-role" \
    --assume-role-policy-document \
    '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
    --output text &>/dev/null
  aws iam put-role-policy \
    --role-name "${NAME}-role" --policy-name SqsConsume \
    --policy-document \
    '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["sqs:ReceiveMessage","sqs:DeleteMessage","sqs:ChangeMessageVisibility","sqs:GetQueueUrl","sqs:GetQueueAttributes"],"Resource":"arn:aws:sqs:*:*:Cloudloop_Data_MO"}]}'
  aws iam create-instance-profile --instance-profile-name "${NAME}-profile" &>/dev/null
  aws iam add-role-to-instance-profile \
    --instance-profile-name "${NAME}-profile" --role-name "${NAME}-role"
  log "  Waiting 15 s for IAM to propagate..."
  sleep 15
fi

# ── User-data: runs on the instance at first boot ──────────────────────────
TMPSCRIPT=$(mktemp)
cat > "$TMPSCRIPT" << ENDINIT
#!/bin/bash
exec > /var/log/rocksat-init.log 2>&1
set -euo pipefail

dnf install -y docker git
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs
systemctl enable --now docker

mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

git clone ${REPO_URL} /opt/rocksat
cd /opt/rocksat/dashboard-frontend && npm ci && npm run build

cd /opt/rocksat
echo "AWS_DEFAULT_REGION=${REGION}" > .env
docker compose up -d --build

echo "### INIT COMPLETE ###"
ENDINIT

# ── Launch instance ────────────────────────────────────────────────────────
log "Launching EC2 instance (t3.small)"
AMI_ID=$(aws ssm get-parameter \
  --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --region "$REGION" --query Parameter.Value --output text)

INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type t3.small \
  --key-name "$NAME" \
  --security-group-ids "$SG_ID" \
  --iam-instance-profile "Name=${NAME}-profile" \
  --region "$REGION" \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --metadata-options 'HttpPutResponseHopLimit=2,HttpEndpoint=enabled,HttpTokens=required' \
  --user-data "file://${TMPSCRIPT}" \
  --query 'Instances[0].InstanceId' --output text)

rm -f "$TMPSCRIPT"

log "Waiting for instance to start..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"

# ── Elastic IP ─────────────────────────────────────────────────────────────
log "Elastic IP"
ALLOC_ID=$(aws ec2 allocate-address \
  --domain vpc --region "$REGION" \
  --query 'AllocationId' --output text)
PUBLIC_IP=$(aws ec2 describe-addresses \
  --allocation-ids "$ALLOC_ID" --region "$REGION" \
  --query 'Addresses[0].PublicIp' --output text)
aws ec2 associate-address \
  --instance-id "$INSTANCE_ID" --allocation-id "$ALLOC_ID" \
  --region "$REGION" &>/dev/null

printf '\n\033[32m✓ Done!\033[0m\n\n'
printf '  Public IP : %s\n' "$PUBLIC_IP"
printf '  SSH       : ssh -i %s.pem ec2-user@%s\n\n' "$NAME" "$PUBLIC_IP"
printf 'The instance is provisioning in the background (~5–8 min).\n'
printf 'Watch progress: ssh in, then run:\n'
printf '  sudo tail -f /var/log/rocksat-init.log\n\n'
printf '\033[33mNext steps:\033[0m\n'
printf '  1. Point  rocksatodin.com  →  %s  in your DNS provider\n' "$PUBLIC_IP"
printf '  2. Once DNS propagates, Caddy auto-obtains the TLS cert on first visit\n'
printf '  3. Visit https://rocksatodin.com\n\n'
