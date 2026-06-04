package dev.joemoser.dashboard_backend.sqs;

import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.joemoser.dashboard_backend.database.Message;
import dev.joemoser.dashboard_backend.database.MessageService;
import dev.joemoser.dashboard_backend.database.StringObj;
import dev.joemoser.dashboard_backend.database.StringService;
import dev.joemoser.dashboard_backend.dto.FullMessageDTO;
import dev.joemoser.dashboard_backend.websocket.WebsocketService;
import io.awspring.cloud.sqs.annotation.SqsListener;

@Component
public class SqsConsumer
{
    private final AtomicLong messageCount = new AtomicLong(0);
    private final ObjectMapper objectMapper;
    private final StringService stringService;
    private final WebsocketService websocketService;

    public SqsConsumer(ObjectMapper objectMapper, StringService stringService, WebsocketService websocketService)
    {
        this.objectMapper = objectMapper;
        this.stringService = stringService;
        this.websocketService = websocketService;
    }

    @SqsListener("Cloudloop_Data_MO")
    public void receive(String raw)
    {
        /*
        try
        {
            
            FullMessageDTO fullMessage = objectMapper.readValue(raw, FullMessageDTO.class);
            System.out.println(fullMessage.toString());
            long count = messageCount.incrementAndGet();

            Message message = new Message(fullMessage.getId(), objectMapper.writeValueAsString(fullMessage.getReceivedAt()), objectMapper.writeValueAsString(fullMessage.getIdentity()), objectMapper.writeValueAsString(fullMessage.getMessage()), fullMessage.getSignature());

            System.out.println("\n\n\nMessage: " + message.getId() + "\n" + message.getIdentity() + "\n" + message.getMessage() + "\n\n\n");
            messageService.saveMessage(message);
            websocketService.sendMessage(message);

            System.out.println("Message " + count + ": Full message with id [ " + fullMessage.getId() + " ] received.");
        }
        catch(JsonProcessingException e)
        {
            System.out.println("Error " + e.getMessage());
        } 
        catch(Exception e)
        {
            System.out.println("Error " + e.getMessage());
            throw e;
        }
        */

        try
        {
            System.out.println(raw);
            StringObj saveMe = new StringObj();
            saveMe.setPayload(raw);
            stringService.saveString(saveMe);
            websocketService.sendMessage(raw);
        }
        catch(Exception e)
        {
            System.out.println("Error: " + e.getMessage());
            throw e;
        }
    }
}
