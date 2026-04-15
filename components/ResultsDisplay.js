import { motion } from 'framer-motion'
import { ShieldAlert, User, CreditCard, ChevronRight, Activity, Database, Check, Cloud } from 'lucide-react'

export default function ResultsDisplay({ results, videoUrl, downloadUrl }) {
  if (!results) return null

  const isObject = !Array.isArray(results)
  const type = isObject ? (results.type || 'video') : 'video'
  const dataList = isObject ? (results.violations || []) : results

  const totalViolations = results.total_violations ?? dataList.filter(r => r.violation).length

  return (
    <motion.div
      className="results-grid"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="media-viewer glass-card">
        <div className="header-bar">
          <div className="status-indicator">
            <div className="dot" />
            <span>NEURAL FEED ACTIVE</span>
          </div>
          {results.drive_link && (
            <a
              href={results.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="cloud-badge"
            >
              <Cloud size={12} />
              <span>DRIVE REPLICA</span>
            </a>
          )}
          <div className="badge">ENCRYPTED</div>
        </div>
        <div className="media-container">
          {type === 'image' ? (
            <img src={results.image_data || videoUrl} alt="Processed result" className="processed-media" />
          ) : (
            <video controls className="processed-media">
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
        </div>
      </div>

      <div className="intel-panel">
        <div className="stats-header">
          <div className="stat-box glass-card danger">
            <Activity size={18} className="stat-icon" />
            <div className="stat-info">
              <span className="label">Violations</span>
              <span className="value">{totalViolations}</span>
            </div>
          </div>
          <div className="stat-box glass-card primary">
            <Database size={18} className="stat-icon" />
            <div className="stat-info">
              <span className="label">{type === 'image' ? 'Total Objects' : 'Frames Processed'}</span>
              <span className="value">{type === 'image' ? dataList.length : (results.total_frames || 0)}</span>
            </div>
          </div>
        </div>

        <div className="log-area glass-card">
          <div className="log-header">
            <h3>Detection Logs</h3>
            <span className="meta">{type === 'image' ? 'STATIC ANALYSIS' : 'REAL-TIME TELEMETRY'}</span>
          </div>
          <div className="log-scroll">
            {dataList.length > 0 ? dataList.slice(0, 50).map((result, idx) => (
              <motion.div
                key={idx}
                className={`log-entry ${result.violation ? 'violation' : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="entry-icon">
                  {result.violation ? <ShieldAlert size={16} /> : <Check size={16} />}
                </div>
                <div className="entry-content">
                  <div className="entry-top">
                    <span className="type-tag">{result.label || 'OBJECT'}</span>
                    {result.violation && <span className="alert-text">VIOLATION</span>}
                  </div>
                  {result.plate_text && result.plate_text !== "N/A" && (
                    <div className="plate-data">
                      <CreditCard size={12} />
                      <span>{result.plate_text}</span>
                    </div>
                  )}
                </div>
                <ChevronRight size={14} className="arrow" />
              </motion.div>
            )) : (
              <div className="empty-logs" style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.6 }}>
                <h4 style={{ color: '#FFF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>NO DETAILED TELEMETRY</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Basic object counting achieved natively.</p>
              </div>
            )}
          </div>
        </div>

        <div className="download-area glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: totalViolations > 0 ? '3px solid var(--accent)' : '3px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1rem', color: '#FFF' }}>Output Ready</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {totalViolations > 0 ? `⚠️ Detected ${totalViolations} violations. High-priority video processed.` : '✅ System scanned the feed completely. Zero violations found.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={downloadUrl || videoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                background: totalViolations > 0 ? 'var(--accent)' : 'var(--primary)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                color: totalViolations > 0 ? '#FFF' : '#000',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            >
              Download Result Video
            </a>
            <div style={{ flex: 1, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.65rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
              {downloadUrl || videoUrl}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .results-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 1100px) { .results-grid { grid-template-columns: 1fr; } }

        .media-viewer {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 1px;
        }

        .dot { 
          width: 8px; 
          height: 8px; 
          background: var(--primary); 
          border-radius: 50%; 
          box-shadow: 0 0 10px var(--primary);
          animation: blink 1s infinite;
        }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .badge {
          font-size: 0.6rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          color: var(--text-muted);
        }

        .cloud-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 229, 255, 0.1);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          color: var(--primary);
          font-size: 0.65rem;
          font-weight: 800;
          text-decoration: none;
          border: 1px solid rgba(0, 229, 255, 0.2);
          transition: var(--transition-fast);
        }

        .cloud-badge:hover {
          background: rgba(0, 229, 255, 0.2);
          transform: translateY(-1px);
        }

        .media-container {
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          aspect-ratio: 16 / 9;
          border: 1px solid var(--glass-border);
        }

        .processed-media { width: 100%; height: 100%; object-fit: contain; }

        .intel-panel { display: flex; flex-direction: column; gap: 1.5rem; }

        .stats-header { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .stat-box {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-box.danger { border-color: rgba(244, 63, 94, 0.3); }
        .stat-box.danger .stat-icon { color: var(--accent); }
        .stat-box.primary .stat-icon { color: var(--primary); }

        .stat-info .label { 
          display: block; 
          font-size: 0.6rem; 
          color: var(--text-muted); 
          font-weight: 700;
          text-transform: uppercase;
        }

        .stat-info .value { font-size: 1.75rem; font-weight: 800; color: #FFF; }

        .log-area { display: flex; flex-direction: column; height: 450px; }

        .log-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .log-header h3 { font-size: 1rem; font-weight: 700; color: #FFF; }
        .log-header .meta { font-size: 0.6rem; color: var(--text-muted); font-weight: 800; }

        .log-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .log-entry {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: var(--transition-fast);
        }

        .log-entry:hover { background: rgba(255, 255, 255, 0.06); border-color: var(--glass-border); }

        .log-entry.violation { border-left: 3px solid var(--accent); background: rgba(244, 63, 94, 0.05); }

        .entry-icon { 
          width: 32px; height: 32px; 
          border-radius: 8px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
        }

        .violation .entry-icon { color: var(--accent); background: rgba(244, 63, 94, 0.1); }

        .entry-content { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }

        .entry-top { display: flex; align-items: center; gap: 0.75rem; }

        .type-tag { font-size: 0.75rem; font-weight: 700; color: #FFF; }

        .alert-text { font-size: 0.6rem; color: var(--accent); font-weight: 800; }

        .plate-data { display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--text-muted); }

        .arrow { color: var(--glass-border); }

        .empty-logs { text-align: center; color: var(--text-muted); font-size: 0.7rem; padding: 4rem 0; font-weight: 700; opacity: 0.5; }
      `}</style>
    </motion.div>
  )
}
