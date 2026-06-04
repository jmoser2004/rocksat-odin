package dev.joemoser.dashboard_backend.database;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class MessageDatabaseService
{
    private final MessageRepo repo;

    public MessageDatabaseService(MessageRepo repo)
    {
        this.repo = repo;
    }

    public void saveMessage(Message message)
    {
        repo.save(message);
    }

    public void saveManyMessages(List<Message> messages)
    {
        repo.saveAll(messages);
    }

    public Optional<Message> getMessageById(Long id)
    {
        return repo.findById(id);
    }

    public List<Message> getMessagesByMessageId(String messageId)
    {
        return repo.findByMessageId(messageId);
    }

    public List<Message> getMessagesByType(String type)
    {
        return repo.findByType(type);
    }

    public List<Message> getMessagesByTimestamp(String timestamp)
    {
        return repo.findByTimestamp(timestamp);
    }

    public Optional<Message> getLatestByType(String type)
    {
        return repo.findTopByTypeOrderByIdDesc(type);
    }
}
