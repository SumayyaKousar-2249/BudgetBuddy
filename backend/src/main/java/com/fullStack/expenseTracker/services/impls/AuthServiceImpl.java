package com.fullStack.expenseTracker.services.impls;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.dto.requests.ResetPasswordRequestDto;
import com.fullStack.expenseTracker.dto.requests.SignUpRequestDto;
import com.fullStack.expenseTracker.exceptions.*;
import com.fullStack.expenseTracker.factories.RoleFactory;
import com.fullStack.expenseTracker.models.Role;
import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.repository.UserRepository;
import com.fullStack.expenseTracker.services.AuthService;
import com.fullStack.expenseTracker.services.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Component
@Slf4j
public class AuthServiceImpl implements AuthService {

    @Autowired
    UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    RoleFactory roleFactory;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ── Registration — no email verification, user is active immediately ─────

    @Override
    public ResponseEntity<ApiResponseDto<?>> save(SignUpRequestDto signUpRequestDto)
            throws UserAlreadyExistsException, UserServiceLogicException {
        if (userService.existsByUsername(signUpRequestDto.getUserName())) {
            throw new UserAlreadyExistsException("Registration Failed: username is already taken!");
        }
        if (userService.existsByEmail(signUpRequestDto.getEmail())) {
            throw new UserAlreadyExistsException("Registration Failed: email is already taken!");
        }
        try {
            User user = new User(
                    signUpRequestDto.getUserName(),
                    signUpRequestDto.getEmail(),
                    passwordEncoder.encode(signUpRequestDto.getPassword()),
                    null,   // no verification code
                    null,   // no expiry time
                    true,   // enabled immediately
                    determineRoles(signUpRequestDto.getRoles())
            );
            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponseDto<>(
                    ApiResponseStatus.SUCCESS, HttpStatus.CREATED, "Registration successful!"
            ));
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            throw new UserServiceLogicException("Registration failed: Something went wrong!");
        }
    }

    // ── Verification endpoints kept for API compatibility (no-op) ─────────────

    @Override
    public ResponseEntity<ApiResponseDto<?>> verifyRegistrationVerification(String code)
            throws UserVerificationFailedException {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS, HttpStatus.ACCEPTED, "Verification successful!"
        ));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> resendVerificationCode(String email)
            throws UserNotFoundException, UserServiceLogicException {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS, HttpStatus.OK, "Email verification is disabled."
        ));
    }

    // ── Forgot-password flow (still functional) ───────────────────────────────

    @Override
    public ResponseEntity<ApiResponseDto<?>> verifyEmailAndSendForgotPasswordVerificationEmail(String email)
            throws UserServiceLogicException, UserNotFoundException {
        if (!userService.existsByEmail(email)) {
            throw new UserNotFoundException("Verification failed: User not found with email " + email + "!");
        }
        try {
            User user = userService.findByEmail(email);
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiryTime(new Date(System.currentTimeMillis() + 840000));
            userRepository.save(user);

            log.info("==================================================");
            log.info("[DEV] Password-reset code for {}: {}", email, user.getVerificationCode());
            log.info("==================================================");

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(new ApiResponseDto<>(
                    ApiResponseStatus.SUCCESS, HttpStatus.ACCEPTED, "Verification code generated successfully!"
            ));
        } catch (Exception e) {
            log.error("Reset password email verification failed: {}", e.getMessage());
            throw new UserServiceLogicException("Verification failed: Something went wrong!");
        }
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> verifyForgotPasswordVerification(String code)
            throws UserVerificationFailedException, UserServiceLogicException {
        User user = userRepository.findByVerificationCode(code);
        if (user == null) {
            throw new UserVerificationFailedException("Verification failed: invalid verification code!");
        }
        long now = System.currentTimeMillis();
        if (user.getVerificationCodeExpiryTime() != null && now > user.getVerificationCodeExpiryTime().getTime()) {
            throw new UserVerificationFailedException("Verification failed: expired verification code!");
        }
        try {
            user.setVerificationCode(null);
            user.setVerificationCodeExpiryTime(null);
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(new ApiResponseDto<>(
                    ApiResponseStatus.SUCCESS, HttpStatus.ACCEPTED, "Verification successful!"
            ));
        } catch (Exception e) {
            log.error("Reset password verification failed: {}", e.getMessage());
            throw new UserServiceLogicException("Verification failed: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> resetPassword(ResetPasswordRequestDto resetPasswordDto)
            throws UserNotFoundException, UserServiceLogicException {
        if (!userService.existsByEmail(resetPasswordDto.getEmail())) {
            throw new UserNotFoundException("User not found with email " + resetPasswordDto.getEmail());
        }
        try {
            User user = userService.findByEmail(resetPasswordDto.getEmail());
            if (resetPasswordDto.getCurrentPassword() != null && !resetPasswordDto.getCurrentPassword().isEmpty()) {
                if (!passwordEncoder.matches(resetPasswordDto.getCurrentPassword(), user.getPassword())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponseDto<>(
                            ApiResponseStatus.FAILED, HttpStatus.BAD_REQUEST,
                            "Reset password not successful: current password is incorrect!!"
                    ));
                }
            }
            user.setPassword(passwordEncoder.encode(resetPasswordDto.getNewPassword()));
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponseDto<>(
                    ApiResponseStatus.SUCCESS, HttpStatus.CREATED, "Reset successful: Password has been successfully reset!"
            ));
        } catch (Exception e) {
            log.error("Resetting password failed: {}", e.getMessage());
            throw new UserServiceLogicException("Failed to reset your password: Try again later!");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String generateVerificationCode() {
        return String.valueOf((int) (Math.random() * 1000000));
    }

    private Set<Role> determineRoles(Set<String> strRoles) throws RoleNotFoundException {
        Set<Role> roles = new HashSet<>();
        if (strRoles == null) {
            roles.add(roleFactory.getInstance("user"));
        } else {
            for (String role : strRoles) {
                roles.add(roleFactory.getInstance(role));
            }
        }
        return roles;
    }
}
