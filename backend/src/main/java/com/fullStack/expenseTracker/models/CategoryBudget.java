package com.fullStack.expenseTracker.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "category_budget",
        uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "categoryId", "month", "year"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Integer categoryId;
    private String categoryName;
    private double amount;
    private int month;
    private int year;
}
