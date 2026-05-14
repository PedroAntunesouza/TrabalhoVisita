package com.meuprojeto.apimoba.controller;

import com.meuprojeto.apimoba.entity.PlaceVisited;
import com.meuprojeto.apimoba.entity.User;
import com.meuprojeto.apimoba.service.PlaceVisitedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/visit")
public class PlaceVisitedController {

    @Autowired
    private PlaceVisitedService service;

    @PostMapping("/create")
    public ResponseEntity<PlaceVisited> create(@RequestBody PlaceVisited placeVisited,
                                               @RequestParam String email) {
        return ResponseEntity.ok(service.createVisit(placeVisited, email));
    }

    @GetMapping("/returnAll")
    public ResponseEntity<List<PlaceVisited>> returnAll(){
        return ResponseEntity.ok(service.returnAll());
    }
}
