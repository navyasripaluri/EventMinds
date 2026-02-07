import React, { useState } from 'react';
import { Palette, Sparkles, ChevronRight } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../config';

function ThemeCreator() {
    const { eventData, updateEventData } = useEvent();
    const navigate = useNavigate();

    const [description, setDescription] = useState(eventData.description || '');
    const [theme, setTheme] = useState(eventData.theme || null);
    const [eventType, setEventType] = useState(eventData.eventType || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!description.trim() || !eventType) {
            setError('Please select an event type and enter a description');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/theme/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, eventType }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Generation failed');
            }

            const data = await response.json();
            setTheme(data);
            updateEventData({
                theme: data,
                description,
                eventType
            });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to generate theme. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const themeExamples = [
        'Cyberpunk theme with neon lights',
        'Rustic vintage wedding with warm tones',
        'Futuristic tech conference with minimalist design',
        'Tropical beach party with vibrant colors',
        'Elegant black-tie gala with gold accents',
    ];

    return (
        <div className="container">
            <div style={styles.header} className="fade-in">
                <div>
                    <h1 style={styles.title}>
                        <Palette size={48} style={{ color: 'var(--primary)' }} />
                        Theme & Moodboard Creator
                    </h1>
                    <p style={styles.subtitle}>
                        Describe your vision and let AI create a complete visual theme with color palettes and decoration ideas.
                    </p>
                </div>
            </div>

            <div className="card" style={styles.inputCard}>
                <form onSubmit={handleGenerate}>
                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Event Type</label>
                            <select
                                className="select"
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                            >
                                <option value="">Select type...</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Corporate">Corporate</option>
                                <option value="College Fest">College Fest</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Hackathon">Hackathon</option>
                            </select>
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Describe Your Vision</label>
                            <textarea
                                className="textarea"
                                placeholder="e.g., Cyberpunk theme with neon lights and futuristic vibes"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={1}
                                style={{ minHeight: '42px', resize: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={styles.examples}>
                        <span style={styles.exampleLabel}>Quick Vibes:</span>
                        {themeExamples.map((example) => (
                            <button
                                key={example}
                                type="button"
                                onClick={() => setDescription(example)}
                                style={styles.exampleChip}
                            >
                                {example}
                            </button>
                        ))}
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
                        <Sparkles size={18} />
                        {loading ? 'Designing Your Vibe...' : 'Generate Theme Context'}
                    </button>
                </form>
            </div>

            {loading && (
                <div style={styles.loadingContainer}>
                    <div className="spinner"></div>
                    <p style={styles.loadingText}>Creating your perfect theme...</p>
                </div>
            )}

            {!loading && theme && (
                <div className="grid grid-2 fade-in">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Color Palette</h3>
                        </div>
                        <div style={styles.colorGrid}>
                            {theme.colorPalette?.map((color, index) => (
                                <div key={index} style={styles.colorCard}>
                                    <div
                                        style={{
                                            ...styles.colorSwatch,
                                            background: color,
                                        }}
                                    ></div>
                                    <p style={styles.colorCode}>{color}</p>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(color)}
                                        className="btn btn-secondary"
                                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Visual Description</h3>
                        </div>
                        <p style={styles.description}>{theme.visualDescription}</p>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Decoration Elements</h3>
                        </div>
                        <div style={styles.elementsList}>
                            {theme.decorElements?.map((element, index) => (
                                <div key={index} style={styles.elementItem}>
                                    <div style={styles.elementDot}></div>
                                    <span>{element}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Lighting & Atmosphere</h3>
                        </div>
                        <div style={styles.detailSection}>
                            <div style={styles.detailItem}>
                                <h4 style={styles.detailTitle}>Lighting Style</h4>
                                <p style={styles.detailText}>{theme.lightingStyle}</p>
                            </div>
                            <div style={styles.detailItem}>
                                <h4 style={styles.detailTitle}>Overall Atmosphere</h4>
                                <p style={styles.detailText}>{theme.atmosphere}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!loading && theme && (
                <div style={styles.flowAction}>
                    <div style={styles.flowInfo}>
                        <h4 style={{ margin: 0, color: 'var(--success)' }}>✨ Theme Ready!</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Final: Allocate your budget across categories for your {eventType}.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/budget')}>
                        Final Step: Allocation Budget
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
    inputCard: {
        marginBottom: '2rem',
    },
    examples: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        margin: '1rem 0',
        alignItems: 'center',
    },
    exampleLabel: {
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        fontWeight: 600,
    },
    exampleChip: {
        padding: '0.4rem 0.75rem',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: '999px',
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
    },
    error: {
        padding: '1rem',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid var(--error)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--error)',
        marginTop: '1rem',
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
    colorGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '1rem',
    },
    colorCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    colorSwatch: {
        width: '100%',
        height: '80px',
        borderRadius: 'var(--radius-md)',
        border: '2px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform var(--transition-base)',
        cursor: 'pointer',
    },
    colorCode: {
        textAlign: 'center',
        color: 'var(--text-primary)',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        fontWeight: 600,
        margin: 0,
    },
    description: {
        color: 'var(--text-secondary)',
        lineHeight: 1.8,
        fontSize: '1rem',
    },
    elementsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    elementItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        transition: 'all var(--transition-base)',
    },
    elementDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        flexShrink: 0,
    },
    detailSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    detailItem: {
        padding: '1rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
    },
    detailTitle: {
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
    },
    detailText: {
        color: 'var(--text-secondary)',
        margin: 0,
        lineHeight: 1.6,
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

export default ThemeCreator;
