import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Container from '../../components/utils/Container';
import Header from '../../components/utils/header';
import Loading from '../../components/utils/loading';
import Info from '../../components/utils/Info';
import UserService from '../../services/userService';
import toast, { Toaster } from 'react-hot-toast';

function SavingsGoals() {
    const [goals, setGoals]           = useState([]);
    const [isLoading, setIsLoading]   = useState(false);
    const [showForm, setShowForm]     = useState(false);
    const [editingGoal, setEditingGoal]     = useState(null);
    const [depositGoal, setDepositGoal]     = useState(null);

    const reload = async () => {
        setIsLoading(true);
        try {
            const res = await UserService.getSavingsGoals();
            setGoals(res.data.response || []);
        } catch { toast.error('Failed to load goals'); }
        setIsLoading(false);
    };

    useEffect(() => { reload(); }, []);

    const handleDelete = async (goalId) => {
        if (!window.confirm('Delete this savings goal?')) return;
        try {
            await UserService.deleteSavingsGoal(goalId);
            toast.success('Goal deleted');
            reload();
        } catch { toast.error('Failed to delete goal'); }
    };

    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved  = goals.reduce((s, g) => s + g.savedAmount, 0);

    return (
        <Container activeNavId={13}>
            <Header title="Savings Goals" />
            <Toaster />

            {/* Summary row */}
            {goals.length > 0 && (
                <div style={{ display: 'flex', gap: 16, margin: '16px 0', flexWrap: 'wrap' }}>
                    <SummaryCard label="Total Goals" value={goals.length} color="#6ea1ff" />
                    <SummaryCard label="Total Target" value={`₹${totalTarget.toFixed(2)}`} color="#f39c12" />
                    <SummaryCard label="Total Saved" value={`₹${totalSaved.toFixed(2)}`} color="#27ae60" />
                    <SummaryCard label="Overall Progress"
                        value={totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(1)}%` : '—'}
                        color="#a36eff" />
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="button button-fill" style={{ padding: '8px 20px' }}
                    onClick={() => { setEditingGoal(null); setShowForm(true); }}>
                    + New Goal
                </button>
            </div>

            {isLoading && <Loading />}

            {!isLoading && goals.length === 0 && (
                <Info text="No savings goals yet. Create your first goal!" />
            )}

            {!isLoading && goals.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                    {goals.map(goal => (
                        <GoalCard key={goal.goalId} goal={goal}
                            onEdit={() => { setEditingGoal(goal); setShowForm(true); }}
                            onDelete={() => handleDelete(goal.goalId)}
                            onDeposit={() => setDepositGoal(goal)}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <GoalFormModal
                    editing={editingGoal}
                    onSave={async (d) => {
                        if (editingGoal) {
                            await UserService.updateSavingsGoal(
                                editingGoal.goalId, d.goalName, parseFloat(d.targetAmount),
                                parseFloat(d.savedAmount || 0), d.targetDate, d.description);
                            toast.success('Goal updated!');
                        } else {
                            await UserService.createSavingsGoal(
                                d.goalName, parseFloat(d.targetAmount),
                                parseFloat(d.savedAmount || 0), d.targetDate, d.description);
                            toast.success('Goal created!');
                        }
                        setShowForm(false);
                        reload();
                    }}
                    onClose={() => setShowForm(false)}
                />
            )}

            {depositGoal && (
                <DepositModal
                    goal={depositGoal}
                    onDeposit={async (amount) => {
                        await UserService.depositToGoal(depositGoal.goalId, amount);
                        toast.success(`₹${amount} added to "${depositGoal.goalName}"!`);
                        setDepositGoal(null);
                        reload();
                    }}
                    onClose={() => setDepositGoal(null)}
                />
            )}
        </Container>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, color }) {
    return (
        <div style={{ background: color, borderRadius: 10, padding: '14px 20px',
            flex: '1 1 140px', color: 'white' }}>
            <p style={{ fontSize: 12, marginBottom: 4, opacity: 0.85 }}>{label}</p>
            <h3 style={{ margin: 0 }}>{value}</h3>
        </div>
    );
}

function GoalCard({ goal, onEdit, onDelete, onDeposit }) {
    const pct = goal.progressPercentage;
    const barColor = pct >= 100 ? '#27ae60' : pct >= 60 ? '#6ea1ff' : '#f39c12';
    const statusColor = goal.status === 'COMPLETED' ? '#27ae60'
        : goal.status === 'PAUSED' ? '#f39c12' : '#6ea1ff';

    return (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 20, flex: '1 1 280px', maxWidth: 360 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.05rem' }}>{goal.goalName}</h3>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10,
                        background: statusColor + '22', color: statusColor, display: 'inline-block', marginTop: 4 }}>
                        {goal.status}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={onEdit} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5 }}>Edit</button>
                    <button onClick={onDelete} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5,
                        background: '#e74c3c', color: 'white', border: 'none' }}>Del</button>
                </div>
            </div>

            {goal.description && (
                <p style={{ color: 'var(--second)', fontSize: 13, marginBottom: 12 }}>{goal.description}</p>
            )}

            {/* Progress */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13,
                    color: 'var(--second)', marginBottom: 6 }}>
                    <span>₹{goal.savedAmount.toFixed(2)} saved</span>
                    <span>Target: ₹{goal.targetAmount.toFixed(2)}</span>
                </div>
                <div style={{ background: 'var(--hover)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, pct)}%`, background: barColor,
                        height: '100%', borderRadius: 8, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: barColor, marginTop: 4, fontWeight: 600 }}>
                    {pct.toFixed(1)}%
                </div>
            </div>

            {/* Milestones */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {[25, 50, 75, 100].map(m => (
                    <span key={m} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10,
                        background: pct >= m ? barColor + '33' : 'var(--hover)',
                        color: pct >= m ? barColor : 'var(--second)',
                        border: `1px solid ${pct >= m ? barColor : 'transparent'}` }}>
                        {m}%
                    </span>
                ))}
            </div>

            {/* Dates & estimate */}
            <div style={{ fontSize: 12, color: 'var(--second)', marginBottom: 16 }}>
                {goal.targetDate && <div>🎯 Target: {goal.targetDate}</div>}
                {goal.daysRemaining > 0 && <div>📅 {goal.daysRemaining} days remaining</div>}
                {goal.estimatedCompletion && <div>📈 Est: {goal.estimatedCompletion}</div>}
            </div>

            {goal.status !== 'COMPLETED' && (
                <button className="button button-fill" style={{ width: '100%', padding: '8px' }}
                    onClick={onDeposit}>
                    + Add to Savings
                </button>
            )}
        </div>
    );
}

