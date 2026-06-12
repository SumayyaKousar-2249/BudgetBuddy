import '../../assets/styles/dashboard.css';
import { useState, useEffect } from 'react';
import CategoryExpenseChart from '../../components/userDashboard/categoryExpenseChart';
import Header from '../../components/utils/header';
import Budget from '../../components/userDashboard/budget';
import useDashboard from '../../hooks/useDashboard';
import Loading from '../../components/utils/loading';
import Info from '../../components/utils/Info';
import Container from '../../components/utils/Container';
import UserService from '../../services/userService';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';

function Dashboard() {
    const months = getMonths();
    const [currentMonth, setCurrentMonth] = useState(months[0]);

    const [
        total_expense, total_income, cash_in_hand, no_of_transactions,
        categorySummary, budgetAmount, saveBudget, isLoading, isError
    ] = useDashboard(currentMonth);

    const [healthScore, setHealthScore]         = useState(null);
    const [recentTxns, setRecentTxns]           = useState([]);
    const [healthLoading, setHealthLoading]     = useState(true);

    useEffect(() => {
        loadExtras();
    }, [currentMonth]);

    const loadExtras = async () => {
        setHealthLoading(true);
        try {
            const [hRes, rRes] = await Promise.all([
                UserService.getHealthScore(currentMonth.id, currentMonth.year),
                UserService.getRecentTransactions(6),
            ]);
            if (hRes.data.status === 'SUCCESS') setHealthScore(hRes.data.response);
            if (rRes.data.status === 'SUCCESS') setRecentTxns(rRes.data.response || []);
        } catch { /* silent — health score is supplementary */ }
        setHealthLoading(false);
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
            {isError && toast.error('Failed to fetch information. Try again later!')}

            {!isLoading && !isError && (
                <>
                    {/* ── Summary cards ────────────────────────────────── */}
                    <DashboardSummary
                        total_income={total_income}
                        total_expense={total_expense}
                        cash_in_hand={cash_in_hand}
                        no_of_transactions={no_of_transactions}
                        savings={total_income > total_expense ? total_income - total_expense : 0}
                        healthScore={healthScore}
                    />

                    {(total_expense === 0 && total_income === 0) && (
                        <Info text="No transactions found for this month. Add your first transaction!" />
                    )}

                    {/* ── Health score + charts row ─────────────────────── */}
                    {(total_expense > 0 || total_income > 0) && (
                        <>
                            {/* Health score card */}
                            {!healthLoading && healthScore && (
                                <HealthScoreCard score={healthScore} />
                            )}

                            <div className='dashboard-chart'>
                                {categorySummary.length > 0
                                    ? <CategoryExpenseChart categorySummary={categorySummary} />
                                    : <div style={{ flex: 1, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'var(--second)' }}>
                                        No expense data for chart.</div>
                                }
                                <Budget totalExpense={total_expense} budgetAmount={budgetAmount}
                                    saveBudget={saveBudget} currentMonth={currentMonth} />
                            </div>
                        </>
                    )}

                    {/* ── Recent transactions widget ────────────────────── */}
                    <RecentTransactions transactions={recentTxns} />

                    {/* ── Monthly summary widget ────────────────────────── */}
                    <MonthlySummary income={total_income} expense={total_expense}
                        savings={total_income > total_expense ? total_income - total_expense : 0}
                        budget={budgetAmount} month={currentMonth.monthName} />
                </>
            )}
        </Container>
    );
}

export default Dashboard;

// ── Components ────────────────────────────────────────────────────────────────

function DashboardSummary({ total_income, total_expense, cash_in_hand, no_of_transactions, savings, healthScore }) {
    const grade = healthScore ? healthScore.grade : null;
    const gradeColor = { A: '#27ae60', B: '#6ea1ff', C: '#f39c12', D: '#e67e22', F: '#e74c3c' };

    return (
        <div className='details'>
            <SummaryBox title="Total Income"     value={`₹${total_income}`}      bg="#53d37d" />
            <SummaryBox title="Total Expenses"   value={`₹${total_expense}`}     bg="#ff6464" />
            <SummaryBox title="Balance"          value={`₹${cash_in_hand}`}      bg="#5e85e6" />
            <SummaryBox title="Transactions"     value={no_of_transactions}       bg="#fe50c4" />
            <SummaryBox title="Savings"          value={`₹${savings.toFixed(2)}`} bg="#a36eff" />
            {grade && (
                <SummaryBox title="Health Score"
                    value={`${healthScore.overallScore}/100`}
                    bg={gradeColor[grade] || '#888'}
                    sub={`Grade ${grade}`} />
            )}
        </div>
    );
}

