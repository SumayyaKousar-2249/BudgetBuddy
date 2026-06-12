-- Run this in MySQL Workbench or the mysql CLI before starting the app.
-- Adjust the password on the IDENTIFIED BY line if your root password is different.

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS expensetracker
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 2. (Optional) Create a dedicated app user instead of using root
-- CREATE USER IF NOT EXISTS 'expenseuser'@'localhost' IDENTIFIED BY 'ExpensePass123!';
-- GRANT ALL PRIVILEGES ON expensetracker.* TO 'expenseuser'@'localhost';
-- FLUSH PRIVILEGES;

-- 3. Verify
SHOW DATABASES LIKE 'expensetracker';
