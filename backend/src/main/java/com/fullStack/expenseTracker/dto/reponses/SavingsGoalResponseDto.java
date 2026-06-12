package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SavingsGoalResponseDto {
    private Long goalId;
    private String goalName;
    private double targetAmount;
    private double savedAmount;
    private LocalDate targetDate;
    private LocalDate createdDate;
    private String description;
    private String status;
    private double progressPercentage;
    private long daysRemaining;
    private String estimatedCompletion;
}
