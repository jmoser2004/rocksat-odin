package dev.joemoser.dashboard_backend.dto.message_fields;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class IMU
{
    private Euler euler;
    private Quarternion quarternion;
    private XYZ bfield;
    private XYZ gravity;
}
