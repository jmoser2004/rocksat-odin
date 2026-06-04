package dev.joemoser.dashboard_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FullMessageDTO
{
    private String id;
    private TimestampDTO receivedAt;
    private IdentityDTO identity;
    private MessageDTO message;
    private String signature;
}
