package dev.joemoser.dashboard_backend.database;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Message
{
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(name="message_id")
    private String messageId;

    @Column
    private String type;

    @Column(columnDefinition="TEXT")
    private String content;

    @Column
    private String timestamp;

    public Message(String messageId, String type, String content, String timestamp)
    {
        this.messageId = messageId;
        this.type = type;
        this.content = content;
        this.timestamp = timestamp;
    }
}
