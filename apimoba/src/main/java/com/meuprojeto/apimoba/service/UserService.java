package com.meuprojeto.apimoba.service;

import com.meuprojeto.apimoba.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.meuprojeto.apimoba.entity.User;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public User create(User user) {

        if(user.getEmail() == null) {
            throw new RuntimeException("Email obrigatório");
        }

        return repository.save(user);
    }
}
