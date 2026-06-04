package dev.joemoser.dashboard_backend.database;

import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class StringService 
{
    private final StringRepository stringRepo;

    public StringService(StringRepository stringRepo)
    {
        this.stringRepo = stringRepo;
    }

    public void saveString(StringObj string)
    {
        stringRepo.save(string);
    }

    public Optional<StringObj> getString(Long id)
    {
        return stringRepo.findById(id);
    }
}