function GoalFormModal({ editing, onSave, onClose }) {
    const { register, handleSubmit, formState } = useForm({
        defaultValues: editing ? {
            goalName: editing.goalName,
            targetAmount: editing.targetAmount,
            savedAmount: editing.savedAmount,
            targetDate: editing.targetDate,
            description: editing.description || ''
        } : { targetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0] }
    });
    return (
        <Modal onClose={onClose} title={editing ? 'Edit Savings Goal' : 'New Savings Goal'}>
            <form onSubmit={handleSubmit(onSave)}>
                <Field label="Goal Name" error={formState.errors.goalName}>
                    <input type="text" {...register('goalName', { required: 'Name is required' })} />
                </Field>
                <Field label="Target Amount (₹)" error={formState.errors.targetAmount}>
                    <input type="number" step="0.01" min="1"
                        {...register('targetAmount', { required: 'Required', min: 1 })} />
                </Field>
                <Field label="Already Saved (₹)">
                    <input type="number" step="0.01" min="0" {...register('savedAmount')} />
                </Field>
                <Field label="Target Date" error={formState.errors.targetDate}>
                    <input type="date" {...register('targetDate', { required: 'Required' })} />
                </Field>
                <Field label="Description (optional)">
                    <input type="text" {...register('description')} />
                </Field>
                <div className="t-btn input-box" style={{ marginTop: 20 }}>
                    <input type="submit" value="Save Goal" className="button button-fill" />
                    <button type="button" className="button outline" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </Modal>
    );
}

function DepositModal({ goal, onDeposit, onClose }) {
    const { register, handleSubmit, formState } = useForm();
    return (
        <Modal onClose={onClose} title={`Add to "${goal.goalName}"`}>
            <p style={{ color: 'var(--second)', fontSize: 13, marginBottom: 16 }}>
                Remaining: ₹{(goal.targetAmount - goal.savedAmount).toFixed(2)}
            </p>
            <form onSubmit={handleSubmit(d => onDeposit(parseFloat(d.amount)))}>
                <Field label="Amount to add (₹)" error={formState.errors.amount}>
                    <input type="number" step="0.01" min="0.01"
                        {...register('amount', { required: 'Required', min: 0.01 })} />
                </Field>
                <div className="t-btn input-box" style={{ marginTop: 20 }}>
                    <input type="submit" value="Add" className="button button-fill" />
                    <button type="button" className="button outline" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </Modal>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="input-box" style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--second)', display: 'block', marginBottom: 5 }}>{label}</label>
            {children}
            {error && <small style={{ color: 'red' }}>{error.message}</small>}
        </div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 28,
                width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ color: 'var(--text)' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none',
                        fontSize: 22, cursor: 'pointer', color: 'var(--second)' }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default SavingsGoals;
