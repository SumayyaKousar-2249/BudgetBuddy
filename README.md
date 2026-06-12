# Personal Finance Tracker

A full-stack personal finance management application that helps users track income and expenses, manage budgets, categorize transactions, and visualize financial insights through interactive dashboards.

## Features

* User Registration and Login Authentication
* Secure JWT-based Authorization
* Income and Expense Tracking
* Category-wise Transaction Management
* Budget Planning and Monitoring
* Saved Transactions for Recurring Entries
* Financial Reports and Analytics
* Interactive Dashboard with Charts
* User Profile Management
* Responsive User Interface

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring Security
* JWT Authentication
* MySQL
* Maven

### Frontend

* React.js
* JavaScript
* HTML
* CSS

### Database

* MySQL

### Tools

* Git
* GitHub
* VS Code

## Architecture

The application follows a layered architecture:

* Controller Layer – Handles API requests and responses
* Service Layer – Contains business logic
* Repository Layer – Manages database operations
* Database Layer – Stores user and transaction data

## Key Functionalities

### Authentication

* User Registration
* User Login
* Password Reset
* JWT-based Session Management

### Transaction Management

* Add Income and Expense Transactions
* Edit Existing Transactions
* Delete Transactions
* Filter and Search Transactions

### Budget Management

* Create Monthly Budgets
* Monitor Spending Against Budget
* Budget Tracking and Alerts

### Reports and Analytics

* Monthly Income vs Expense Analysis
* Category-wise Expense Distribution
* Financial Summary Dashboard

## Project Structure

```text
backend/
├── controllers
├── services
├── repository
├── security
├── models
├── dto
└── resources

frontend/
├── src
├── components
├── pages
├── hooks
└── services
```

## Installation and Setup

### Clone the Repository

```bash
git clone https://github.com/LochanaGunaganti/Finance-Tracker.git
```

### Backend Setup

```bash
cd backend
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend/frontend
npm install
npm start
```


## Learning Outcomes

Through this project, I gained practical experience in:

* Full-Stack Application Development
* REST API Design
* Spring Boot Architecture
* Authentication and Authorization
* Database Design and Optimization
* Frontend-Backend Integration
* Financial Data Visualization

## Future Enhancements

* Email Notifications
* Export Reports to PDF
* Multi-Currency Support
* Mobile Responsive Improvements
* Cloud Deployment

## Author

Gunaganti Lochana

GitHub: https://github.com/LochanaGunaganti
