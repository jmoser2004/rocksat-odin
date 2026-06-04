package dev.joemoser.dashboard_backend.dto.message_fields;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Euler
{
    private double roll;
    private double pitch;
    private double yaw;
}
