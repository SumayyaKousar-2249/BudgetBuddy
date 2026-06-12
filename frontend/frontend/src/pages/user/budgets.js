import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Container from '../../components/utils/Container';
import Header from '../../components/utils/header';
import Loading from '../../components/utils/loading';
import Info from '../../components/utils/Info';
import UserService from '../../services/userService';
import useCategories from '../../hooks/useCategories';
import toast, { Toaster } from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function Budgets() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear]   = useState(now.getFullYear());
    const [overallBudget, setOverallBudget] = useState(0);
    const [catBudgets, setCatBudgets]       = useState([]);
    const [isLoading, setIsLoading]         = useState(false);
    const [showOverallForm, setShowOverallForm] = useState(false);
    const [showCatForm, setShowCatForm]        = useState(false);
    const [editingCat, setEditingCat]          = useState(null);
    const [categories] = useCategories();

    const reload = async () => {
        setIsLoading(true);
        try {
            const [ob, cb] = await Promise.all([
                UserService.getBudget(month, year),
                UserService.getCategoryBudgets(month, year),
            ]);
            setOverallBudget(ob.data.response || 0);
            setCatBudgets(cb.data.response || []);
        } catch { toast.error('Failed to load budgets'); }
        setIsLoading(false);
    };

    useEffect(() => { reload(); }, [month, year]);

    const totalCatBudgeted = catBudgets.reduce((s, b) => s + b.budgetAmount, 0);
    const totalCatSpent    = catBudgets.reduce((s, b) => s + b.spentAmount, 0);

    return (
        <Container activeNavId={12}>
            <Header title="Budget Management" />
            <Toaster />

            {/* Month selector */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '16px 0', flexWrap: 'wrap' }}>
                <select value={month} onChange={e => setMonth(Number(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
                <select value={year} onChange={e => setYear(Number(e.target.value))}>
                    {[now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1].map(y =>
                        <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            {isLoading && <Loading />}

            {!isLoading && (
                <>
                    {/* ── Overall monthly budget ─────────────────────────── */}
                    <Section title="Overall Monthly Budget">
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <BudgetSummaryCard
                                label="Monthly Budget"
                                budget={overallBudget}
                                spent={totalCatSpent}
                                onEdit={() => setShowOverallForm(true)}
                                month={month} year={year}
                            />
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <p style={{ color: 'var(--second)', fontSize: 13, marginBottom: 8 }}>
                                    Set a single budget cap for the whole month. Use category budgets below for granular control.
                                </p>
                                <button className="button button-fill" style={{ padding: '6px 18px' }}
                                    onClick={() => setShowOverallForm(true)}>
                                    {overallBudget > 0 ? 'Edit Overall Budget' : '+ Set Overall Budget'}
                                </button>
                            </div>
                        </div>
                    </Section>

                    {/* ── Category budgets ───────────────────────────────── */}
                    <Section title="Category Budgets">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <p style={{ color: 'var(--second)', fontSize: 13 }}>
                                Total budgeted: ₹{totalCatBudgeted.toFixed(2)} | Total spent: ₹{totalCatSpent.toFixed(2)}
                            </p>
                            <button className="button button-fill" style={{ padding: '6px 18px' }}
                                onClick={() => { setEditingCat(null); setShowCatForm(true); }}>
                                + Add Category Budget
                            </button>
                        </div>

                        {catBudgets.length === 0
                            ? <Info text="No category budgets set for this month." />
                            : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                    {catBudgets.map(b => (
                                        <CategoryBudgetCard key={b.id} budget={b}
                                            onEdit={() => { setEditingCat(b); setShowCatForm(true); }}
                                            onDelete={async () => {
                                                await UserService.deleteCategoryBudget(b.categoryId, month, year);
                                                toast.success('Deleted'); reload();
                                            }} />
                                    ))}
                                </div>
                            )
                        }
                    </Section>
                </>
            )}

            {/* ── Overall budget modal ──────────────────────────────────── */}
            {showOverallForm && (
                <OverallBudgetModal
                    current={overallBudget}
                    onSave={async (amt) => {
                        await UserService.createBudget(amt);
                        toast.success('Budget saved!');
                        setShowOverallForm(false);
                        reload();
                    }}
                    onClose={() => setShowOverallForm(false)}
                />
            )}

            {/* ── Category budget modal ─────────────────────────────────── */}
            {showCatForm && (
                <CategoryBudgetModal
                    categories={categories.filter(c => c.enabled && c.transactionType.transactionTypeId === 1)}
                    editing={editingCat}
                    month={month} year={year}
                    onSave={async (catId, catName, amt) => {
                        await UserService.saveCategoryBudget(catId, catName, amt, month, year);
                        toast.success('Category budget saved!');
                        setShowCatForm(false);
                        reload();
                    }}
                    onClose={() => setShowCatForm(false)}
                />
            )}
        </Container>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text)', marginBottom: 16, fontSize: '1rem' }}>{title}</h3>
            {children}
        </div>
    );
}

function BudgetSummaryCard({ label, budget, spent, onEdit, month, year }) {
    const pct  = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
    const bar  = pct >= 100 ? '#e74c3c' : pct >= 80 ? '#f39c12' : '#27ae60';
    return (
        <div style={{ minWidth: 260, flex: '0 0 260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{label}</span>
                <button onClick={onEdit} style={{ fontSize: 12, padding: '2px 10px', borderRadius: 5 }}>Edit</button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--second)', marginBottom: 8 }}>
                ₹{spent.toFixed(2)} / ₹{budget.toFixed(2)} ({pct.toFixed(1)}%)
            </div>
            <ProgressBar pct={pct} color={bar} />
            {pct >= 100 && <p style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>⚠ Budget exceeded!</p>}
            {pct >= 80 && pct < 100 && <p style={{ color: '#f39c12', fontSize: 12, marginTop: 4 }}>⚠ 80% of budget used.</p>}
        </div>
    );
}

function CategoryBudgetCard({ budget, onEdit, onDelete }) {
    const pct = budget.budgetAmount > 0
        ? Math.min(100, (budget.spentAmount / budget.budgetAmount) * 100) : 0;
    const bar = budget.alertLevel === 'EXCEEDED' ? '#e74c3c'
        : budget.alertLevel === 'WARNING' ? '#f39c12' : '#27ae60';
    return (
        <div style={{ background: 'var(--hover)', borderRadius: 10, padding: 16,
            flex: '1 1 240px', maxWidth: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{budget.categoryName}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={onEdit} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>Edit</button>
                    <button onClick={onDelete} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4,
                        background: '#e74c3c', color: 'white', border: 'none' }}>Del</button>
                </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--second)', marginBottom: 8 }}>
                ₹{budget.spentAmount.toFixed(2)} / ₹{budget.budgetAmount.toFixed(2)}
            </div>
            <ProgressBar pct={pct} color={bar} />
            {budget.alertLevel === 'EXCEEDED' && <p style={{ color: '#e74c3c', fontSize: 11, marginTop: 4 }}>Exceeded!</p>}
            {budget.alertLevel === 'WARNING' && <p style={{ color: '#f39c12', fontSize: 11, marginTop: 4 }}>Nearly at limit</p>}
        </div>
    );
}

function ProgressBar({ pct, color }) {
    return (
        <div style={{ background: 'var(--border)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, pct)}%`, background: color, height: '100%', borderRadius: 6,
                transition: 'width 0.4s ease' }} />
        </div>
    );
}

function OverallBudgetModal({ current, onSave, onClose }) {
    const { register, handleSubmit, formState } = useForm({ defaultValues: { amount: current || '' } });
    return (
        <Modal onClose={onClose} title="Set Overall Monthly Budget">
            <form onSubmit={handleSubmit(d => onSave(parseFloat(d.amount)))}>
                <div className="input-box">
                    <label>Budget Amount (₹)</label><br />
                    <input type="number" step="0.01" min="0"
                        {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be > 0' } })} />
                    {formState.errors.amount && <small style={{ color: 'red' }}>{formState.errors.amount.message}</small>}
                </div>
                <div className="t-btn input-box" style={{ marginTop: 16 }}>
                    <input type="submit" value="Save" className="button button-fill" />
                    <button type="button" className="button outline" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </Modal>
    );
}

function CategoryBudgetModal({ categories, editing, month, year, onSave, onClose }) {
    const { register, handleSubmit, formState } = useForm({
        defaultValues: editing ? { categoryId: String(editing.categoryId), amount: editing.budgetAmount } : {}
    });
    return (
        <Modal onClose={onClose} title={editing ? 'Edit Category Budget' : 'Add Category Budget'}>
            <form onSubmit={handleSubmit(d => {
                const cat = categories.find(c => String(c.categoryId) === String(d.categoryId));
                onSave(parseInt(d.categoryId), cat ? cat.categoryName : '', parseFloat(d.amount));
            })}>
                <div className="input-box">
                    <label>Category</label><br />
                    <select {...register('categoryId', { required: true })} style={{ width: '100%' }}
                        disabled={!!editing}>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                    </select>
                </div>
                <div className="input-box" style={{ marginTop: 12 }}>
                    <label>Budget Amount (₹)</label><br />
                    <input type="number" step="0.01" min="0"
                        {...register('amount', { required: 'Amount required', min: { value: 1, message: 'Must be > 0' } })} />
                    {formState.errors.amount && <small style={{ color: 'red' }}>{formState.errors.amount.message}</small>}
                </div>
                <div className="t-btn input-box" style={{ marginTop: 16 }}>
                    <input type="submit" value="Save" className="button button-fill" />
                    <button type="button" className="button outline" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </Modal>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 28,
                minWidth: 320, maxWidth: 440, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ color: 'var(--text)' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none',
                        fontSize: 20, cursor: 'pointer', color: 'var(--second)' }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default Budgets;
