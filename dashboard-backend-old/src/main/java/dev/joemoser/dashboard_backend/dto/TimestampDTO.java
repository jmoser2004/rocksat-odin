package dev.joemoser.dashboard_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TimestampDTO
{
    private int year;
    private int month;
    private int day;
    private int hour;
    private int minute;
    private int second;
}
