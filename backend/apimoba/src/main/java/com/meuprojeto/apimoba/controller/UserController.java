package com.meuprojeto.apimoba.controller;

import com.meuprojeto.apimoba.entity.User;
import com.meuprojeto.apimoba.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.meuprojeto.apimoba.service.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping
    public User criar(@RequestBody User user) {
        return service.create(user);
    }
}

