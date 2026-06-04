package dev.joemoser.dashboard_backend.database;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StringRepository extends JpaRepository<StringObj, Long>{
    
}
