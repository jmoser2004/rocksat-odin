package dev.joemoser.dashboard_backend.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import dev.joemoser.dashboard_backend.database.Message;

@Service
public class WebsocketService
{
    private final SimpMessagingTemplate messagingTemplate;

    public WebsocketService(SimpMessagingTemplate messagingTemplate)
    {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendMessage(String message)
    {
        messagingTemplate.convertAndSend("/topic/messages",message);
    }
}
