package dev.joemoser.dashboard_backend.dto;

import dev.joemoser.dashboard_backend.dto.message_fields.ADS;
import dev.joemoser.dashboard_backend.dto.message_fields.EDS;
import dev.joemoser.dashboard_backend.dto.message_fields.FSW;
import dev.joemoser.dashboard_backend.dto.message_fields.ORN;
import dev.joemoser.dashboard_backend.dto.message_fields.SPEC;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MessageDTO
{
    private EDS eds;
    private FSW fsw;
    private ADS ads;
    private ORN orn;
    private SPEC spec;
}
