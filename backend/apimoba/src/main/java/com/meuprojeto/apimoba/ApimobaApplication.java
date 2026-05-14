package com.meuprojeto.apimoba;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class ApimobaApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApimobaApplication.class, args);

	}


	//pro horario no banco nao zoar (3 horas pra tras KAKAKA)
	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
	}

}
