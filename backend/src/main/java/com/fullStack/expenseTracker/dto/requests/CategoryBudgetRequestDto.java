package com.fullStack.expenseTracker.dto.requests;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryBudgetRequestDto {
    @NotNull
    private Long userId;
    @NotNull
    private Integer categoryId;
    private String categoryName;
    @NotNull
    private Double amount;
    @NotNull
    private Integer month;
    @NotNull
    private Integer year;
}
