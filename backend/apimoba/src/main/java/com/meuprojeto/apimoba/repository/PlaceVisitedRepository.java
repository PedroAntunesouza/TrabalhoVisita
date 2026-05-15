package com.meuprojeto.apimoba.repository;

import com.meuprojeto.apimoba.entity.PlaceVisited;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlaceVisitedRepository extends JpaRepository<PlaceVisited, Long> {
    @Query("SELECT p FROM PlaceVisited p WHERE p.user.email = :email")
    List<PlaceVisited> findByUserEmail(@Param("email") String email);

}
