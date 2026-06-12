package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecentTransactionDto {
    private Long transactionId;
    private double amount;
    private String date;
    private String description;
    private String categoryName;
    private int transactionTypeId;
    private String transactionTypeName;
}
