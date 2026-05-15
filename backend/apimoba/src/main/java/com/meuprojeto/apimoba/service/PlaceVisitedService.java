package com.meuprojeto.apimoba.service;

import com.meuprojeto.apimoba.entity.PlaceVisited;
import com.meuprojeto.apimoba.entity.User;
import com.meuprojeto.apimoba.repository.PlaceVisitedRepository;
import com.meuprojeto.apimoba.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
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

        placeVisited.setDate(
                LocalDateTime.now(ZoneId.of("America/Sao_Paulo")));

        return repository.save(placeVisited);
    }

    public List<PlaceVisited> returnAll() {
        return repository.findAll();
    }

    public List<PlaceVisited> findByEmail(String email) {
        return repository.findByUserEmail(email);
    }

    public PlaceVisited updateVisit(Long id, PlaceVisited data) {
        PlaceVisited existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visita não encontrada"));

        if (data.getLocalName() != null)
            existing.setLocalName(data.getLocalName());
        if (data.getObservation() != null)
            existing.setObservation(data.getObservation());
        if (data.getLatitude() != 0)
            existing.setLatitude(data.getLatitude());
        if (data.getLongitude() != 0)
            existing.setLongitude(data.getLongitude());
        if (data.getUriImagem() != null)
            existing.setUriImagem(data.getUriImagem());

        return repository.save(existing);
    }

    public void deleteVisit(Long id) {
        repository.deleteById(id);
    }
}