function SummaryBox({ title, value, bg, sub }) {
    return (
        <div style={{ background: bg, flex: '1 1 160px', padding: '20px 16px',
            borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>{value}</h2>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', fontWeight: 400 }}>{title}</h4>
            {sub && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{sub}</span>}
        </div>
    );
}

function HealthScoreCard({ score }) {
    const gradeColor = { A: '#27ae60', B: '#6ea1ff', C: '#f39c12', D: '#e67e22', F: '#e74c3c' };
    const color = gradeColor[score.grade] || '#888';
    const pct = score.overallScore;

    return (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ color: 'var(--text)', marginBottom: 16, fontSize: '1rem' }}>
                Financial Health Score
            </h3>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Score circle */}
                <div style={{ textAlign: 'center', minWidth: 100 }}>
                    <div style={{ width: 90, height: 90, borderRadius: '50%',
                        border: `6px solid ${color}`, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{pct}</span>
                        <span style={{ fontSize: 11, color: 'var(--second)' }}>/ 100</span>
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color }}>Grade {score.grade}</span>
                </div>

                {/* Score breakdown */}
                <div style={{ flex: 1, minWidth: 220 }}>
                    <ScoreBar label="Savings Rate"       score={score.savingsRateScore}    max={30}  color="#27ae60" detail={`${score.savingsRate}%`} />
                    <ScoreBar label="Budget Adherence"   score={score.budgetAdherenceScore} max={25}  color="#6ea1ff" detail={`${score.budgetAdherence}%`} />
                    <ScoreBar label="Expense Ratio"      score={score.expenseRatioScore}    max={25}  color="#f39c12" detail={`${score.expenseRatio}%`} />
                    <ScoreBar label="Consistency"        score={score.consistencyScore}     max={20}  color="#a36eff" />
                </div>

                {/* Suggestions */}
                {score.suggestions && score.suggestions.length > 0 && (
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--second)', marginBottom: 8 }}>
                            💡 Suggestions
                        </p>
                        <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                            {score.suggestions.map((s, i) => (
                                <li key={i} style={{ fontSize: 12, color: 'var(--second)', marginBottom: 6 }}>{s}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

function ScoreBar({ label, score, max, color, detail }) {
    const pct = (score / max) * 100;
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12,
                color: 'var(--second)', marginBottom: 4 }}>
                <span>{label}</span>
                <span style={{ color }}>{score}/{max}{detail ? ` (${detail})` : ''}</span>
            </div>
            <div style={{ background: 'var(--hover)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, background: color, height: '100%',
                    borderRadius: 6, transition: 'width 0.4s ease' }} />
            </div>
        </div>
    );
}

function RecentTransactions({ transactions }) {
    return (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 20, marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: 'var(--text)', fontSize: '1rem', margin: 0 }}>Recent Transactions</h3>
                <Link to="/user/transactions" style={{ fontSize: 13, color: 'var(--main)' }}>View all →</Link>
            </div>
            {transactions.length === 0
                ? <p style={{ color: 'var(--second)', fontSize: 13 }}>No transactions yet.</p>
                : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr>
                                {['Date','Category','Description','Type','Amount'].map(h => (
                                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left',
                                        color: 'var(--second)', borderBottom: '1px solid var(--border)',
                                        fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.transactionId}
                                    style={{ borderBottom: '1px solid var(--hover)' }}>
                                    <td style={{ padding: '8px', color: 'var(--second)' }}>{t.date}</td>
                                    <td style={{ padding: '8px', color: 'var(--text)', fontWeight: 500 }}>{t.categoryName}</td>
                                    <td style={{ padding: '8px', color: 'var(--second)' }}>{t.description || '—'}</td>
                                    <td style={{ padding: '8px' }}>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10,
                                            background: t.transactionTypeId === 1 ? '#fde8e8' : '#e8f8ee',
                                            color: t.transactionTypeId === 1 ? '#e74c3c' : '#27ae60' }}>
                                            {t.transactionTypeId === 1 ? 'Expense' : 'Income'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', fontWeight: 600,
                                        color: t.transactionTypeId === 1 ? '#e74c3c' : '#27ae60' }}>
                                        {t.transactionTypeId === 1 ? '-' : '+'}₹{Number(t.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            }
        </div>
    );
}

function MonthlySummary({ income, expense, savings, budget, month }) {
    const budgetUsage = budget > 0 ? ((expense / budget) * 100).toFixed(1) : null;
    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

    return (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ color: 'var(--text)', fontSize: '1rem', marginBottom: 16 }}>
                Monthly Summary — {month}
            </h3>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <StatItem label="Income" value={`₹${income.toFixed(2)}`} color="#27ae60" />
                <StatItem label="Expenses" value={`₹${expense.toFixed(2)}`} color="#e74c3c" />
                <StatItem label="Savings" value={`₹${savings.toFixed(2)}`} color="#6ea1ff" />
                <StatItem label="Savings Rate" value={`${savingsRate}%`} color="#a36eff" />
                {budgetUsage && (
                    <StatItem label="Budget Used" value={`${budgetUsage}%`}
                        color={parseFloat(budgetUsage) >= 100 ? '#e74c3c' : parseFloat(budgetUsage) >= 80 ? '#f39c12' : '#27ae60'} />
                )}
                <StatItem label="Net Flow"
                    value={income >= expense ? `+₹${(income - expense).toFixed(2)}` : `-₹${(expense - income).toFixed(2)}`}
                    color={income >= expense ? '#27ae60' : '#e74c3c'} />
            </div>
        </div>
    );
}

function StatItem({ label, value, color }) {
    return (
        <div style={{ minWidth: 120 }}>
            <p style={{ fontSize: 12, color: 'var(--second)', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color, margin: 0 }}>{value}</p>
        </div>
    );
}

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
