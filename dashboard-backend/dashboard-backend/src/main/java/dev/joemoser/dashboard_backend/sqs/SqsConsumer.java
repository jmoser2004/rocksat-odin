package dev.joemoser.dashboard_backend.sqs;

import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Component;

import dev.joemoser.dashboard_backend.message_handler.MessageService;
import io.awspring.cloud.sqs.annotation.SqsListener;

@Component
public class SqsConsumer
{
    private final AtomicLong messageCount = new AtomicLong(0);
    private final MessageService messageService;

    public SqsConsumer(MessageService messageService)
    {
        this.messageService = messageService;
    }

    @SqsListener("Cloudloop_Data_MO")
    public void receive(String rawMessage)
    {
        messageService.handleMessage(rawMessage, messageCount.incrementAndGet());
    }
}
