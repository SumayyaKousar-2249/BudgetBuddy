package com.fullStack.expenseTracker.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SavingsGoalRequestDto {
    @NotNull
    private Long userId;

    @NotBlank
    private String goalName;

    @NotNull
    private Double targetAmount;

    private Double savedAmount;

    @NotNull
    private LocalDate targetDate;

    private String description;
}
