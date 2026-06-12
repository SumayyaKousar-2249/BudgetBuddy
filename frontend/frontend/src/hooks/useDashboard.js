import { useEffect, useState } from "react";
import useCategories from "./useCategories";
import UserService from "../services/userService";
import AuthService from "../services/auth.service";

function useDashboard(currentMonth) {
    const [total_income, setIncome] = useState(0);
    const [total_expense, setExpense] = useState(0);
    const [no_of_transactions, setTransactions] = useState(0);
    const cash_in_hand = total_income > total_expense
        ? Number((total_income - total_expense).toFixed(2))
        : 0;

    const [categories] = useCategories();
    const [categorySummary, setCategorySummary] = useState([]);
    const [budgetAmount, setBudgetAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const generateTransactionSummary = async () => {
        setIsLoading(true);
        const user = AuthService.getCurrentUser();
        if (!user) return;

        try {
            const incomeRes = await UserService.getTotalIncomeOrExpense(user.id, 2, currentMonth.id, currentMonth.year);
            if (incomeRes.data.status === "SUCCESS") {
                setIncome(Number(incomeRes.data.response ? incomeRes.data.response.toFixed(2) : 0));
            }
        } catch (e) { setIsError(true); }

        try {
            const expenseRes = await UserService.getTotalIncomeOrExpense(user.id, 1, currentMonth.id, currentMonth.year);
            if (expenseRes.data.status === "SUCCESS") {
                setExpense(Number(expenseRes.data.response ? expenseRes.data.response.toFixed(2) : 0));
            }
        } catch (e) { setIsError(true); }

        try {
            const countRes = await UserService.getTotalNoOfTransactions(user.id, currentMonth.id, currentMonth.year);
            if (countRes.data.status === "SUCCESS") {
                setTransactions(countRes.data.response || 0);
            }
        } catch (e) { setIsError(true); }

        setIsLoading(false);
    };

    const generateCategorySummary = async () => {
        if (!categories || categories.length === 0) return;
        const user = AuthService.getCurrentUser();
        if (!user) return;

        const expenseCategories = categories.filter(cat => cat.transactionType.transactionTypeId === 1);
        const results = await Promise.allSettled(
            expenseCategories.map(cat =>
                UserService.getTotalByCategory(user.email, cat.categoryId, currentMonth.id, currentMonth.year)
                    .then(res => ({
                        name: cat.categoryName,
                        amount: Number(res.data.response ? res.data.response.toFixed(2) : 0)
                    }))
            )
        );
        const filtered = results
            .filter(r => r.status === 'fulfilled' && r.value.amount > 0)
            .map(r => r.value);
        setCategorySummary(filtered);
    };

    const fetchBudget = async () => {
        try {
            const res = await UserService.getBudget(currentMonth.id, currentMonth.year);
            setBudgetAmount(res.data.response || 0);
        } catch (e) {
            setBudgetAmount(0);
        }
    };

    const saveBudget = async (d) => {
        try {
            await UserService.createBudget(d.amount);
            fetchBudget();
        } catch (e) {
            setIsError(true);
        }
    };

    useEffect(() => {
        setIsError(false);
        generateTransactionSummary();
        fetchBudget();
    }, [currentMonth]);

    useEffect(() => {
        if (categories && categories.length > 0) {
            generateCategorySummary();
        }
    }, [currentMonth, categories]);

    return [
        total_expense,
        total_income,
        cash_in_hand,
        no_of_transactions,
        categorySummary,
        budgetAmount,
        saveBudget,
        isLoading,
        isError
    ];
}

export default useDashboard;
