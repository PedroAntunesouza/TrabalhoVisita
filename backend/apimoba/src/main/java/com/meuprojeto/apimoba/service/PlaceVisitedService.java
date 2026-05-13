package com.meuprojeto.apimoba.service;

import com.meuprojeto.apimoba.entity.PlaceVisited;
import com.meuprojeto.apimoba.repository.PlaceVisitedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlaceVisitedService {

    @Autowired
    private PlaceVisitedRepository repository;

    public PlaceVisited createVisit(PlaceVisited placeVisited){

        if(placeVisited.getLocalName() == null){
            throw new RuntimeException("Nome do local obrigatório");
        }
        return repository.save(placeVisited);
    }

    public List<PlaceVisited> returnAll(){
        return repository.findAll();
    }
}
