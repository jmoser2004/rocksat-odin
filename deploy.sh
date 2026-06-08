#!/usr/bin/env bash
set -euo pipefail

# ── Configure this ─────────────────────────────────────────────────────────
REGION="us-east-1"   # AWS region where Cloudloop_Data_MO SQS queue lives
# ──────────────────────────────────────────────────────────────────────────

NAME="rocksat"
IP_FILE=".rocksat-ip"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=5"

log()  { printf '\033[34m▶\033[0m %s\n' "$*"; }
die()  { printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }

command -v aws  &>/dev/null || die "AWS CLI not found (brew install awscli)"
aws sts get-caller-identity &>/dev/null || die "AWS not configured (run: aws configure)"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── If already deployed, just re-push code ─────────────────────────────────
if [[ -f "$SCRIPT_DIR/$IP_FILE" ]]; then
  PUBLIC_IP=$(cat "$SCRIPT_DIR/$IP_FILE")
  log "Existing server at $PUBLIC_IP — re-deploying code only"
  log "Copying project files"
  tar -czf - -C "$SCRIPT_DIR" \
    --exclude='.git' --exclude='node_modules' \
    --exclude='dashboard-frontend-old' --exclude='dashboard-backend-old' \
    --exclude='dashboard-backend/dashboard-backend/target' \
    --exclude='*.pem' --exclude="$IP_FILE" \
    . | ssh $SSH_OPTS -i "$SCRIPT_DIR/${NAME}.pem" ec2-user@"$PUBLIC_IP" \
        "tar -xzf - -C /opt/rocksat"
  log "Building frontend"
  ssh $SSH_OPTS -i "$SCRIPT_DIR/${NAME}.pem" ec2-user@"$PUBLIC_IP" \
    "cd /opt/rocksat/dashboard-frontend && npm ci --silent && npm run build"
  log "Restarting services"
  ssh $SSH_OPTS -i "$SCRIPT_DIR/${NAME}.pem" ec2-user@"$PUBLIC_IP" \
    "cd /opt/rocksat && sudo docker compose up -d --build 2>&1"
  ok "Re-deploy complete → https://rocksatodin.com"
  exit 0
fi

# ── Fresh provision ────────────────────────────────────────────────────────
log "Key pair"
if [[ ! -f "$SCRIPT_DIR/${NAME}.pem" ]]; then
  aws ec2 delete-key-pair --key-name "$NAME" --region "$REGION" &>/dev/null || true
  aws ec2 create-key-pair \
    --key-name "$NAME" --region "$REGION" \
    --query 'KeyMaterial' --output text > "$SCRIPT_DIR/${NAME}.pem"
  chmod 400 "$SCRIPT_DIR/${NAME}.pem"
fi

log "Security group"
VPC_ID=$(aws ec2 describe-vpcs \
  --filters Name=isDefault,Values=true --region "$REGION" \
  --query 'Vpcs[0].VpcId' --output text)
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$NAME" "Name=vpc-id,Values=$VPC_ID" \
  --region "$REGION" \
  --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || echo "None")
if [[ "$SG_ID" == "None" || -z "$SG_ID" ]]; then
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

log "IAM role"
if ! aws iam get-role --role-name "${NAME}-role" &>/dev/null; then
  aws iam create-role --role-name "${NAME}-role" \
    --assume-role-policy-document \
    '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
    &>/dev/null
  aws iam put-role-policy \
    --role-name "${NAME}-role" --policy-name SqsConsume \
    --policy-document \
    '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["sqs:ReceiveMessage","sqs:DeleteMessage","sqs:ChangeMessageVisibility","sqs:GetQueueUrl","sqs:GetQueueAttributes"],"Resource":"arn:aws:sqs:*:*:Cloudloop_Data_MO"}]}'
  aws iam create-instance-profile --instance-profile-name "${NAME}-profile" &>/dev/null
  aws iam add-role-to-instance-profile \
    --instance-profile-name "${NAME}-profile" --role-name "${NAME}-role"
  log "  Waiting for IAM to propagate..."
  sleep 15
fi

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
  --query 'Instances[0].InstanceId' --output text)

log "Waiting for instance to start..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"

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

echo "$PUBLIC_IP" > "$SCRIPT_DIR/$IP_FILE"
log "  IP: $PUBLIC_IP (saved to $IP_FILE)"

log "Waiting for SSH to be ready..."
until ssh $SSH_OPTS -i "$SCRIPT_DIR/${NAME}.pem" ec2-user@"$PUBLIC_IP" true 2>/dev/null; do
  sleep 5
done

log "Installing Docker + Compose + Buildx"
ssh $SSH_OPTS -i "$SCRIPT_DIR/${NAME}.pem" ec2-user@"$PUBLIC_IP" bash << 'REMOTE'
set -euo pipefail
sudo dnf install -y docker
sudo systemctl enable --now docker

sudo mkdir -p /usr/local/lib/docker/cli-plugins

sudo curl -fsSL \
  "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

BUILDX_VER=$(curl -fsSL https://api.github.com/repos/docker/buildx/releases/latest \
  | grep '"tag_name"' | cut -d'"' -f4)
sudo curl -fsSL \
  "https://github.com/docker/buildx/releases/download/${BUILDX_VER}/buildx-${BUILDX_VER}.linux-amd64" \
  -o /usr/local/lib/docker/cli-plugins/docker-buildx
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

sudo mkdir -p /opt/rocksat
sudo chown ec2-user:ec2-user /opt/rocksat

curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash - &>/dev/null
sudo dnf install -y nodejs
REMOTE

log "Copying project files"
tar -czf - -C "$SCRIPT_DIR" \
  --exclude='.git' --exclude='node_modules' \
  --exclude='dashboard-frontend-old' --exclude='dashboard-backend-old' \
  --exclude='dashboard-backend/dashboard-backend/target' \
  --exclude='*.pem' --exclude="$IP_FILE" \
  . | ssh $SSH_OPTS -i "$SCRIPT_DIR/${NAME}.pem" ec2-user@"$PUBLIC_IP" \
      "tar -xzf - -C /opt/rocksat"

log "Building frontend"
ssh $SSH_OPTS -i "$SCRIPT_DIR/${NAME}.pem" ec2-user@"$PUBLIC_IP" \
  "cd /opt/rocksat/dashboard-frontend && npm ci --silent && npm run build"

log "Starting services"
ssh $SSH_OPTS -i "$SCRIPT_DIR/${NAME}.pem" ec2-user@"$PUBLIC_IP" \
  "echo 'AWS_DEFAULT_REGION=${REGION}' > /opt/rocksat/.env && cd /opt/rocksat && sudo docker compose up -d --build 2>&1"

printf '\n'
ok "Done! All services are running."
printf '\n'
printf '  IP  : %s\n' "$PUBLIC_IP"
printf '  SSH : ssh -i %s.pem ec2-user@%s\n\n' "$NAME" "$PUBLIC_IP"
printf '\033[33mNext:\033[0m\n'
printf '  1. Point  rocksatodin.com  →  %s  in your DNS provider\n' "$PUBLIC_IP"
printf '  2. Caddy auto-gets the TLS cert on first visit\n'
printf '  3. Open https://rocksatodin.com\n\n'
printf 'To re-deploy after code changes: ./deploy.sh\n\n'
