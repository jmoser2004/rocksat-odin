package dev.joemoser.dashboard_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class IdentityDTO
{
    private String accountId;
    private String identifier;
    private String thingId;
    private String[] thingGroup;
}
