package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinancialHealthResponseDto {
    private int overallScore;          // 0-100
    private String grade;              // A / B / C / D / F
    private double savingsRate;        // %
    private int savingsRateScore;      // 0-30
    private double budgetAdherence;    // %
    private int budgetAdherenceScore;  // 0-25
    private double expenseRatio;       // expense/income %
    private int expenseRatioScore;     // 0-25
    private int consistencyScore;      // 0-20
    private List<String> suggestions;
    private int month;
    private int year;
}
