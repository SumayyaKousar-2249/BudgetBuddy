package com.fullStack.expenseTracker.services.impls;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.reponses.CategoryBudgetResponseDto;
import com.fullStack.expenseTracker.dto.requests.CategoryBudgetRequestDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.models.CategoryBudget;
import com.fullStack.expenseTracker.repository.CategoryBudgetRepository;
import com.fullStack.expenseTracker.repository.TransactionRepository;
import com.fullStack.expenseTracker.services.CategoryBudgetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@Slf4j
public class CategoryBudgetServiceImpl implements CategoryBudgetService {

    @Autowired
    private CategoryBudgetRepository categoryBudgetRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public ResponseEntity<ApiResponseDto<?>> createOrUpdateCategoryBudget(CategoryBudgetRequestDto dto) {
        try {
            Optional<CategoryBudget> existing = categoryBudgetRepository
                    .findByUserIdAndCategoryIdAndMonthAndYear(
                            dto.getUserId(), dto.getCategoryId(), dto.getMonth(), dto.getYear());

            CategoryBudget budget = existing.orElseGet(CategoryBudget::new);
            budget.setUserId(dto.getUserId());
            budget.setCategoryId(dto.getCategoryId());
            budget.setCategoryName(dto.getCategoryName());
            budget.setAmount(dto.getAmount());
            budget.setMonth(dto.getMonth());
            budget.setYear(dto.getYear());
            categoryBudgetRepository.save(budget);

            return ResponseEntity.ok(new ApiResponseDto<>(ApiResponseStatus.SUCCESS, HttpStatus.OK,
                    "Category budget saved successfully!"));
        } catch (Exception e) {
            log.error("Failed to save category budget: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ApiResponseDto<>(ApiResponseStatus.FAILED, HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to save category budget."));
        }
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getCategoryBudgets(Long userId, int month, int year) {
        List<CategoryBudget> budgets = categoryBudgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        List<CategoryBudgetResponseDto> response = budgets.stream()
                .map(b -> buildResponseDto(b, month, year))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponseDto<>(ApiResponseStatus.SUCCESS, HttpStatus.OK, response));
    }

    @Override
    @Transactional
    public ResponseEntity<ApiResponseDto<?>> deleteCategoryBudget(Long userId, Integer categoryId, int month, int year) {
        categoryBudgetRepository.deleteByUserIdAndCategoryIdAndMonthAndYear(userId, categoryId, month, year);
        return ResponseEntity.ok(new ApiResponseDto<>(ApiResponseStatus.SUCCESS, HttpStatus.OK,
                "Category budget deleted successfully!"));
    }

    private CategoryBudgetResponseDto buildResponseDto(CategoryBudget b, int month, int year) {
        // Look up actual spending for this category/user/month
        Double spent = null;
        try {
            // We need email — use a workaround: fetch by userId via TransactionRepository
            // The TransactionRepository has findTotalByUserAndCategory by email; use
            // a placeholder we resolve via userId directly from the transaction query
            // Since we only have category+userId here, use the categoryId-based query
            spent = transactionRepository.findTotalByCategoryIdAndUserIdAndMonthAndYear(
                    b.getCategoryId(), b.getUserId(), month, year);
        } catch (Exception ignored) {}

        double spentAmount = spent != null ? spent : 0.0;
        double pct = b.getAmount() > 0 ? (spentAmount / b.getAmount()) * 100 : 0;
        String alert = pct >= 100 ? "EXCEEDED" : pct >= 80 ? "WARNING" : "NORMAL";

        return new CategoryBudgetResponseDto(
                b.getId(), b.getCategoryId(), b.getCategoryName(),
                b.getAmount(), spentAmount,
                Math.round(pct * 10.0) / 10.0,
                b.getMonth(), b.getYear(), alert);
    }
}
