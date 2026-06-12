import { useEffect, useState } from "react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import Header from "../../components/utils/header";
import Loading from '../../components/utils/loading';
import Info from "../../components/utils/Info";
import Container from "../../components/utils/Container";
import UserService from "../../services/userService";
import AuthService from "../../services/auth.service";
import useCategories from "../../hooks/useCategories";
import { Toaster, toast } from "react-hot-toast";

const PIE_COLORS = ["#ff6e6e","#ffb26e","#e6cd10","#00a33c","#6ea1ff","#a36eff","#ff6eff","#6ee0ff","#676d6e"];

function UserStatistics() {
    const months = getMonths();
    const [trendData, setTrendData]         = useState([]);
    const [categoryData, setCategoryData]   = useState([]);
    const [isLoading, setIsLoading]         = useState(true);
    const [categories]                      = useCategories();

    // current and previous month for trend indicator
    const currentMonthObj  = months[months.length - 1];
    const previousMonthObj = months[months.length - 2];
    const [currentIncome,  setCurrentIncome]  = useState(0);
    const [currentExpense, setCurrentExpense] = useState(0);
    const [prevIncome,     setPrevIncome]     = useState(0);
    const [prevExpense,    setPrevExpense]     = useState(0);

    useEffect(() => {
        loadData();
    }, [categories]);

    const loadData = async () => {
        setIsLoading(true);
        const email = AuthService.getCurrentUser()?.email;
        const userId = AuthService.getCurrentUser()?.id;
        if (!email) return;

        // ── Monthly income vs expense trend ───────────────────────────────
        try {
            const res = await UserService.getMonthlySummary(email);
            if (res.data.status === "SUCCESS") {
                const raw = res.data.response;
                const mapped = months.map(({ id, year, monthName }) => {
                    const found = raw.find(r => r.month === id);
                    return {
                        monthName,
                        totalIncome:   found ? Number(found.total_income.toFixed(2))   : 0,
                        totalExpense:  found ? Number(found.total_expense.toFixed(2))  : 0,
                    };
                });
                setTrendData(mapped);

                // trend indicators — last 2 months
                const cur  = raw.find(r => r.month === currentMonthObj.id);
                const prev = raw.find(r => r.month === previousMonthObj.id);
                setCurrentIncome(cur ? cur.total_income : 0);
                setCurrentExpense(cur ? cur.total_expense : 0);
                setPrevIncome(prev ? prev.total_income : 0);
                setPrevExpense(prev ? prev.total_expense : 0);
            }
        } catch (e) {
            toast.error("Failed to load monthly summary.");
        }

        // ── Category-wise expense breakdown (current month) ───────────────
        if (categories && categories.length > 0) {
            const expCats = categories.filter(c => c.transactionType.transactionTypeId === 1);
            const results = await Promise.allSettled(
                expCats.map(cat =>
                    UserService.getTotalByCategory(email, cat.categoryId, currentMonthObj.id, currentMonthObj.year)
                        .then(r => ({ name: cat.categoryName, value: r.data.response || 0 }))
                )
            );
            const catData = results
                .filter(r => r.status === 'fulfilled' && r.value.value > 0)
                .map(r => r.value);
            setCategoryData(catData);
        }

        setIsLoading(false);
    };

    const pctChange = (cur, prev) => {
        if (prev === 0 && cur === 0) return null;
        if (prev === 0) return 100;
        return Number(((cur - prev) / prev * 100).toFixed(1));
    };

    const incomePct  = pctChange(currentIncome, prevIncome);
    const expensePct = pctChange(currentExpense, prevExpense);

    return (
        <Container activeNavId={9}>
            <Header title="Statistics" />
            <Toaster />

            {isLoading && <Loading />}

            {!isLoading && trendData.length === 0 && categoryData.length === 0 && (
                <Info text="No transaction data yet. Add transactions to see statistics." />
            )}

            {!isLoading && (
                <div style={{ padding: '0 20px 40px' }}>

                    {/* ── Trend indicators ───────────────────────────────────── */}
                    <div style={{ display: 'flex', gap: '16px', margin: '16px 0', flexWrap: 'wrap' }}>
                        <TrendCard
                            label={`Income — ${currentMonthObj.monthName}`}
                            value={currentIncome}
                            pct={incomePct}
                            color="#27ae60"
                        />
                        <TrendCard
                            label={`Expenses — ${currentMonthObj.monthName}`}
                            value={currentExpense}
                            pct={expensePct !== null ? -expensePct : null}
                            color="#e74c3c"
                            invertArrow
                        />
                    </div>

                    {/* ── Income vs Expense line chart ───────────────────────── */}
                    {trendData.some(d => d.totalIncome > 0 || d.totalExpense > 0) && (
                        <ChartBox title="Income vs Expense — Monthly Trend">
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="monthName" fontSize={11} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="totalIncome"  name="Income"  stroke="#27ae60" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="totalExpense" name="Expense" stroke="#e74c3c" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartBox>
                    )}

                    {/* ── Monthly bar chart ──────────────────────────────────── */}
                    {trendData.some(d => d.totalIncome > 0 || d.totalExpense > 0) && (
                        <ChartBox title="Monthly Spending Trend">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="monthName" fontSize={11} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="totalIncome"  name="Income"  fill="#27ae60" radius={[4,4,0,0]} />
                                    <Bar dataKey="totalExpense" name="Expense" fill="#e74c3c" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartBox>
                    )}

                    {/* ── Category-wise expense pie ──────────────────────────── */}
                    {categoryData.length > 0 && (
                        <ChartBox title={`Category-wise Expenses — ${currentMonthObj.monthName} ${currentMonthObj.year}`}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        innerRadius={60}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {categoryData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => `Rs. ${Number(v).toFixed(2)}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartBox>
                    )}

                    {!isLoading && categoryData.length === 0 && (
                        <ChartBox title={`Category-wise Expenses — ${currentMonthObj.monthName} ${currentMonthObj.year}`}>
                            <Info text="No expense data for this month." />
                        </ChartBox>
                    )}
                </div>
            )}
        </Container>
    );
}

function ChartBox({ title, children }) {
    return (
        <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
        }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text)', fontSize: '1rem' }}>{title}</h3>
            {children}
        </div>
    );
}

function TrendCard({ label, value, pct, color, invertArrow }) {
    const isUp   = pct !== null && pct > 0;
    const isDown = pct !== null && pct < 0;
    const arrowUp   = invertArrow ? isDown : isUp;
    const arrowDown = invertArrow ? isUp   : isDown;
    const trendColor = arrowUp ? '#27ae60' : arrowDown ? '#e74c3c' : 'var(--second)';

    return (
        <div style={{
            flex: '1 1 200px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px'
        }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--second)', marginBottom: 4 }}>{label}</p>
            <h2 style={{ color, marginBottom: 6 }}>Rs. {Number(value).toFixed(2)}</h2>
            {pct !== null && (
                <span style={{ fontSize: '0.85rem', color: trendColor }}>
                    {isUp ? '▲' : isDown ? '▼' : '—'} {Math.abs(pct)}% vs last month
                </span>
            )}
            {pct === null && <span style={{ fontSize: '0.85rem', color: 'var(--second)' }}>No previous data</span>}
        </div>
    );
}

function getMonths() {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            id: d.getMonth() + 1,
            year: d.getFullYear(),
            monthName: d.toLocaleString('en-US', { month: 'long' })
        });
    }
    return months;
}

export default UserStatistics;
