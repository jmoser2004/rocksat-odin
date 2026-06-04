package dev.joemoser.dashboard_backend.dto.message_fields;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ADS
{
    @JsonProperty("imu_1")
    private IMU imu1;

    @JsonProperty("imu_2")
    private IMU imu2;
}
