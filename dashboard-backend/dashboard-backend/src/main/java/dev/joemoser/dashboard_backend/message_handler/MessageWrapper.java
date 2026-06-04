package dev.joemoser.dashboard_backend.message_handler;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MessageWrapper
{
    private MessageType type;
    private String content; 
}
