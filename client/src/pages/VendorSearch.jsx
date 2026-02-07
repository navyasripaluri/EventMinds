import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Star, DollarSign, ChevronRight, CheckCircle2, Users, MapPin, CalendarDays, Trophy, Phone, MessageSquare } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../config';

function VendorSearch() {
    const { eventData, updateEventData } = useEvent();
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    // Auto-search if coming from theme context
    // useEffect(() => {
    //     if (eventData.description && vendors.length === 0 && !hasSearched) {
    //         handleSearchLogic(eventData.description);
    //     }
    // }, [eventData.description]);

    const handleSearchLogic = async (searchQuery) => {
        if (!searchQuery?.trim()) return;

        setLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const response = await fetch(`${API_URL}/vendors/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Search failed');
            }

            const data = await response.json();
            setVendors(data);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to search vendors. Make sure the server is running.');
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleSearchLogic(query);
    };

    const handleContact = (vendor) => {
        setSelectedVendor(vendor);
    };

    const toggleVendor = (vendor) => {
        const isSelected = eventData.selectedVendors.some(v => (v._id || v.name) === (vendor._id || vendor.name));
        let newSelected;

        if (isSelected) {
            // Deselect: Remove the vendor
            newSelected = eventData.selectedVendors.filter(v => (v._id || v.name) !== (vendor._id || vendor.name));
        } else {
            // Select: Add the vendor and remove any *other* vendor of the same category (Single-select per category)
            const others = eventData.selectedVendors.filter(v => v.category !== vendor.category);
            newSelected = [...others, vendor];
        }

        updateEventData({ selectedVendors: newSelected });
    };

    const handleCall = (vendor) => {
        if (!vendor.phoneNumber) return;
        window.location.href = `tel:${vendor.phoneNumber.replace(/\s+/g, '')}`;
    };

    const handleMessage = (vendor) => {
        if (!vendor.phoneNumber) return;
        const text = encodeURIComponent(`Hi ${vendor.name}, I found your profile on EventMinds and would like to discuss my upcoming event.`);
        window.location.href = `sms:${vendor.phoneNumber.replace(/\s+/g, '')}?body=${text}`;
    };

    const seedVendors = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/vendors/seed`, {
                method: 'POST',
            });
            const data = await response.json();
            alert(data.message);
        } catch (err) {
            alert('Failed to seed vendors. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const getPriceRangeColor = (range) => {
        if (range === '$$$$') return 'var(--error)';
        if (range === '$$$') return 'var(--warning)';
        return 'var(--success)';
    };

    return (
        <div className="container">
            <div style={styles.header} className="fade-in">
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>
                        <Sparkles size={48} style={{ color: 'var(--primary)' }} />
                        Vibe-Match Vendor Discovery
                    </h1>
                    <p style={styles.subtitle}>
                        Find the perfect vendors using AI-powered semantic search. Describe the vibe you want, and we'll find matches.
                    </p>
                </div>
                <button onClick={seedVendors} className="btn btn-secondary" disabled={loading}>
                    Seed Sample Vendors
                </button>
            </div>

            <div className="card" style={styles.searchCard}>
                <form onSubmit={handleSearch}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Describe Your Ideal Vendor</label>
                        <div style={styles.searchInputWrapper}>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., A photographer who captures candid, moody shots"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={styles.searchInput}
                            />
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <Search size={18} />
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </form>

                <div style={styles.examples}>
                    <span style={styles.exampleLabel}>Try:</span>
                    {[
                        'Spicy street food with rustic vibes',
                        'High energy DJ for college fest',
                        'Elegant classical music for wedding',
                        'Cyberpunk neon decorations',
                    ].map((example) => (
                        <button
                            key={example}
                            onClick={() => {
                                setQuery(example);
                                handleSearchLogic(example);
                            }}
                            style={styles.exampleChip}
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="card" style={{ ...styles.errorCard, borderColor: 'var(--error)' }}>
                    <p style={{ color: 'var(--error)', margin: 0 }}>{error}</p>
                </div>
            )}

            {loading && (
                <div style={styles.loadingContainer}>
                    <div className="spinner"></div>
                    <p style={styles.loadingText}>Finding your perfect matches...</p>
                </div>
            )}

            {!loading && hasSearched && vendors.length === 0 && !error && (
                <div className="card text-center">
                    <p style={{ color: 'var(--text-muted)' }}>
                        No vendors found. Try a different search or seed sample vendors first.
                    </p>
                </div>
            )}

            {!loading && vendors.length > 0 && (
                <div>
                    <h3 style={styles.resultsTitle}>
                        Found {vendors.length} matching vendor{vendors.length !== 1 ? 's' : ''}
                    </h3>
                    <div className="grid grid-2">
                        {vendors.map((vendor, index) => (
                            <div
                                key={vendor._id || index}
                                className="card"
                                style={{
                                    ...styles.vendorCard,
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            >
                                <div style={styles.vendorHeader}>
                                    <div>
                                        <h3 style={styles.vendorName}>{vendor.name}</h3>
                                        <span className="badge badge-info" style={styles.categoryBadge}>
                                            {vendor.category}
                                        </span>
                                    </div>
                                    <div style={styles.vendorMeta}>
                                        <div style={styles.rating}>
                                            <Star size={16} fill="var(--warning)" color="var(--warning)" />
                                            <span>{vendor.rating}</span>
                                        </div>
                                        <div style={{ color: getPriceRangeColor(vendor.priceRange), fontWeight: 700 }}>
                                            {vendor.priceRange}
                                        </div>
                                    </div>
                                </div>

                                <p style={styles.vendorDescription}>{vendor.description}</p>

                                <div style={styles.vendorDetails}>
                                    <div>
                                        <strong style={styles.detailLabel}>Style:</strong>
                                        <p style={styles.detailText}>{vendor.style}</p>
                                    </div>
                                    <div>
                                        <strong style={styles.detailLabel}>Specialties:</strong>
                                        <div style={styles.specialties}>
                                            {vendor.specialties?.map((specialty) => (
                                                <span key={specialty} className="badge badge-success">
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {vendor.similarityScore && (
                                    <div style={styles.matchScore}>
                                        <div style={styles.matchBar}>
                                            <div
                                                style={{
                                                    ...styles.matchBarFill,
                                                    width: `${vendor.similarityScore * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span style={{
                                            ...styles.matchText,
                                            color: vendor.isAIGenerated ? '#a855f7' : styles.matchText.color
                                        }}>
                                            {vendor.isAIGenerated ? '✨ AI Best Match' : `${Math.round(vendor.similarityScore * 100)}% Match`}
                                        </span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ flex: 1, minWidth: '100px' }}
                                        onClick={() => handleContact(vendor)}
                                    >
                                        Details
                                    </button>
                                    <button
                                        className={`btn ${eventData.selectedVendors.some(v => (v._id || v.name) === (vendor._id || vendor.name)) ? 'btn-success' : 'btn-primary'}`}
                                        style={{ flex: 2, minWidth: '150px' }}
                                        onClick={() => toggleVendor(vendor)}
                                    >
                                        {eventData.selectedVendors.some(v => (v._id || v.name) === (vendor._id || vendor.name)) ? '✓ Added' : 'Add to Event'}
                                    </button>

                                    {eventData.selectedVendors.some(v => (v._id || v.name) === (vendor._id || vendor.name)) && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', marginTop: '0.25rem', background: 'linear-gradient(135deg, var(--warning), var(--secondary))', fontWeight: 600 }}
                                            onClick={() => navigate('/contract')}
                                        >
                                            Next Step: Analyze Contract →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {eventData.selectedVendors.length > 0 && (
                        <div style={styles.flowAction} className="fade-in">
                            <div style={styles.flowInfo}>
                                <h4 style={{ margin: 0, color: 'var(--success)' }}>🤝 {eventData.selectedVendors.length} Vendor{eventData.selectedVendors.length > 1 ? 's' : ''} Selected!</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Next: Analyze the contract for your selected vendor{eventData.selectedVendors.length > 1 ? 's' : ''}.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => navigate('/contract')}>
                                Next Step: Analyze Contracts
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            )
            }

            {
                selectedVendor && (
                    <div style={styles.modalOverlay} onClick={() => setSelectedVendor(null)}>
                        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <button style={styles.closeButton} onClick={() => setSelectedVendor(null)}>&times;</button>

                            <div style={styles.modalHeader}>
                                <div>
                                    <h2 style={styles.modalTitle}>{selectedVendor.name}</h2>
                                    <span className="badge badge-info">{selectedVendor.category}</span>
                                </div>
                                <div style={styles.modalStats}>
                                    <div style={styles.rating}>
                                        <Star size={20} fill="var(--warning)" color="var(--warning)" />
                                        <span style={{ fontSize: '1.2rem' }}>{selectedVendor.rating}</span>
                                    </div>
                                    <div style={{ color: getPriceRangeColor(selectedVendor.priceRange), fontWeight: 800, fontSize: '1.2rem' }}>
                                        {selectedVendor.priceRange}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.modalBody}>
                                <section style={styles.modalSection}>
                                    <h4 style={styles.sectionTitle}>About</h4>
                                    <p style={styles.modalDescription}>{selectedVendor.description}</p>
                                </section>

                                <div className="grid grid-2" style={{ gap: '2rem' }}>
                                    <section style={styles.modalSection}>
                                        <h4 style={styles.sectionTitle}>Style & Vibe</h4>
                                        <p style={styles.detailText}>{selectedVendor.style}</p>
                                    </section>
                                    <section style={styles.modalSection}>
                                        <h4 style={styles.sectionTitle}>Specialties</h4>
                                        <div style={styles.specialties}>
                                            {selectedVendor.specialties?.map((s) => (
                                                <span key={s} className="badge badge-success">{s}</span>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {selectedVendor.highlights && selectedVendor.highlights.length > 0 && (
                                    <section style={styles.modalSection}>
                                        <h4 style={styles.sectionTitle}>
                                            <Trophy size={16} style={{ marginRight: '0.5rem' }} />
                                            Professional Highlights
                                        </h4>
                                        <ul style={styles.highlightsList}>
                                            {selectedVendor.highlights.map((h, i) => (
                                                <li key={i} style={styles.highlightItem}>
                                                    <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '0.2rem' }} />
                                                    <span>{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                <section style={styles.modalSection}>
                                    <h4 style={styles.sectionTitle}>
                                        <Users size={16} style={{ marginRight: '0.5rem' }} />
                                        Team & Experience
                                    </h4>
                                    <p style={styles.detailText}>{selectedVendor.teamInfo || "Our dedicated team is committed to making your event special."}</p>

                                    <div style={styles.detailGrid}>
                                        {selectedVendor.personalDetails?.yearsExp && (
                                            <div style={styles.detailChip}>
                                                <CalendarDays size={14} />
                                                <span>{selectedVendor.personalDetails.yearsExp} Years Exp.</span>
                                            </div>
                                        )}
                                        {selectedVendor.personalDetails?.location && (
                                            <div style={styles.detailChip}>
                                                <MapPin size={14} />
                                                <span>{selectedVendor.personalDetails.location}</span>
                                            </div>
                                        )}
                                        {selectedVendor.personalDetails?.teamSize && (
                                            <div style={styles.detailChip}>
                                                <Users size={14} />
                                                <span>Team of {selectedVendor.personalDetails.teamSize}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>



                                {(selectedVendor.phoneNumber || selectedVendor.contact) && (
                                    <section style={styles.modalSection}>
                                        <h4 style={styles.sectionTitle}>Direct Connection</h4>
                                        <div style={styles.contactInfo}>
                                            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Phone size={16} />
                                                <strong>Phone:</strong> {selectedVendor.phoneNumber || 'Contact for details'}
                                            </p>
                                        </div>
                                    </section>
                                )}
                            </div>

                            <div style={styles.modalFooter}>
                                <button className="btn btn-secondary" onClick={() => setSelectedVendor(null)}>Close</button>
                                <button className="btn btn-primary" onClick={() => handleMessage(selectedVendor)} style={{ background: 'var(--secondary)', border: 'none' }}>
                                    <MessageSquare size={18} />
                                    Send Message
                                </button>
                                <button className="btn btn-primary" onClick={() => handleCall(selectedVendor)}>
                                    <Phone size={18} />
                                    Call Now
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
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
    headerContent: {
        flex: 1,
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
    searchCard: {
        marginBottom: '2rem',
    },
    searchInputWrapper: {
        display: 'flex',
        gap: '0.75rem',
    },
    searchInput: {
        flex: 1,
    },
    examples: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '1rem',
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
    errorCard: {
        marginBottom: '2rem',
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
        fontSize: '1.1rem',
    },
    resultsTitle: {
        marginBottom: '1.5rem',
        color: 'var(--text-primary)',
    },
    vendorCard: {
        animation: 'fadeIn 0.5s ease forwards',
        opacity: 0,
    },
    vendorHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        gap: '1rem',
    },
    vendorName: {
        margin: '0 0 0.5rem 0',
        fontSize: '1.5rem',
    },
    categoryBadge: {
        fontSize: '0.75rem',
    },
    vendorMeta: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem',
    },
    rating: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        color: 'var(--text-primary)',
        fontWeight: 600,
    },
    vendorDescription: {
        color: 'var(--text-secondary)',
        marginBottom: '1rem',
        lineHeight: 1.6,
    },
    vendorDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1rem',
        padding: '1rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
    },
    detailLabel: {
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
        display: 'block',
        marginBottom: '0.25rem',
    },
    detailText: {
        color: 'var(--text-secondary)',
        margin: 0,
        fontSize: '0.9rem',
    },
    specialties: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.25rem',
    },
    matchScore: {
        marginTop: '1rem',
    },
    matchBar: {
        width: '100%',
        height: '8px',
        background: 'var(--bg-tertiary)',
        borderRadius: '999px',
        overflow: 'hidden',
        marginBottom: '0.5rem',
    },
    matchBarFill: {
        height: '100%',
        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
        transition: 'width 1s ease',
    },
    matchText: {
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        fontWeight: 600,
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
    },
    modalContent: {
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--border)',
        animation: 'modalFadeIn 0.3s ease-out',
    },
    closeButton: {
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        fontSize: '2rem',
        cursor: 'pointer',
        lineHeight: 1,
    },
    modalHeader: {
        padding: '2.5rem 2.5rem 1.5rem 2.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    modalTitle: {
        fontSize: '2rem',
        margin: '0 0 0.5rem 0',
        color: 'var(--primary)',
    },
    modalStats: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem',
    },
    modalBody: {
        padding: '2.5rem',
    },
    modalSection: {
        marginBottom: '2rem',
    },
    sectionTitle: {
        textTransform: 'uppercase',
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        marginBottom: '0.75rem',
    },
    modalDescription: {
        fontSize: '1.1rem',
        lineHeight: 1.7,
        color: 'var(--text-primary)',
    },
    contactInfo: {
        padding: '1rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
    },
    modalFooter: {
        padding: '1.5rem 2.5rem',
        background: 'var(--bg-tertiary)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        borderTop: '1px solid var(--border)',
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
    highlightsList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    highlightItem: {
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
    },
    detailGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginTop: '1.25rem',
    },
    detailChip: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.8rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
    },
};

export default VendorSearch;
