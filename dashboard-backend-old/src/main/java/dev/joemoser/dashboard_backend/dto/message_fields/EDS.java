package dev.joemoser.dashboard_backend.dto.message_fields;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class EDS
{
    private Powerline rocket;

    @JsonProperty("12v")
    private Powerline twelveV;
    
    @JsonProperty("5v")
    private Powerline fiveV;

    @JsonProperty("3.3v")
    private Powerline threeThreeV;
}
