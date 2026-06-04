package dev.joemoser.dashboard_backend.database;

import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class MessageService
{
    private final MessageRepository repo;
    
    public MessageService(MessageRepository repo)
    {
        this.repo = repo;
    }

    public void saveMessage(Message message)
    {
        repo.save(message);
    }

    public Optional<Message> getMessage(String id)
    {
        return repo.findById(id);
    }
}
