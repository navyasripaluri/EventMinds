import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../config';

function ScheduleBuilder() {
    const { eventData, updateEventData } = useEvent();
    const navigate = useNavigate();

    const [eventType, setEventType] = useState('');
    const [duration, setDuration] = useState('');
    const [activities, setActivities] = useState(['']);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editForm, setEditForm] = useState({
        time: '',
        duration: '',
        activity: '',
        notes: ''
    });

    const handleEditClick = (index, item) => {
        setEditingIndex(index);
        setEditForm({ ...item });
    };

    const handleCancelEdit = () => {
        setEditingIndex(-1);
        setEditForm(null);
    };

    const handleSaveEdit = () => {
        const newSchedule = [...schedule];
        newSchedule[editingIndex] = editForm;
        setSchedule(newSchedule);
        updateEventData({ schedule: newSchedule });
        setEditingIndex(-1);
        setEditForm(null);
    };

    const handleEditFormChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAddActivity = () => {
        setActivities([...activities, '']);
    };

    const handleRemoveActivity = (index) => {
        setActivities(activities.filter((_, i) => i !== index));
    };

    const handleActivityChange = (index, value) => {
        const newActivities = [...activities];
        newActivities[index] = value;
        setActivities(newActivities);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        const validActivities = activities.filter(a => a.trim());
        if (!eventType || !duration || validActivities.length === 0) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/schedule/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType,
                    duration: parseInt(duration),
                    activities: validActivities,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Generation failed');
            }

            const data = await response.json();
            setSchedule(data);
            updateEventData({
                schedule: data,
                eventType,
                duration: parseInt(duration),
                activities: validActivities
            });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to generate schedule. Make sure the server is running.');
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
        'Workshop',
    ];

    return (
        <div className="container">
            <div style={styles.header} className="fade-in">
                <div>
                    <h1 style={styles.title}>
                        <Calendar size={48} style={{ color: 'var(--primary)' }} />
                        Run of Show Generator
                    </h1>
                    <p style={styles.subtitle}>
                        Generate a detailed, time-stamped event schedule with AI. Perfect for ensuring logical flow and timing.
                    </p>
                </div>
            </div>

            <div className="grid grid-2" style={{ alignItems: 'start' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Event Details</h3>
                        <p className="card-description">
                            Provide information about your event
                        </p>
                    </div>

                    <form onSubmit={handleGenerate}>
                        <div className="input-group">
                            <label className="input-label">Duration (hours)</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="e.g., 24"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                min="1"
                                max="168"
                            />
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

                        <div className="input-group">
                            <label className="input-label">Key Activities</label>
                            {activities.map((activity, index) => (
                                <div key={index} style={styles.activityRow}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder={`Activity ${index + 1}`}
                                        value={activity}
                                        onChange={(e) => handleActivityChange(index, e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    {activities.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveActivity(index)}
                                            className="btn btn-secondary"
                                            style={styles.removeBtn}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddActivity}
                                className="btn btn-ghost"
                                style={{ width: '100%' }}
                            >
                                <Plus size={18} />
                                Add Activity
                            </button>
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
                            {loading ? 'Generating...' : 'Generate Schedule'}
                        </button>
                    </form>
                </div>

                <div className="card" style={styles.scheduleCard}>
                    <div className="card-header">
                        <h3 className="card-title">Generated Schedule</h3>
                    </div>

                    {loading && (
                        <div style={styles.loadingContainer}>
                            <div className="spinner"></div>
                            <p style={styles.loadingText}>Creating your perfect schedule...</p>
                        </div>
                    )}

                    {!loading && schedule.length === 0 && (
                        <div style={styles.emptyState}>
                            <Clock size={64} color="var(--text-muted)" />
                            <p style={styles.emptyText}>
                                Fill in the event details to generate a schedule
                            </p>
                        </div>
                    )}

                    {!loading && schedule.length > 0 && (
                        <div style={styles.timeline}>
                            {schedule.map((item, index) => (
                                <div key={index} style={styles.timelineItem}>
                                    <div style={styles.timelineDot}></div>
                                    <div style={styles.timelineContent}>
                                        {editingIndex === index ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={editForm.time}
                                                        onChange={(e) => handleEditFormChange('time', e.target.value)}
                                                        placeholder="Time"
                                                        style={{ flex: 1 }}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={editForm.duration}
                                                        onChange={(e) => handleEditFormChange('duration', e.target.value)}
                                                        placeholder="Duration"
                                                        style={{ flex: 1 }}
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={editForm.activity}
                                                    onChange={(e) => handleEditFormChange('activity', e.target.value)}
                                                    placeholder="Activity"
                                                />
                                                <textarea
                                                    className="input"
                                                    value={editForm.notes || ''}
                                                    onChange={(e) => handleEditFormChange('notes', e.target.value)}
                                                    placeholder="Notes"
                                                    rows="2"
                                                    style={{ resize: 'vertical' }}
                                                />
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={handleSaveEdit}
                                                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <Check size={16} /> Save
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={handleCancelEdit}
                                                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <X size={16} /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={styles.timelineHeader}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={styles.timelineTime}>
                                                            <Clock size={16} />
                                                            {item.time}
                                                        </span>
                                                        <span className="badge badge-info">
                                                            {item.duration}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => handleEditClick(index, item)}
                                                        style={{ padding: '0.25rem' }}
                                                        title="Edit Activity"
                                                    >
                                                        <Edit2 size={16} color="var(--text-secondary)" />
                                                    </button>
                                                </div>
                                                <h4 style={styles.timelineActivity}>{item.activity}</h4>
                                                {item.notes && (
                                                    <p style={styles.timelineNotes}>{item.notes}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {!loading && schedule.length > 0 && (
                <div style={styles.flowAction}>
                    <div style={styles.flowInfo}>
                        <h4 style={{ margin: 0, color: 'var(--success)' }}>📅 Schedule Locked!</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Next: Create a visual theme and moodboard for your {eventType}.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/theme')}>
                        Next Step: Create Theme
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
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
    activityRow: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.5rem',
    },
    removeBtn: {
        padding: '0.5rem',
    },
    error: {
        padding: '1rem',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid var(--error)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--error)',
        marginBottom: '1rem',
    },
    scheduleCard: {
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
    timeline: {
        position: 'relative',
        paddingLeft: '2rem',
    },
    timelineItem: {
        position: 'relative',
        paddingBottom: '2rem',
    },
    timelineDot: {
        position: 'absolute',
        left: '-2rem',
        top: '0.5rem',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        boxShadow: '0 0 0 4px var(--bg-primary)',
    },
    timelineContent: {
        background: 'var(--bg-tertiary)',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        borderLeft: '3px solid var(--primary)',
    },
    timelineHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        gap: '1rem',
    },
    timelineTime: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--primary)',
        fontWeight: 600,
        fontSize: '0.9rem',
    },
    timelineActivity: {
        color: 'var(--text-primary)',
        fontSize: '1.1rem',
        margin: '0 0 0.5rem 0',
    },
    timelineNotes: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        margin: 0,
        lineHeight: 1.5,
    },
    flowAction: {
        marginTop: '3rem',
        padding: '2rem',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        boxShadow: 'var(--shadow-lg)',
    },
    flowInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
};

export default ScheduleBuilder;
