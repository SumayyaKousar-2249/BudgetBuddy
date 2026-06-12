package com.fullStack.expenseTracker.services;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.SavingsGoalRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface SavingsGoalService {
    ResponseEntity<ApiResponseDto<?>> createGoal(SavingsGoalRequestDto dto);
    ResponseEntity<ApiResponseDto<?>> updateGoal(Long goalId, SavingsGoalRequestDto dto);
    ResponseEntity<ApiResponseDto<?>> deleteGoal(Long goalId);
    ResponseEntity<ApiResponseDto<?>> getGoalsByUser(Long userId);
    ResponseEntity<ApiResponseDto<?>> addToSavings(Long goalId, double amount);
}
