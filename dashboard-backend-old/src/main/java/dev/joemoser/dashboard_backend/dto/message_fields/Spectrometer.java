package dev.joemoser.dashboard_backend.dto.message_fields;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.joemoser.dashboard_backend.dto.TimestampDTO;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Spectrometer
{
    private TimestampDTO timestamp;

    @Column(columnDefinition="TEXT")
    private String data;

    @JsonProperty("packet_id")
    private Long packetId;
}
