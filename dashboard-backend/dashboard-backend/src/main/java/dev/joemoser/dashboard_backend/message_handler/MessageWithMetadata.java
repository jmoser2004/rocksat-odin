package dev.joemoser.dashboard_backend.message_handler;

import java.time.LocalDate;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MessageWithMetadata
{
    private String id;
    private Map<String, String> receivedAt;
    private Map<String, Object> identity;
    private Map<String, Object> imt;
    private String message;
    private String signature;

    public String getTimestamp()
    {
        try
        {
            int year  = Integer.parseInt(receivedAt.getOrDefault("year",   "0"));
            int day   = Integer.parseInt(receivedAt.getOrDefault("day",    "1"));
            int hour  = Integer.parseInt(receivedAt.getOrDefault("hour",   "0"));
            int min   = Integer.parseInt(receivedAt.getOrDefault("minute", "0"));
            int sec   = Integer.parseInt(receivedAt.getOrDefault("second", "0"));
            LocalDate date = LocalDate.ofYearDay(year, day);
            return String.format("%04d-%02d-%02dT%02d:%02d:%02dZ",
                date.getYear(), date.getMonthValue(), date.getDayOfMonth(), hour, min, sec);
        }
        catch (Exception e)
        {
            return "";
        }
    }
}
