package com.fullStack.expenseTracker.controllers;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.SavingsGoalRequestDto;
import com.fullStack.expenseTracker.services.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/mywallet/goals")
public class SavingsGoalController {

    @Autowired
    private SavingsGoalService savingsGoalService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> createGoal(@RequestBody @Valid SavingsGoalRequestDto dto) {
        return savingsGoalService.createGoal(dto);
    }

    @PutMapping("/{goalId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> updateGoal(@PathVariable Long goalId,
                                                        @RequestBody @Valid SavingsGoalRequestDto dto) {
        return savingsGoalService.updateGoal(goalId, dto);
    }

    @DeleteMapping("/{goalId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> deleteGoal(@PathVariable Long goalId) {
        return savingsGoalService.deleteGoal(goalId);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getGoalsByUser(@Param("userId") Long userId) {
        return savingsGoalService.getGoalsByUser(userId);
    }

    @PutMapping("/{goalId}/deposit")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> addToSavings(@PathVariable Long goalId,
                                                          @Param("amount") double amount) {
        return savingsGoalService.addToSavings(goalId, amount);
    }
}
