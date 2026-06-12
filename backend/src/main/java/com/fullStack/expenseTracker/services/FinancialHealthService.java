package com.fullStack.expenseTracker.services;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface FinancialHealthService {
    ResponseEntity<ApiResponseDto<?>> getHealthScore(Long userId, String email, int month, int year);
}
