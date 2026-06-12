package com.fullStack.expenseTracker.controllers;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.services.FinancialHealthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/mywallet/health")
public class FinancialHealthController {

    @Autowired
    private FinancialHealthService financialHealthService;

    @GetMapping("/score")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getScore(@Param("userId") Long userId,
                                                       @Param("email") String email,
                                                       @Param("month") int month,
                                                       @Param("year") int year) {
        return financialHealthService.getHealthScore(userId, email, month, year);
    }
}
