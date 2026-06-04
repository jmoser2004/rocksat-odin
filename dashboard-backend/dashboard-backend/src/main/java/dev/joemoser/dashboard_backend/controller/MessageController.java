package dev.joemoser.dashboard_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import dev.joemoser.dashboard_backend.database.Message;
import dev.joemoser.dashboard_backend.database.MessageDatabaseService;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController
{
    private final MessageDatabaseService messageDatabaseService;

    public MessageController(MessageDatabaseService messageDatabaseService)
    {
        this.messageDatabaseService = messageDatabaseService;
    }

    @GetMapping("/latest/{type}")
    public ResponseEntity<Message> getLatestByType(@PathVariable String type)
    {
        return messageDatabaseService.getLatestByType(type)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Message>> getByType(@PathVariable String type)
    {
        return ResponseEntity.ok(messageDatabaseService.getMessagesByType(type));
    }
}
