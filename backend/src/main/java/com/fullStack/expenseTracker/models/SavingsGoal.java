package com.fullStack.expenseTracker.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "savings_goal")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long goalId;

    private Long userId;

    @Column(nullable = false, length = 100)
    private String goalName;

    private double targetAmount;

    private double savedAmount;

    private LocalDate targetDate;

    private LocalDate createdDate;

    @Column(length = 200)
    private String description;

    /** ACTIVE | COMPLETED | PAUSED */
    @Column(length = 20)
    private String status;
}
