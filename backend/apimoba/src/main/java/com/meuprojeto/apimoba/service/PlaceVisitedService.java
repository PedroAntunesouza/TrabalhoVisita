package com.meuprojeto.apimoba.service;

import com.meuprojeto.apimoba.entity.PlaceVisited;
import com.meuprojeto.apimoba.entity.User;
import com.meuprojeto.apimoba.repository.PlaceVisitedRepository;
import com.meuprojeto.apimoba.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlaceVisitedService {

    @Autowired
    private PlaceVisitedRepository repository;

    @Autowired
    private UserRepository userRepository;

    public PlaceVisited createVisit(PlaceVisited placeVisited, String email) {
        if (placeVisited.getLocalName() == null) {
            throw new RuntimeException("Nome do local obrigatório");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        placeVisited.setUser(user);
        return repository.save(placeVisited);
    }

    public List<PlaceVisited> returnAll(){
        return repository.findAll();
    }
}
