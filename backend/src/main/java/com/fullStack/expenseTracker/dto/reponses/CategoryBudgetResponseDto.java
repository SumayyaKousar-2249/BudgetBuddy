package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryBudgetResponseDto {
    private Long id;
    private Integer categoryId;
    private String categoryName;
    private double budgetAmount;
    private double spentAmount;
    private double utilizationPercentage;
    private int month;
    private int year;
    private String alertLevel; // NORMAL | WARNING | EXCEEDED
}
