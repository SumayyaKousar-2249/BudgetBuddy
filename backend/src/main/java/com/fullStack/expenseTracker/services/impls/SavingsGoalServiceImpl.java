package com.fullStack.expenseTracker.services.impls;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.reponses.SavingsGoalResponseDto;
import com.fullStack.expenseTracker.dto.requests.SavingsGoalRequestDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.models.SavingsGoal;
import com.fullStack.expenseTracker.repository.SavingsGoalRepository;
import com.fullStack.expenseTracker.services.SavingsGoalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class SavingsGoalServiceImpl implements SavingsGoalService {

    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    @Override
    public ResponseEntity<ApiResponseDto<?>> createGoal(SavingsGoalRequestDto dto) {
        try {
            SavingsGoal goal = SavingsGoal.builder()
                    .userId(dto.getUserId())
                    .goalName(dto.getGoalName())
                    .targetAmount(dto.getTargetAmount())
                    .savedAmount(dto.getSavedAmount() != null ? dto.getSavedAmount() : 0.0)
                    .targetDate(dto.getTargetDate())
                    .createdDate(LocalDate.now())
                    .description(dto.getDescription())
                    .status("ACTIVE")
                    .build();
            savingsGoalRepository.save(goal);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new ApiResponseDto<>(ApiResponseStatus.SUCCESS, HttpStatus.CREATED, "Savings goal created successfully!"));
        } catch (Exception e) {
            log.error("Failed to create savings goal: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ApiResponseDto<>(ApiResponseStatus.FAILED, HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create savings goal."));
        }
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> updateGoal(Long goalId, SavingsGoalRequestDto dto) {
        return savingsGoalRepository.findById(goalId).<ResponseEntity<ApiResponseDto<?>>>map(goal -> {
            goal.setGoalName(dto.getGoalName());
            goal.setTargetAmount(dto.getTargetAmount());
            if (dto.getSavedAmount() != null) goal.setSavedAmount(dto.getSavedAmount());
            goal.setTargetDate(dto.getTargetDate());
            goal.setDescription(dto.getDescription());
            if (goal.getSavedAmount() >= goal.getTargetAmount()) goal.setStatus("COMPLETED");
            savingsGoalRepository.save(goal);
            return ResponseEntity.ok(new ApiResponseDto<>(ApiResponseStatus.SUCCESS, HttpStatus.OK, (Object)"Savings goal updated successfully!"));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiResponseDto<>(ApiResponseStatus.FAILED, HttpStatus.NOT_FOUND, (Object)"Goal not found.")));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> deleteGoal(Long goalId) {
        if (!savingsGoalRepository.existsById(goalId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponseDto<>(ApiResponseStatus.FAILED, HttpStatus.NOT_FOUND, "Goal not found."));
        }
        savingsGoalRepository.deleteById(goalId);
        return ResponseEntity.ok(new ApiResponseDto<>(ApiResponseStatus.SUCCESS, HttpStatus.OK, "Savings goal deleted successfully!"));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getGoalsByUser(Long userId) {
        List<SavingsGoal> goals = savingsGoalRepository.findByUserIdOrderByCreatedDateDesc(userId);
        List<SavingsGoalResponseDto> response = goals.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponseDto<>(ApiResponseStatus.SUCCESS, HttpStatus.OK, response));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> addToSavings(Long goalId, double amount) {
        return savingsGoalRepository.findById(goalId).<ResponseEntity<ApiResponseDto<?>>>map(goal -> {
            goal.setSavedAmount(goal.getSavedAmount() + amount);
            if (goal.getSavedAmount() >= goal.getTargetAmount()) {
                goal.setSavedAmount(goal.getTargetAmount());
                goal.setStatus("COMPLETED");
            }
            savingsGoalRepository.save(goal);
            return ResponseEntity.ok(new ApiResponseDto<>(ApiResponseStatus.SUCCESS, HttpStatus.OK, (Object) toResponseDto(goal)));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiResponseDto<>(ApiResponseStatus.FAILED, HttpStatus.NOT_FOUND, (Object)"Goal not found.")));
    }

    private SavingsGoalResponseDto toResponseDto(SavingsGoal goal) {
        double pct = goal.getTargetAmount() > 0
                ? Math.min(100.0, (goal.getSavedAmount() / goal.getTargetAmount()) * 100)
                : 0;
        long daysRemaining = goal.getTargetDate() != null
                ? ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate())
                : 0;
        String estimated = estimateCompletion(goal);
        return new SavingsGoalResponseDto(
                goal.getGoalId(), goal.getGoalName(), goal.getTargetAmount(),
                goal.getSavedAmount(), goal.getTargetDate(), goal.getCreatedDate(),
                goal.getDescription(), goal.getStatus(),
                Math.round(pct * 10.0) / 10.0, daysRemaining, estimated);
    }

    private String estimateCompletion(SavingsGoal goal) {
        double remaining = goal.getTargetAmount() - goal.getSavedAmount();
        if (remaining <= 0) return "Goal achieved!";
        if (goal.getCreatedDate() == null) return "N/A";
        long daysSinceCreation = ChronoUnit.DAYS.between(goal.getCreatedDate(), LocalDate.now());
        if (daysSinceCreation <= 0 || goal.getSavedAmount() <= 0) return "Keep saving to see estimate";
        double dailyRate = goal.getSavedAmount() / daysSinceCreation;
        if (dailyRate <= 0) return "Keep saving to see estimate";
        long daysNeeded = (long) Math.ceil(remaining / dailyRate);
        LocalDate estimated = LocalDate.now().plusDays(daysNeeded);
        return "~" + estimated.toString();
    }
}
