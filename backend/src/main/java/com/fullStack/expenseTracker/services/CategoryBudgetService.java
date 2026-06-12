package com.fullStack.expenseTracker.services;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.CategoryBudgetRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface CategoryBudgetService {
    ResponseEntity<ApiResponseDto<?>> createOrUpdateCategoryBudget(CategoryBudgetRequestDto dto);
    ResponseEntity<ApiResponseDto<?>> getCategoryBudgets(Long userId, int month, int year);
    ResponseEntity<ApiResponseDto<?>> deleteCategoryBudget(Long userId, Integer categoryId, int month, int year);
}
