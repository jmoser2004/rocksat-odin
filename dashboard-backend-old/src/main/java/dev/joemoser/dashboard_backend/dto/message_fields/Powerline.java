package dev.joemoser.dashboard_backend.dto.message_fields;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Powerline
{
    private double voltage;
    private double current;
    private double power;
}
