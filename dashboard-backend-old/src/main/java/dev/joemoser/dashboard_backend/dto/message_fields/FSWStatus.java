package dev.joemoser.dashboard_backend.dto.message_fields;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FSWStatus
{
    @Column(columnDefinition="TEXT")
    private String config;

    @Column(columnDefinition="TEXT")
    @JsonProperty("te-2")
    private String te2;

    @Column(columnDefinition="TEXT")
    private String sd;

    @Column(columnDefinition="TEXT")
    @JsonProperty("spect_1")
    private String spect1;

    @Column(columnDefinition="TEXT")
    @JsonProperty("spect_2")
    private String spect2;

    @Column(columnDefinition="TEXT")
    private String orin;

    @Column(columnDefinition="TEXT")
    private String comm;
}
