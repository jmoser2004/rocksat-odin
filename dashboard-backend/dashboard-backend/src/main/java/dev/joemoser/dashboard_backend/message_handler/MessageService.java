package dev.joemoser.dashboard_backend.message_handler;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import org.springframework.stereotype.Service;

import dev.joemoser.dashboard_backend.database.Message;
import dev.joemoser.dashboard_backend.database.MessageDatabaseService;
import dev.joemoser.dashboard_backend.websocket.WebSocketService;

@Service
public class MessageService
{
    private final MessageMetadataHandler messageMetadataHandler;
    private final MessageSplitter messageSplitter;
    private final MessageDatabaseService messageDatabaseService;
    private final WebSocketService webSocketService;

    public MessageService(MessageMetadataHandler messageMetadataHandler, MessageSplitter messageSplitter, MessageDatabaseService messageDatabaseService, WebSocketService webSocketService)
    {
        this.messageMetadataHandler = messageMetadataHandler;
        this.messageSplitter = messageSplitter;
        this.messageDatabaseService = messageDatabaseService;
        this.webSocketService = webSocketService;
    }

    public boolean handleMessage(String rawMessage, long messageCount)
    {
        /*
        String decodedMessage = new String(Base64.getDecoder().decode(rawMessage));

        String[] strippedMessageGroup = messageMetadataHandler.getMessage(decodedMessage);
        String strippedMessage = strippedMessageGroup[0];
        String timestamp = strippedMessageGroup[1];

        List<MessageWrapper> wrappedMessages = messageSplitter.splitRawMessage(strippedMessage);
        List<Message> messages = new ArrayList<>();

        String id = strippedMessageGroup[2];

        for(MessageWrapper m : wrappedMessages)
        {
            System.out.println(messageCount + "\n" + m.getType() + "\n" + m.getContent() + "\n\n\n");
            Message message = new Message(id, m.getType().toString(), m.getContent(), timestamp);
            messages.add(message);
            System.out.println("message content: " + message.getContent());
            webSocketService.sendMessage(message.toString());
        }

        messageDatabaseService.saveManyMessages(messages);

        return true;
        */

        String[] messageSplit = messageMetadataHandler.getMessage(rawMessage);
        String encodedMessage = messageSplit[0];
        String decodedMessage = new String(Base64.getDecoder().decode(encodedMessage));
        String timestamp = messageSplit[1];
        String id = messageSplit[2];

        List<MessageWrapper> wrappedMessages = messageSplitter.splitRawMessage(decodedMessage);
        List<Message> messages = new ArrayList<>();

        System.out.println("Time: " + timestamp);
        for(MessageWrapper mw : wrappedMessages)
        {
            System.out.print("\n\nMessage " + messageCount + ": " + mw.getType() + " - " + mw.getContent() + "\n\n");
            Message m = new Message(id, mw.getType().toString(), mw.getContent(), timestamp);
            messages.add(m);
            webSocketService.sendMessage(m.toString());
        }

        messageDatabaseService.saveManyMessages(messages);

        return true;
    }
}
