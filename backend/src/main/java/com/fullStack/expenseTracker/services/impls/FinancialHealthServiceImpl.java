package com.fullStack.expenseTracker.services.impls;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.reponses.FinancialHealthResponseDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.models.Budget;
import com.fullStack.expenseTracker.repository.BudgetRepository;
import com.fullStack.expenseTracker.repository.TransactionRepository;
import com.fullStack.expenseTracker.services.FinancialHealthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class FinancialHealthServiceImpl implements FinancialHealthService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Override
    public ResponseEntity<ApiResponseDto<?>> getHealthScore(Long userId, String email, int month, int year) {
        try {
            // ── Fetch raw data ───────────────────────────────────────────
            Double rawIncome  = transactionRepository.findTotalByUserAndTransactionType(userId, 2, month, year);
            Double rawExpense = transactionRepository.findTotalByUserAndTransactionType(userId, 1, month, year);
            double income  = rawIncome  != null ? rawIncome  : 0;
            double expense = rawExpense != null ? rawExpense : 0;
            double total   = income + expense;

            Budget budget = budgetRepository.findByUserIdAndMonthAndYear(userId, month, (long) year);
            double budgetAmount = budget != null ? budget.getAmount() : 0;

            // ── 1. Savings Rate Score (0–30) ─────────────────────────────
            // Savings rate = (income - expense) / income
            double savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
            int savingsScore;
            if      (savingsRate >= 30) savingsScore = 30;
            else if (savingsRate >= 20) savingsScore = 24;
            else if (savingsRate >= 10) savingsScore = 18;
            else if (savingsRate >= 0)  savingsScore = 10;
            else                        savingsScore = 0;   // spending > income

            // ── 2. Budget Adherence Score (0–25) ─────────────────────────
            double budgetAdherence = 0;
            int budgetScore = 15; // neutral if no budget set
            if (budgetAmount > 0) {
                budgetAdherence = expense <= budgetAmount
                        ? 100.0
                        : Math.max(0, (1 - (expense - budgetAmount) / budgetAmount) * 100);
                if      (budgetAdherence >= 90) budgetScore = 25;
                else if (budgetAdherence >= 75) budgetScore = 20;
                else if (budgetAdherence >= 50) budgetScore = 12;
                else                            budgetScore = 5;
            }

            // ── 3. Expense Ratio Score (0–25) ────────────────────────────
            double expenseRatio = total > 0 ? (expense / total) * 100 : 0;
            int expenseScore;
            if      (expenseRatio <= 40) expenseScore = 25;
            else if (expenseRatio <= 60) expenseScore = 20;
            else if (expenseRatio <= 75) expenseScore = 12;
            else if (expenseRatio <= 90) expenseScore = 6;
            else                         expenseScore = 0;

            // ── 4. Consistency Score (0–20) ──────────────────────────────
            // Reward having both income and expense tracked this month
            int consistencyScore = 0;
            if (income > 0 && expense > 0) consistencyScore = 20;
            else if (income > 0 || expense > 0) consistencyScore = 10;

            // ── Overall ──────────────────────────────────────────────────
            int overall = savingsScore + budgetScore + expenseScore + consistencyScore;
            overall = Math.min(100, Math.max(0, overall));

            String grade = overall >= 85 ? "A" : overall >= 70 ? "B" : overall >= 55 ? "C" : overall >= 40 ? "D" : "F";

            // ── Suggestions ──────────────────────────────────────────────
            List<String> suggestions = buildSuggestions(savingsRate, budgetAdherence, budgetAmount, expenseRatio, income, expense);

            FinancialHealthResponseDto response = new FinancialHealthResponseDto(
                    overall, grade,
                    round(savingsRate), savingsScore,
                    round(budgetAdherence), budgetScore,
                    round(expenseRatio), expenseScore,
                    consistencyScore, suggestions, month, year);

            return ResponseEntity.ok(new ApiResponseDto<>(ApiResponseStatus.SUCCESS, HttpStatus.OK, response));

        } catch (Exception e) {
            log.error("Error calculating financial health score: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ApiResponseDto<>(ApiResponseStatus.FAILED, HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to calculate health score."));
        }
    }

    private List<String> buildSuggestions(double savingsRate, double budgetAdherence,
                                           double budgetAmount, double expenseRatio,
                                           double income, double expense) {
        List<String> s = new ArrayList<>();
        if (income == 0)        s.add("Track your income transactions to get a complete health picture.");
        if (savingsRate < 10)   s.add("Try to save at least 10% of your income each month.");
        if (savingsRate < 20 && savingsRate >= 10) s.add("Great start! Aim to boost savings to 20% for a stronger score.");
        if (budgetAmount == 0)  s.add("Set a monthly budget to improve your budget adherence score.");
        if (budgetAdherence < 75 && budgetAmount > 0) s.add("Your spending exceeded the budget. Review and cut discretionary expenses.");
        if (expenseRatio > 80)  s.add("More than 80% of your money goes to expenses. Look for areas to reduce spending.");
        if (expenseRatio > 60 && expenseRatio <= 80) s.add("Try to keep expenses below 60% of total money flow.");
        if (expense > income && income > 0) s.add("You are spending more than you earn this month. This needs immediate attention.");
        if (s.isEmpty())        s.add("Excellent financial discipline! Keep it up.");
        return s;
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
