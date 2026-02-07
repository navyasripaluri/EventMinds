import React, { useState, useEffect } from 'react';
import { FileText, Upload, AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../config';

function ContractAnalyzer() {
    const { eventData } = useEvent();
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Rate limit handling: timestamp (ms) until which retries are blocked
    const [retryUntil, setRetryUntil] = useState(0);
    const [retryRemaining, setRetryRemaining] = useState(0);

    useEffect(() => {
        if (!retryUntil) {
            setRetryRemaining(0);
            return;
        }
        const update = () => {
            const rem = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
            setRetryRemaining(rem);
            if (rem <= 0) setRetryUntil(0);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [retryUntil]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setAnalysis(null);
            setError('');
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        if (retryUntil && Date.now() < retryUntil) {
            setError(`Rate limit exceeded. Please try again in ${Math.ceil((retryUntil - Date.now()) / 1000)}s.`);
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('contract', file);

        try {
            const response = await fetch(`${API_URL}/contracts/analyze`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    const retryAfter = data.retryAfter || 30;
                    setRetryUntil(Date.now() + retryAfter * 1000);
                    setError(data.error ? `${data.error} Please try again in ${retryAfter}s.` : `Rate limit exceeded. Please try again in ${retryAfter}s.`);
                    setLoading(false);
                    return;
                }
                throw new Error(data.error || 'Analysis failed');
            }

            setAnalysis(data);
        } catch (err) {
            setError(err.message === 'Failed to fetch'
                ? 'Failed to connect to server. Make sure the backend is running.'
                : err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        if (level === 'high') return 'var(--error)';
        if (level === 'medium') return 'var(--warning)';
        return 'var(--success)';
    };

    const getRiskIcon = (level) => {
        if (level === 'high') return <XCircle size={24} color="var(--error)" />;
        if (level === 'medium') return <AlertTriangle size={24} color="var(--warning)" />;
        return <CheckCircle size={24} color="var(--success)" />;
    };

    return (
        <div className="container">
            <div style={styles.header} className="fade-in">
                <div>
                    <h1 style={styles.title}>
                        <FileText size={48} style={{ color: 'var(--primary)' }} />
                        Contract "Gotcha" Detector
                    </h1>
                    <p style={styles.subtitle}>
                        Upload vendor contracts and let AI analyze them for risky clauses, hidden fees, and unfair terms.
                    </p>
                </div>
            </div>

            <div className="grid grid-2" style={{ alignItems: 'start' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Upload Contract</h3>
                        <p className="card-description">
                            Supported formats: PDF, TXT
                        </p>
                    </div>

                    <div style={styles.uploadArea}>
                        <input
                            type="file"
                            id="file-upload"
                            accept=".pdf,.txt"
                            onChange={handleFileChange}
                            style={styles.fileInput}
                        />
                        <label htmlFor="file-upload" style={styles.uploadLabel}>
                            <Upload size={48} color="var(--primary)" />
                            <div>
                                <p style={styles.uploadText}>
                                    {file ? file.name : 'Click to upload or drag and drop'}
                                </p>
                                <p style={styles.uploadSubtext}>
                                    PDF or TXT files only
                                </p>
                            </div>
                        </label>
                    </div>

                    {file && (
                        <div style={styles.fileInfo}>
                            <FileText size={20} color="var(--primary)" />
                            <div style={{ flex: 1 }}>
                                <p style={styles.fileName}>{file.name}</p>
                                <p style={styles.fileSize}>
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAnalyze}
                        className="btn btn-primary"
                        disabled={!file || loading || (retryUntil && Date.now() < retryUntil)}
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Contract'}
                    </button>

                    {error && (
                        <div style={styles.error}>
                            <AlertTriangle size={20} />
                            <div>
                                <p>{error}</p>
                                {retryRemaining > 0 && (
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
                                        Auto-unlock in {retryRemaining}s
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="card" style={styles.resultsCard}>
                    <div className="card-header">
                        <h3 className="card-title">Analysis Results</h3>
                    </div>

                    {loading && (
                        <div style={styles.loadingContainer}>
                            <div className="spinner"></div>
                            <p style={styles.loadingText}>Analyzing contract for risks...</p>
                        </div>
                    )}

                    {!loading && !analysis && (
                        <div style={styles.emptyState}>
                            <FileText size={64} color="var(--text-muted)" />
                            <p style={styles.emptyText}>
                                Upload a contract to see the analysis
                            </p>
                        </div>
                    )}

                    {!loading && analysis && (
                        <div style={styles.analysisContent}>
                            <div style={styles.riskLevel}>
                                {getRiskIcon(analysis.riskLevel)}
                                <div>
                                    <p style={styles.riskLabel}>Overall Risk Level</p>
                                    <p style={{ ...styles.riskValue, color: getRiskColor(analysis.riskLevel) }}>
                                        {analysis.riskLevel?.toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            {analysis.summary && (
                                <div style={styles.summary}>
                                    <h4 style={styles.sectionTitle}>Summary</h4>
                                    <p style={styles.summaryText}>{analysis.summary}</p>
                                </div>
                            )}

                            {analysis.warnings && analysis.warnings.length > 0 && (
                                <div style={styles.warnings}>
                                    <h4 style={styles.sectionTitle}>
                                        ⚠️ Warnings ({analysis.warnings.length})
                                    </h4>
                                    <div style={styles.warningsList}>
                                        {analysis.warnings.map((warning, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    ...styles.warningItem,
                                                    borderLeftColor: getRiskColor(warning.severity),
                                                }}
                                            >
                                                <div style={styles.warningHeader}>
                                                    <span style={styles.warningClause}>{warning.clause}</span>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: `${getRiskColor(warning.severity)}20`,
                                                            color: getRiskColor(warning.severity),
                                                        }}
                                                    >
                                                        {warning.severity}
                                                    </span>
                                                </div>
                                                <p style={styles.warningIssue}>{warning.issue}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysis.warnings && analysis.warnings.length === 0 && (
                                <div style={styles.noWarnings}>
                                    <CheckCircle size={48} color="var(--success)" />
                                    <p style={styles.noWarningsText}>
                                        No major issues detected! This contract appears to be fair.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {!loading && analysis && (
                <div style={styles.flowAction}>
                    <div style={styles.flowInfo}>
                        <h4 style={{ margin: 0, color: 'var(--success)' }}>🛡️ Analysis Complete!</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Next: Design the timeline for your {eventData.eventType || 'event'}.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/schedule')}>
                        Next Step: Build Schedule
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
    uploadArea: {
        position: 'relative',
        marginBottom: '1rem',
    },
    fileInput: {
        display: 'none',
    },
    uploadLabel: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '3rem',
        border: '2px dashed var(--border)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        background: 'var(--bg-secondary)',
    },
    uploadText: {
        color: 'var(--text-primary)',
        fontWeight: 600,
        margin: 0,
        textAlign: 'center',
    },
    uploadSubtext: {
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        margin: '0.25rem 0 0 0',
        textAlign: 'center',
    },
    fileInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
    },
    fileName: {
        color: 'var(--text-primary)',
        fontWeight: 600,
        margin: 0,
    },
    fileSize: {
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        margin: '0.25rem 0 0 0',
    },
    error: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid var(--error)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--error)',
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
    analysisContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    riskLevel: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.5rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
    },
    riskLabel: {
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        margin: 0,
    },
    riskValue: {
        fontSize: '1.5rem',
        fontWeight: 700,
        margin: '0.25rem 0 0 0',
    },
    summary: {
        padding: '1rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
    },
    sectionTitle: {
        color: 'var(--text-primary)',
        fontSize: '1.1rem',
        marginBottom: '0.75rem',
    },
    summaryText: {
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        margin: 0,
    },
    warnings: {},
    warningsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    warningItem: {
        padding: '1rem',
        background: 'var(--bg-tertiary)',
        borderLeft: '4px solid',
        borderRadius: 'var(--radius-md)',
    },
    warningHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        gap: '1rem',
    },
    warningClause: {
        color: 'var(--text-primary)',
        fontWeight: 600,
        fontSize: '0.95rem',
    },
    warningIssue: {
        color: 'var(--text-secondary)',
        margin: 0,
        lineHeight: 1.5,
    },
    noWarnings: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '2rem',
    },
    noWarningsText: {
        color: 'var(--text-secondary)',
        textAlign: 'center',
        margin: 0,
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

export default ContractAnalyzer;
