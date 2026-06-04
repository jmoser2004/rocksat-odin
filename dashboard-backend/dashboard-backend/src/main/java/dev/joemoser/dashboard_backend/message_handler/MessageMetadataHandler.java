package dev.joemoser.dashboard_backend.message_handler;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class MessageMetadataHandler
{
    private final ObjectMapper objectMapper;

    public MessageMetadataHandler(ObjectMapper objectMapper)
    {
        this.objectMapper = objectMapper;
    }

    public String[] getMessage(String rawMessage)
    {
        try
        {
            MessageWithMetadata messageWithMetadata = objectMapper.readValue(rawMessage, MessageWithMetadata.class);
            return new String[] {messageWithMetadata.getMessage(), messageWithMetadata.getTimestamp(), messageWithMetadata.getId()};
        }
        catch(Exception e)
        {
            System.out.println(e.getMessage());
            return new String[] {"\n\nError parsing object\n\n", "", ""};
        }
    }
}
