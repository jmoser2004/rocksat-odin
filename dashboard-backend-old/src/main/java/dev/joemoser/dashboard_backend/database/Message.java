package dev.joemoser.dashboard_backend.database;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message
{
    @Id
    private String id;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition="jsonb")
    private String receivedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition="jsonb")
    private String identity;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition="jsonb")
    private String message;

    private String signature;
}
