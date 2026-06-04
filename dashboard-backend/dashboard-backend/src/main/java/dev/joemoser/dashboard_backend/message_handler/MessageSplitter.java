package dev.joemoser.dashboard_backend.message_handler;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class MessageSplitter
{
    public List<MessageWrapper> splitRawMessage(String rawMessage)
    {
        Map<String, MessageType> charToType = Map.of(
            "a", MessageType.TIME,
            "b", MessageType.EPDS,
            "c", MessageType.ADS,
            "d", MessageType.AI,
            "e", MessageType.SPEC
        );

        String[] unwrappedMessages = rawMessage.split("\\|");
        List<MessageWrapper> wrappedMessages = new ArrayList<>();

        for(String unwrappedMessage : unwrappedMessages)
            wrappedMessages.add(new MessageWrapper(charToType.get(unwrappedMessage.substring(0, 1)), unwrappedMessage.substring(1)));

        return wrappedMessages;
    }
}
