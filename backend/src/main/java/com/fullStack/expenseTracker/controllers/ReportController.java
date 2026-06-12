package com.fullStack.expenseTracker.controllers;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.reponses.RecentTransactionDto;
import com.fullStack.expenseTracker.services.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/mywallet/report")
public class ReportController {

    @Autowired
    ReportService reportService;

    @Autowired
    com.fullStack.expenseTracker.repository.TransactionRepository transactionRepository;


    @GetMapping("/getTotalIncomeOrExpense")
    @PreAuthorize(("hasRole('ROLE_USER')"))
    public ResponseEntity<ApiResponseDto<?>> getTotalIncomeOrExpense(@Param("userId") Long userId,
                                                                     @Param("transactionTypeId") int transactionTypeId,
                                                                     @Param("month") int month,
                                                                     @Param("year") int year) {
        return reportService.getTotalByTransactionTypeAndUser(userId, transactionTypeId, month, year);
    }

    @GetMapping("/getTotalNoOfTransactions")
    @PreAuthorize(("hasRole('ROLE_USER')"))
    public ResponseEntity<ApiResponseDto<?>> getTotalNoOfTransactions(@Param("userId") Long userId,
                                                                      @Param("month") int month,
                                                                      @Param("year") int year) {
        return reportService.getTotalNoOfTransactionsByUser(userId, month, year);
    }

    @GetMapping("/getTotalByCategory")
    @PreAuthorize(("hasRole('ROLE_USER')"))
    public ResponseEntity<ApiResponseDto<?>> getTotalByCategory(@Param("email") String email,
                                                                @Param("categoryId") int categoryId,
                                                                @Param("month") int month,
                                                                @Param("year") int year) {
        return reportService.getTotalExpenseByCategoryAndUser(email, categoryId, month, year);
    }

    @GetMapping("/getMonthlySummaryByUser")
    @PreAuthorize(("hasRole('ROLE_USER')"))
    public ResponseEntity<ApiResponseDto<?>> getMonthlySummaryByUser(@Param("email") String email) {
        return reportService.getMonthlySummaryByUser(email);
    }

    @GetMapping("/getRecentTransactions")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getRecentTransactions(@Param("userId") Long userId,
                                                                    @Param("limit") int limit) {
        List<Object[]> rows = transactionRepository.findRecentTransactionsByUserId(userId, limit);
        List<RecentTransactionDto> result = rows.stream().map(r -> new RecentTransactionDto(
                ((Number) r[0]).longValue(),
                ((Number) r[1]).doubleValue(),
                r[2] != null ? r[2].toString() : "",
                r[3] != null ? r[3].toString() : "",
                r[4] != null ? r[4].toString() : "",
                r[6] != null ? ((Number) r[6]).intValue() : 0,
                r[7] != null ? r[7].toString() : ""
        )).collect(Collectors.toList());
        return ResponseEntity.ok(new com.fullStack.expenseTracker.dto.reponses.ApiResponseDto<>(
                com.fullStack.expenseTracker.enums.ApiResponseStatus.SUCCESS,
                org.springframework.http.HttpStatus.OK, result));
    }

}
