package dev.joemoser.dashboard_backend.dto.message_fields;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Packet
{
    private Long id;
    private int priority;

    @Column(columnDefinition="TEXT")
    private String data;

    @JsonProperty("associated_pkt")
    private Long associatedPacket;
}
