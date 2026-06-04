package dev.joemoser.dashboard_backend.dto.message_fields;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SPEC
{
    @JsonProperty("spec_1")
    private Spectrometer spec1;

    @JsonProperty("spec_2")
    private Spectrometer spec2;
}
