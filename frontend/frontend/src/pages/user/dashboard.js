import '../../assets/styles/dashboard.css';
import { useState } from 'react';
import DashboardDetailBox from '../../components/userDashboard/dashboardDetailBox';
import CategoryExpenseChart from '../../components/userDashboard/categoryExpenseChart';
import Header from '../../components/utils/header';
import Budget from '../../components/userDashboard/budget';
import useDashboard from '../../hooks/useDashboard';
import Loading from '../../components/utils/loading';
import Info from '../../components/utils/Info';
import Container from '../../components/utils/Container';
import toast, { Toaster } from 'react-hot-toast';

function Dashboard() {
    const months = getMonths();
    const [currentMonth, setCurrentMonth] = useState(months[0]);

    const [
        total_expense, total_income, cash_in_hand, no_of_transactions,
        categorySummary, budgetAmount, saveBudget, isLoading, isError
    ] = useDashboard(currentMonth);

    const onMonthChange = (id) => {
        const month = months.find(m => String(m.id) === String(id) && String(m.year) === String(id.split('-')[1] || m.year));
        setCurrentMonth(months.find(m => m.id === parseInt(id)) || months[0]);
    };

    return (
        <Container activeNavId={0}>
            <Header title="Dashboard" />
            <Toaster />
            <SelectMonth months={months} onMonthChange={(val) => {
                const found = months.find(m => m.id + '-' + m.year === val);
                if (found) setCurrentMonth(found);
            }} />

            {isLoading && <Loading />}
            {isError && toast.error("Failed to fetch information. Try again later!")}

            {!isLoading && !isError && (
                <>
                    <DashboardDetailBox
                        total_expense={total_expense}
                        total_income={total_income}
                        cash_in_hand={cash_in_hand}
                        no_of_transactions={no_of_transactions}
                    />
                    {(total_expense === 0 && total_income === 0) && (
                        <Info text="No transactions found for this month. Add your first transaction!" />
                    )}
                    {(total_expense > 0 || categorySummary.length > 0) && (
                        <div className='dashboard-chart'>
                            {categorySummary.length > 0
                                ? <CategoryExpenseChart categorySummary={categorySummary} />
                                : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>No expense data for category chart.</div>
                            }
                            <Budget
                                totalExpense={total_expense}
                                budgetAmount={budgetAmount}
                                saveBudget={saveBudget}
                                currentMonth={currentMonth}
                            />
                        </div>
                    )}
                </>
            )}
        </Container>
    );
}

export default Dashboard;

function getMonths() {
    const months = [];
    const current_date = new Date();
    for (let i = 0; i <= 11; i++) {
        const date = new Date(current_date.getFullYear(), current_date.getMonth() - i, 1);
        months.push({
            id: date.getMonth() + 1,
            year: date.getFullYear(),
            monthName: date.toLocaleString('en-US', { month: 'long' })
        });
    }
    return months;
}

function SelectMonth({ months, onMonthChange }) {
    return (
        <div style={{ padding: '10px 0' }}>
            <select onChange={(e) => onMonthChange(e.target.value)}>
                {months.map((m) => (
                    <option value={m.id + '-' + m.year} key={m.id + '-' + m.year}>
                        {m.monthName} {m.year}
                    </option>
                ))}
            </select>
        </div>
    );
}
