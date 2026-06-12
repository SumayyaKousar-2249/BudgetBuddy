import '../../assets/styles/transactionList.css';
import { Link } from 'react-router-dom';

function TransactionList({ list }) {
    return (
        <>
            {Object.keys(list).map((date) => (
                <div className='t-box' key={date}>
                    <div className='date'>{formatDate(date)}</div>
                    <div className='t-list'>
                        {list[date].map(t => (
                            <Link
                                to={`/user/editTransaction/${t.transactionId}`}
                                className='t-row'
                                key={t.transactionId}
                            >
                                <div className='t-row-left'>
                                    <p style={{ fontWeight: 600 }}>{t.categoryName}</p>
                                    {t.description && <p style={{ fontSize: '0.85em', color: 'var(--second)' }}>{t.description}</p>}
                                </div>
                                <div className='t-row-right'>
                                    <p style={{ color: t.transactionType === 1 ? '#e74c3c' : '#27ae60', fontWeight: 600 }}>
                                        {t.transactionType === 1 ? '- ' : '+ '}
                                        Rs. {Number(t.amount).toFixed(2)}
                                    </p>
                                    <span style={{
                                        fontSize: '0.75em',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        background: t.transactionType === 1 ? '#fde8e8' : '#e8f8ee',
                                        color: t.transactionType === 1 ? '#e74c3c' : '#27ae60'
                                    }}>
                                        {t.transactionType === 1 ? 'Expense' : 'Income'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
}

function formatDate(dateString) {
    if (dateString === 'Today' || dateString === 'Yesterday') return dateString;
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const date = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
        const d = date.getDate();
        const m = date.toLocaleDateString('en-US', { month: 'long' });
        const y = date.getFullYear();
        return `${d} ${m} ${y}`;
    }
    return dateString;
}

export default TransactionList;
