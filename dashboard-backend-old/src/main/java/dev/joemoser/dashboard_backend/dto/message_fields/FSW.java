package dev.joemoser.dashboard_backend.dto.message_fields;

import dev.joemoser.dashboard_backend.dto.TimestampDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FSW
{
    private TimestampDTO timestamp;
    private FSWStatus status;
}
