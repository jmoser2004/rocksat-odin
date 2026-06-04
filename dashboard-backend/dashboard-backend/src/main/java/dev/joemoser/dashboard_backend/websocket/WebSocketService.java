package dev.joemoser.dashboard_backend.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService
{
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate)
    {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendMessage(String message)
    {
        messagingTemplate.convertAndSend("/topic/messages", message);
    }
}
