package com.fullStack.expenseTracker.controllers;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.CategoryBudgetRequestDto;
import com.fullStack.expenseTracker.services.CategoryBudgetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/mywallet/categorybudget")
public class CategoryBudgetController {

    @Autowired
    private CategoryBudgetService categoryBudgetService;

    @PostMapping("/save")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> saveOrUpdate(@RequestBody @Valid CategoryBudgetRequestDto dto) {
        return categoryBudgetService.createOrUpdateCategoryBudget(dto);
    }

    @GetMapping("/get")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> get(@Param("userId") Long userId,
                                                  @Param("month") int month,
                                                  @Param("year") int year) {
        return categoryBudgetService.getCategoryBudgets(userId, month, year);
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> delete(@Param("userId") Long userId,
                                                     @Param("categoryId") Integer categoryId,
                                                     @Param("month") int month,
                                                     @Param("year") int year) {
        return categoryBudgetService.deleteCategoryBudget(userId, categoryId, month, year);
    }
}
