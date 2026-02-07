import React from 'react';
import { useEvent } from '../context/EventContext';
import { Calendar, DollarSign, Clock, Users, CheckCircle2, MapPin, Music, Camera, Utensils, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FinalPlan() {
    const { eventData } = useEvent();
    const navigate = useNavigate();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (!eventData.eventType && !eventData.budget) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <h2>No event plan found</h2>
                <p>Please go back and start planning your event.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Start Planning</button>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={styles.header} className="fade-in">
                <div>
                    <h1 style={styles.title}>
                        <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
                        Event Master Plan
                    </h1>
                    <p style={styles.subtitle}>
                        passed-party approved! Here is the complete blueprint for your <strong>{eventData.eventType || 'Event'}</strong>.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    <Download size={18} />
                    Export Plan
                </button>
            </div>

            <div className="grid grid-2" style={{ alignItems: 'start', gap: '2rem' }}>

                {/* Left Column: Overview & Schedule */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Event Snapshot */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Event Snapshot</h3>
                        </div>
                        <div style={styles.snapshotGrid}>
                            <div style={styles.snapshotItem}>
                                <div style={styles.iconBox}><Clock size={20} /></div>
                                <div>
                                    <span style={styles.label}>Duration</span>
                                    <p style={styles.value}>{eventData.schedule?.duration || 'N/A'} Hours</p>
                                </div>
                            </div>
                            <div style={styles.snapshotItem}>
                                <div style={styles.iconBox}><Users size={20} /></div>
                                <div>
                                    <span style={styles.label}>Guests</span>
                                    <p style={styles.value}>{eventData.guestCount || 'N/A'}</p>
                                </div>
                            </div>
                            <div style={styles.snapshotItem}>
                                <div style={styles.iconBox}><DollarSign size={20} /></div>
                                <div>
                                    <span style={styles.label}>Total Budget</span>
                                    <p style={styles.value}>{eventData.budget ? formatCurrency(eventData.budget) : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        {eventData.description && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <span style={styles.label}>Theme Vision</span>
                                <p style={{ ...styles.value, marginTop: '0.25rem' }}>{eventData.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Run of Show */}
                    {eventData.schedule?.schedule && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Run of Show</h3>
                            </div>
                            <div style={styles.timeline}>
                                {eventData.schedule.schedule.map((item, index) => (
                                    <div key={index} style={styles.timelineItem}>
                                        <div style={styles.timeColumn}>{item.time}</div>
                                        <div style={styles.timelineContent}>
                                            <h4 style={styles.activityTitle}>{item.activity}</h4>
                                            <p style={styles.activityDesc}>{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Vendors & Budget Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Selected Vendors */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Confirmed Vendors</h3>
                        </div>
                        {eventData.selectedVendors && eventData.selectedVendors.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {eventData.selectedVendors.map((vendor, index) => (
                                    <div key={index} style={styles.vendorCard}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={styles.vendorName}>{vendor.name}</h4>
                                            <span className="badge badge-info">{vendor.category}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{vendor.phoneNumber}</p>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{vendor.priceRange}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)' }}>No vendors selected yet.</p>
                        )}
                    </div>

                    {/* Budget Hint */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' }}>
                        <div className="card-header">
                            <h3 className="card-title">Financial Summary</h3>
                        </div>
                        <div style={styles.financialSummary}>
                            <p>You have allocated <strong>{eventData.budget ? formatCurrency(eventData.budget) : 'your budget'}</strong> across key categories.</p>
                            <button className="btn btn-secondary" onClick={() => navigate('/budget')} style={{ width: '100%', marginTop: '1rem' }}>
                                Review Allocation
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const styles = {
    header: {
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '2rem',
        flexWrap: 'wrap',
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
    snapshotGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1.5rem',
    },
    snapshotItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    iconBox: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--primary-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
    },
    label: {
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        display: 'block',
        marginBottom: '0.25rem',
    },
    value: {
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: 0,
    },
    timeline: {
        position: 'relative',
        borderLeft: '2px solid var(--border)',
        paddingLeft: '1.5rem',
        marginLeft: '1rem',
    },
    timelineItem: {
        position: 'relative',
        marginBottom: '2rem',
    },
    timeColumn: {
        position: 'absolute',
        left: '-7.5rem',
        top: '0',
        width: '5rem',
        textAlign: 'right',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--primary)',
    },
    timelineContent: {
        background: 'var(--bg-tertiary)',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
    },
    activityTitle: {
        margin: '0 0 0.5rem 0',
        color: 'var(--text-primary)',
    },
    activityDesc: {
        margin: 0,
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
    },
    vendorCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
    },
    vendorName: {
        margin: '0 0 0.25rem 0',
        color: 'var(--text-primary)',
    },
};

export default FinalPlan;
