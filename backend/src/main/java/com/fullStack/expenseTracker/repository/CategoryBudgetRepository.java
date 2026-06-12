package com.fullStack.expenseTracker.repository;

import com.fullStack.expenseTracker.models.CategoryBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {
    List<CategoryBudget> findByUserIdAndMonthAndYear(Long userId, int month, int year);
    Optional<CategoryBudget> findByUserIdAndCategoryIdAndMonthAndYear(Long userId, Integer categoryId, int month, int year);
    void deleteByUserIdAndCategoryIdAndMonthAndYear(Long userId, Integer categoryId, int month, int year);
}
