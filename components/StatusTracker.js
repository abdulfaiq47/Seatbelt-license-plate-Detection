'use client'

import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default function StatusTracker({ status, error, progress }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'queued':
        return {
          icon: <Clock className="status-icon" />,
          title: 'NEURAL QUEUE',
          description: 'Synchronizing with analysis node...',
          color: '#00E5FF',
          bg: 'rgba(0, 229, 255, 0.05)'
        }
      case 'processing':
        return {
          icon: <Loader2 className="status-icon animate-spin" />,
          title: 'DEEP SCAN IN PROGRESS',
          description: 'Neural networks analyzing frames...',
          color: '#6366F1',
          bg: 'rgba(99, 102, 241, 0.05)'
        }
      case 'done':
        return {
          icon: <CheckCircle2 className="status-icon" />,
          title: 'ANALYSIS SUCCESSFUL',
          description: 'Telemetry data ready for uplink.',
          color: '#10B981',
          bg: 'rgba(16, 185, 129, 0.05)'
        }
      case 'error':
        return {
          icon: <AlertCircle className="status-icon" />,
          title: 'SYSTEM FAILURE',
          description: error || 'Neural link severed. Re-initialization required.',
          color: '#F43F5E',
          bg: 'rgba(244, 63, 94, 0.05)'
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  return (
    <motion.div
      className="status-tracker glass-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ '--status-color': config.color, '--status-bg': config.bg }}
    >
      <div className="status-icon-container">
        {config.icon}
      </div>
      <div className="status-content">
        <h4>{config.title}</h4>
        <p>{config.description}</p>
        
        {(status === 'processing' || status === 'queued') && (
          <div className="status-progress-wrapper" style={{ marginTop: '0.75rem', width: '100%' }}>
            <div className="status-progress-bar-container" style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress || 0}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ height: '100%', background: 'var(--status-color)', boxShadow: '0 0 10px var(--status-color)' }}
              />
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 700 }}>
              {progress || 0}% COMPLETE
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .status-tracker {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          background: var(--status-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
        }

        .status-icon-container {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--status-color);
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
          box-shadow: 0 0 20px var(--status-bg);
        }

        .status-content {
          flex: 1;
        }

        .status-content h4 {
          font-weight: 800;
          color: #FFF;
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .status-content p {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1.5s linear infinite;
        }
      `}</style>
    </motion.div>
  )
}
