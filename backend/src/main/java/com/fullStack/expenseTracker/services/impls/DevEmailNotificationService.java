package com.fullStack.expenseTracker.services.impls;

import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Local-dev stub for NotificationService.
 *
 * Activated when Spring profile "local" is active (set in application-local.properties).
 * Replaces the real EmailNotificationService so the app starts without a working SMTP
 * server. Verification codes are printed to the console — copy the code from the log
 * and paste it into the verification screen.
 */
@Component
@Profile("local")
public class DevEmailNotificationService implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(DevEmailNotificationService.class);

    @Override
    public void sendUserRegistrationVerificationEmail(User user) {
        logger.info("========================================================");
        logger.info("[DEV MODE] Registration verification email skipped.");
        logger.info("[DEV MODE] User:              {}", user.getEmail());
        logger.info("[DEV MODE] Verification code: {}", user.getVerificationCode());
        logger.info("========================================================");
    }

    @Override
    public void sendForgotPasswordVerificationEmail(User user) {
        logger.info("========================================================");
        logger.info("[DEV MODE] Password-reset verification email skipped.");
        logger.info("[DEV MODE] User:              {}", user.getEmail());
        logger.info("[DEV MODE] Verification code: {}", user.getVerificationCode());
        logger.info("========================================================");
    }
}
