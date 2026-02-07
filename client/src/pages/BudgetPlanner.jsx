import React, { useState } from 'react';
import { DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useEvent } from '../context/EventContext';

import { API_URL } from '../config';

function BudgetPlanner() {
    const { eventData, updateEventData } = useEvent();

    const [totalBudget, setTotalBudget] = useState(eventData.budget || '');
    const [eventType, setEventType] = useState(eventData.eventType || '');
    const [guestCount, setGuestCount] = useState(eventData.guestCount || '');
    const [priorities, setPriorities] = useState(eventData.priorities || {
        food: 'medium',
        venue: 'medium',
        entertainment: 'medium',
        decoration: 'medium',
    });
    const [allocation, setAllocation] = useState(eventData.allocation || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!totalBudget || !eventType || !guestCount) {
            setError('Please fill in budget, event type and guest count');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/budget/allocate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalBudget: parseFloat(totalBudget),
                    eventType,
                    guestCount: parseInt(guestCount),
                    priorities,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Generation failed');
            }

            const data = await response.json();
            setAllocation(data);

            // Save all planner data to global context
            updateEventData({
                budget: parseFloat(totalBudget),
                guestCount: parseInt(guestCount),
                eventType,
                priorities,
                allocation: data
            });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to generate budget allocation. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const eventTypeOptions = [
        'Hackathon',
        'College Fest',
        'Wedding',
        'Corporate Event',
        'Birthday Party',
        'Conference',
    ];

    const COLORS = [
        'hsl(220, 80%, 30%)', // Navy
        'hsl(220, 60%, 50%)', // Royal Blue
        'hsl(200, 80%, 40%)', // Cerulean
        'hsl(240, 50%, 40%)', // Slate Blue
        'hsl(210, 30%, 40%)', // Steel Blue
        'hsl(190, 70%, 35%)', // Dark Teal
        'hsl(230, 60%, 25%)', // Dark Indigo
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="container">
            <div style={styles.header} className="fade-in">
                <div>
                    <h1 style={styles.title}>
                        <DollarSign size={48} style={{ color: 'var(--primary)' }} />
                        Smart Budget Allocator
                    </h1>
                    <p style={styles.subtitle}>
                        Get AI-powered budget recommendations based on industry standards and your priorities.
                    </p>
                </div>
                {eventData.eventType && (
                    <div className="badge badge-success" style={{ padding: '0.75rem 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={18} />
                        Planning for: {eventData.eventType}
                    </div>
                )}
            </div>

            <div className="grid grid-2" style={{ alignItems: 'start' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Budget Details</h3>
                        <p className="card-description">
                            Enter your budget and priorities
                        </p>
                    </div>

                    <form onSubmit={handleGenerate}>
                        <div className="input-group">
                            <label className="input-label">Total Budget (₹)</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="e.g., 500000"
                                value={totalBudget}
                                onChange={(e) => setTotalBudget(e.target.value)}
                                min="1000"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Guest Count (People)</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="e.g., 100"
                                value={guestCount}
                                onChange={(e) => setGuestCount(e.target.value)}
                                min="1"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Priorities (Optional)</label>
                            <div style={styles.prioritiesGrid}>
                                {Object.keys(priorities).map((key) => (
                                    <div key={key} style={styles.priorityItem}>
                                        <label style={styles.priorityLabel}>
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </label>
                                        <select
                                            className="select"
                                            value={priorities[key]}
                                            onChange={(e) =>
                                                setPriorities({ ...priorities, [key]: e.target.value })
                                            }
                                            style={{ fontSize: '0.85rem' }}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Event Type</label>
                            <select
                                className="select"
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                            >
                                <option value="">Select event type...</option>
                                {eventTypeOptions.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div style={styles.error}>
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            <TrendingUp size={18} />
                            {loading ? 'Calculating...' : 'Generate Allocation'}
                        </button>
                    </form>
                </div>

                <div className="card" style={styles.resultsCard}>
                    <div className="card-header">
                        <h3 className="card-title">Budget Allocation</h3>
                    </div>

                    {loading && (
                        <div style={styles.loadingContainer}>
                            <div className="spinner"></div>
                            <p style={styles.loadingText}>Calculating optimal allocation...</p>
                        </div>
                    )}

                    {!loading && allocation.length === 0 && (
                        <div style={styles.emptyState}>
                            <DollarSign size={64} color="var(--text-muted)" />
                            <p style={styles.emptyText}>
                                Enter your budget details to see the allocation
                            </p>
                        </div>
                    )}

                    {!loading && allocation.length > 0 && (
                        <div style={styles.resultsContent}>
                            <div style={styles.chartContainer}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={allocation}
                                            dataKey="amount"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ percentage }) => `${percentage}%`}
                                        >
                                            {allocation.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--text-primary)',
                                            }}
                                        />
                                        <Legend
                                            wrapperStyle={{ color: 'var(--text-primary)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={styles.allocationList}>
                                {allocation.map((item, index) => (
                                    <div key={index} style={styles.allocationItem}>
                                        <div style={styles.allocationHeader}>
                                            <div style={styles.allocationCategory}>
                                                <div
                                                    style={{
                                                        ...styles.categoryDot,
                                                        background: COLORS[index % COLORS.length],
                                                    }}
                                                ></div>
                                                <span style={styles.categoryName}>{item.category}</span>
                                            </div>
                                            <div style={styles.allocationAmount}>
                                                <span style={styles.amount}>{formatCurrency(item.amount)}</span>
                                                <span style={styles.percentage}>{item.percentage}%</span>
                                            </div>
                                        </div>
                                        {item.justification && (
                                            <p style={styles.justification}>{item.justification}</p>
                                        )}
                                        {item.items && item.items.length > 0 && (
                                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Includes:</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {item.items.map((subItem, idx) => (
                                                        <span key={idx} style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            background: 'rgba(0,0,0,0.05)',
                                                            borderRadius: '4px',
                                                            border: '1px solid var(--border-light)'
                                                        }}>
                                                            {subItem}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={styles.totalSection}>
                                <span style={styles.totalLabel}>Total Budget:</span>
                                <span style={styles.totalAmount}>
                                    {formatCurrency(allocation.reduce((sum, item) => sum + item.amount, 0))}
                                </span>
                            </div>

                            <button className="btn btn-primary" onClick={() => window.location.href = '/final-plan'} style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', marginTop: '1rem' }}>
                                View Final Event Plan <TrendingUp size={20} style={{ marginLeft: '0.5rem' }} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    header: {
        marginBottom: '2rem',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: 'var(--text-secondary)',
        maxWidth: '800px',
    },
    prioritiesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
    },
    priorityItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    priorityLabel: {
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        fontWeight: 500,
    },
    error: {
        padding: '1rem',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid var(--error)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--error)',
        marginBottom: '1rem',
    },
    resultsCard: {
        minHeight: '500px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '3rem',
    },
    loadingText: {
        color: 'var(--text-secondary)',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        minHeight: '400px',
    },
    emptyText: {
        color: 'var(--text-muted)',
        marginTop: '1rem',
    },
    resultsContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    chartContainer: {
        width: '100%',
        height: '300px',
    },
    allocationList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    allocationItem: {
        padding: '1rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
    },
    allocationHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    allocationCategory: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    categoryDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
    },
    categoryName: {
        color: 'var(--text-primary)',
        fontWeight: 600,
        fontSize: '1rem',
    },
    allocationAmount: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    amount: {
        color: 'var(--text-primary)',
        fontWeight: 700,
        fontSize: '1.1rem',
    },
    percentage: {
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
    },
    justification: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        margin: 0,
        lineHeight: 1.5,
    },
    totalSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        borderRadius: 'var(--radius-lg)',
        marginTop: '1rem',
    },
    totalLabel: {
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: 600,
    },
    totalAmount: {
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 700,
    },
};

export default BudgetPlanner;
