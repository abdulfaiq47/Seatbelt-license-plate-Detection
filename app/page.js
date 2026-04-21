'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Activity, Bell, Settings, Zap, Globe, Sparkles } from 'lucide-react'
import UploadZone from '@/components/UploadZone'
import StatusTracker from '@/components/StatusTracker'
import ResultsDisplay from '@/components/ResultsDisplay'

const API_BASE = 'https://michealhat-detection-seatbelt.hf.space'

export default function Home() {
  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [jobResults, setJobResults] = useState(null)
  const [error, setError] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let intervalId;
    if (jobId && (jobStatus === 'queued' || jobStatus === 'processing')) {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE}/status/${jobId}`)
          const data = response.data
          
          const backendStatus = data.status || 'processing'
                               
          if (backendStatus === 'done') {
            clearInterval(intervalId)
            setJobStatus('done')
            setProgress(100)
            try {
              // Fetch the CSV data from the backend since it has the results
              const csvResponse = await axios.get(`${API_BASE}/csv/${jobId}`)
              const csvText = csvResponse.data
              
              // Basic CSV parsing
              const lines = csvText.trim().split('\n')
              const violations = []
              
              // Skip header row, parse rows
              // Assume format contains license_number at specific column, let's just find the first text looking like a plate
              for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',')
                let plateText = ""
                // find the column that looks like a plate (string, len > 3, alphanumeric)
                for (let c of cols) {
                   const cleanC = c.trim().replace(/['"]/g, '')
                   if (cleanC.length >= 3 && /[A-Z0-9]{3,}/i.test(cleanC) && !cleanC.includes('.')) {
                       plateText = cleanC
                   }
                }
                if (plateText) {
                  violations.push({
                    plate_text: plateText,
                    violation: true,
                    label: 'DETECTED PLATE'
                  })
                }
              }
              
              setJobResults({
                type: 'video',
                violations: violations,
                total_violations: violations.length,
                total_frames: lines.length - 1
              })
            } catch (err) {
              console.error('Failed to load CSV results:', err)
              // If CSV fails, just show the video anyway
              setJobResults({ type: 'video', violations: [] })
            }
          } else if (backendStatus === 'error') {
            setError(data.error || 'Processing failed on server.')
            setJobStatus('error')
            clearInterval(intervalId)
          } else {
             setJobStatus(backendStatus)
             // Animate progress while waiting
             setProgress(prev => Math.min((prev || 0) + Math.floor(Math.random() * 5 + 2), 95))
          }
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 2000)
    }
    return () => clearInterval(intervalId)
  }, [jobId, jobStatus])

  const handleUpload = async (file) => {
    setIsUploading(true)
    setError(null)
    setJobId(null)
    setJobStatus(null)
    setJobResults(null)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      setJobId(response.data.task_id)
      setJobStatus('processing')
    } catch (err) {
      setError(err.response?.data?.error || 'Neural link failed. Ensure core is online.')
      setJobStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  const resetAnalysis = () => {
    setJobId(null)
    setJobStatus(null)
    setJobResults(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className="vision-app">
      <div className="bg-mesh" />
      
      {/* HUD Navigation */}
      <nav className="hud-nav glass-effect">
        <div className="nav-content">
          <div className="brand">
            <div className="brand-icon">
              <Shield size={22} />
            </div>
            <h1 className="text-gradient">VisionScan<span>AI</span></h1>
          </div>
          <div className="nav-menu">
            <button className="nav-item active">DASHBOARD</button>
          </div>
          <div className="nav-controls">
            <div className="user-pod" />
          </div>
        </div>
      </nav>

      <main className="hud-main">
        <AnimatePresence mode="wait">
          {!jobId && !error && (
            <motion.section 
              key="hero"
              className="hero-grid"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="hero-content">
                <div className="sys-badge">
                  <Zap size={12} />
                  <span>CORE v4.2.0 ONLINE</span>
                </div>
                <h2 className="main-title">AI Powered <br /><span className="text-gradient">Violation Detection</span></h2>
                <p className="sub-title">Deploy state-of-the-art  to analyze traffic feeds, identify seatbelt violations, and extract license plates with surgical precision.</p>
                
                <div className="metrics-row">
                  <div className="metric">
                    <Sparkles size={16} />
                    <span>99.9% Accuracy</span>
                  </div>
                  <div className="metric">
                    <Globe size={16} />
                    <span>Real-time Link</span>
                  </div>
                </div>
              </div>

              <div className="upload-wrapper">
                <UploadZone onUpload={handleUpload} isUploading={isUploading} />
              </div>

              <div className="info-cards">
                <div className="info-card glass-card">
                  <Activity size={24} className="card-icon" />
                  <h4>Live Telemetry</h4>
                  <p>Real-time analysis logs.</p>
                </div>
                <div className="info-card glass-card">
                  <Shield size={24} className="card-icon" />
                  <h4>Secure Node</h4>
                  <p>Enterprise-grade privacy for all processed media.</p>
                </div>
              </div>
            </motion.section>
          )}

          {(jobId || error) && !jobResults && (
            <motion.section 
              key="status"
              className="center-pod"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <StatusTracker status={jobStatus} error={error} progress={progress} />
              {error && (
                <button className="action-btn secondary" onClick={resetAnalysis}>
                  RE-INITIALIZE LINK
                </button>
              )}
            </motion.section>
          )}

          {jobResults && (
            <motion.section 
              key="results"
              className="results-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="results-hud">
                <div className="hud-left">
                  <h2>ANALYSIS COMPLETE</h2>
                  <p>SYSTEM TIMESTAMP: {new Date().toLocaleTimeString()}</p>
                </div>
                <button className="action-btn" onClick={resetAnalysis}>NEW SCAN</button>
              </div>
              <ResultsDisplay 
                results={jobResults} 
                videoUrl={`${API_BASE}/download/${jobId}`}
                downloadUrl={`${API_BASE}/download/${jobId}`}
                jobId={jobId}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="hud-footer">
        <div className="footer-line" />
        <p>Made by Abdul Faiq</p>
      </footer>

      <style jsx>{`
        .vision-app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .hud-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          margin: 1.5rem;
          border-radius: 16px;
        }

        @media (max-width: 768px) {
          .hud-nav { margin: 1rem; }
        }

        .nav-content {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (max-width: 768px) {
          .nav-content { padding: 0.5rem 1rem; }
        }

        .brand { display: flex; align-items: center; gap: 1rem; }
        .brand-icon { 
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white; 
          width: 38px; height: 38px; 
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        @media (max-width: 480px) {
          .brand-icon { width: 32px; height: 32px; }
        }

        .brand h1 { font-size: 1.4rem; font-weight: 800; letter-spacing: -1px; }
        @media (max-width: 768px) { .brand h1 { font-size: 1.2rem; } }
        @media (max-width: 480px) { .brand h1 { font-size: 1rem; } }

        .brand h1 span { color: #FFF; opacity: 0.5; font-weight: 500; }

        .nav-menu { display: flex; gap: 2.5rem; }
        @media (max-width: 768px) { .nav-menu { display: none; } }

        .nav-item { 
          background: none; border: none; 
          color: var(--text-muted); 
          font-weight: 800; font-size: 0.75rem; 
          letter-spacing: 1px; cursor: pointer;
          transition: var(--transition-fast);
        }
        .nav-item.active, .nav-item:hover { color: var(--primary); }

        .nav-controls { display: flex; align-items: center; gap: 1.5rem; }
        .ctrl-icon { color: var(--text-muted); cursor: pointer; transition: var(--transition-fast); }
        .ctrl-icon:hover { color: #FFF; }
        .user-pod { width: 32px; height: 32px; border-radius: 50%; background: var(--glass-border); border: 1px solid var(--primary); }

        .hud-main { flex: 1; padding: 2rem; max-width: 1600px; margin: 0 auto; width: 100%; }

        @media (max-width: 768px) {
          .hud-main { padding: 1rem; }
        }

        @media (max-width: 480px) {
          .hud-main { padding: 0.5rem; }
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 4rem 0;
          align-items: center;
        }

        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr; gap: 4rem; text-align: center; }
          .metrics-row { justify-content: center; }
        }

        @media (max-width: 768px) {
          .hero-grid { gap: 2rem; padding: 2rem 0; }
          .main-title { font-size: 2.5rem; }
          .sub-title { font-size: 1rem; max-width: none; }
          .metrics-row { gap: 2rem; flex-wrap: wrap; }
          .info-cards { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .main-title { font-size: 2rem; }
          .metrics-row { gap: 1rem; }
          .metric { gap: 0.5rem; font-size: 0.8rem; }
        }

        .sys-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 229, 255, 0.1);
          color: var(--primary);
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 900;
          border: 1px solid rgba(0, 229, 255, 0.2);
          margin-bottom: 2rem;
        }

        .main-title { font-size: 4rem; font-weight: 800; line-height: 1.1; margin-bottom: 2rem; color: #FFF; }
        @media (max-width: 768px) { .main-title { font-size: 2.8rem; } }

        .sub-title { font-size: 1.15rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 3rem; max-width: 600px; }

        .metrics-row { display: flex; gap: 3rem; margin-bottom: 4rem; }
        .metric { display: flex; align-items: center; gap: 0.75rem; color: #FFF; font-weight: 700; font-size: 0.9rem; }
        .metric span { opacity: 0.8; }

        .info-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .info-card { padding: 2rem; }
        .card-icon { color: var(--primary); margin-bottom: 1.5rem; }
        .info-card h4 { font-weight: 700; margin-bottom: 0.5rem; color: #FFF; }
        .info-card p { font-size: 0.85rem; color: var(--text-muted); }

        .center-pod { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 3rem; }

        .action-btn {
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          letter-spacing: 1px;
          box-shadow: 0 8px 25px -5px rgba(0, 229, 255, 0.3);
        }

        .action-btn.secondary { background: var(--bg-deep); border: 1px solid var(--glass-border); color: #FFF; box-shadow: none; }

        .results-view { display: flex; flex-direction: column; gap: 3rem; padding-bottom: 6rem; }

        .results-hud {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .results-hud { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }

        .hud-left h2 { font-size: 2.5rem; font-weight: 800; color: #FFF; letter-spacing: -1px; }
        @media (max-width: 768px) { .hud-left h2 { font-size: 2rem; } }
        @media (max-width: 480px) { .hud-left h2 { font-size: 1.5rem; } }

        .hud-left p { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-top: 0.5rem; }

        .hud-footer { padding: 4rem 1.5rem; text-align: center; }
        .footer-line { height: 1px; background: var(--glass-border); max-width: 400px; margin: 0 auto 2rem; }
        .hud-footer p { font-size: 0.65rem; color: var(--text-muted); font-weight: 800; letter-spacing: 2px; }
      `}</style>
    </div>
  )
}
