import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileVideo, X, CheckCircle2, Cpu, ScanLine } from 'lucide-react'

export default function UploadZone({ onUpload, isUploading }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showSamples, setShowSamples] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (showSamples) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('video/') || file.type.startsWith('image/')) {
        setSelectedFile(file)
      } else {
        alert('Please upload a video or image file.')
      }
    }
  }, [])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const clearFile = () => setSelectedFile(null)

  const handleSampleVideo = async (videoPath) => {
    try {
      const response = await fetch(videoPath)
      if (!response.ok) throw new Error('Video not found')
      const blob = await response.blob()
      const fileName = videoPath.split('/').pop()
      const file = new File([blob], fileName, { type: 'video/mp4' })
      setSelectedFile(file)
      setShowSamples(false)
    } catch (err) {
      console.error('Error loading sample video:', err)
      alert('Failed to load sample video.')
    }
  }

  const handleUploadClick = () => {
    if (selectedFile) onUpload(selectedFile)
  }

  return (
    <div className="upload-container">
      <motion.div
        className={`scanner-zone ${isDragActive ? 'active' : ''} ${(selectedFile || showSamples) ? 'has-file' : ''} ${isUploading ? 'scanning' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {!selectedFile && !showSamples && (
          <input
            type="file"
            id="file-upload"
            className="file-input"
            accept="video/*,image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        )}

        <div className="scanner-corners">
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />
        </div>

        <AnimatePresence mode="wait">
          {showSamples ? (
            <motion.div
              key="samples"
              className="samples-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="samples-header">
                <h3>Select a Sample Video</h3>
                <button className="clear-btn" onClick={(e) => { e.stopPropagation(); setShowSamples(false) }}>
                  <X size={16} />
                </button>
              </div>
              <div className="samples-grid">
                <div className="sample-card">
                  <video src="/sample_video.mp4" controls className="sample-video-player" />
                  <button className="select-sample-btn" onClick={(e) => { e.stopPropagation(); handleSampleVideo('/sample_video.mp4') }}>
                    Select Video 1
                  </button>
                </div>
                <div className="sample-card">
                  <video src="/sample_video1.mp4" controls className="sample-video-player" />
                  <button className="select-sample-btn" onClick={(e) => { e.stopPropagation(); handleSampleVideo('/sample_video1.mp4') }}>
                    Select Video 2
                  </button>
                </div>
              </div>
            </motion.div>
          ) : !selectedFile ? (
            <motion.div
              key="prompt"
              className="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <label htmlFor="file-upload" className="upload-label">
                <div className="icon-portal">
                  <div className="ring" />
                  <div className="ring-inner" />
                  <Cpu size={40} className="upload-icon" />
                </div>
                <div className="text-wrapper">
                  <h3>Neural Input Port</h3>
                  <p>Initialize scan by dragging media here</p>
                </div>
              </label>

              <button
                type="button"
                className="sample-btn"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowSamples(true)
                }}
              >
                No video? Try Sample Video
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="file-info"
              className="file-preview-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {isUploading && <div className="scan-line" />}
              <div className="preview-header">
                {selectedFile.type.startsWith('image/') ? <CheckCircle2 className="type-icon" /> : <FileVideo className="type-icon" />}
                <span className="file-name">{selectedFile.name}</span>
                <button className="clear-btn" onClick={clearFile} disabled={isUploading}>
                  <X size={16} />
                </button>
              </div>
              <div className="file-meta">
                <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                <span className="status-tag">{isUploading ? 'Analyzing...' : 'Ready for Sync'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {selectedFile && (
        <motion.button
          type="button"
          className="slice"
          onClick={handleUploadClick}
          disabled={isUploading}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: isUploading ? 1 : 1.02 }}
          whileTap={{ scale: isUploading ? 1 : 0.95 }}
          style={{ opacity: isUploading ? 0.7 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
        >
          <div className="text" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            {isUploading ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.415, 31.415" className="opacity-25" />
              </svg>
            ) : (
              <ScanLine size={18} />
            )}
            <span>{isUploading ? 'Executing Analysis...' : 'Execute Neural Analysis'}</span>
          </div>
        </motion.button>
      )}

      <style jsx>{`
        .upload-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .scanner-zone {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 4rem 2rem;
          text-align: center;
          transition: var(--transition-slow);
          overflow: hidden;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
          /* From Uiverse.io by nikk7007 */ 
.slice {
  width: 100%;
  --c1: #0f172a;
  --c2: var(--primary, #00e5ff);
  --size-letter: 1.1rem;
  padding: 1.25rem 1em;
  font-size: var(--size-letter);

  background-color: transparent;
  border: 2px solid var(--c2);
  border-radius: 16px;
  cursor: pointer;

  overflow: hidden;
  position: relative;
  transition: 300ms cubic-bezier(0.83, 0, 0.17, 1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.slice .text {
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #fff;
  position: relative;
  z-index: 10;
  transition: color 700ms cubic-bezier(0.83, 0, 0.17, 1);
}

.slice::after {
  content: "";
  width: 0;
  height: calc(300% + 1em);
  position: absolute;
  translate: -50% -50%;
  inset: 50%;
  rotate: 30deg;
  background-color: var(--c2);
  transition: 1000ms cubic-bezier(0.83, 0, 0.17, 1);
  z-index: 1;
}

.slice:hover .text {
  color: var(--c1);
}

.slice:hover::after {
  width: calc(120% + 1em);
}

.slice:active {
  scale: 0.98;
  filter: brightness(0.9);
}

        .scanner-zone.active {
          border-color: var(--primary);
          background: rgba(0, 229, 255, 0.05);
          box-shadow: 0 0 50px rgba(0, 229, 255, 0.1);
        }

        .scanner-zone.scanning {
           border-color: var(--primary);
           box-shadow: 0 0 50px rgba(0, 229, 255, 0.2);
        }

        .upload-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          z-index: 20;
        }

        .upload-label {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sample-btn {
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.2);
          color: var(--primary);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-fast);
          z-index: 20;
        }

        .sample-btn:hover {
          background: rgba(0, 229, 255, 0.2);
          transform: translateY(-1px);
        }

        .samples-container {
          width: 100%;
          z-index: 20;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .samples-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
        }
        
        .samples-header h3 { color: #FFF; font-size: 1.1rem; }

        .samples-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 480px) {
          .samples-grid { grid-template-columns: 1fr; }
        }

        .sample-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sample-video-player {
          width: 100%;
          border-radius: 8px;
          background: #000;
          aspect-ratio: 16/9;
          object-fit: contain;
        }

        .select-sample-btn {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .select-sample-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px -5px rgba(0,229,255,0.4);
        }

        .file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }

        .scanner-corners .corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid var(--primary);
          opacity: 0.3;
        }

        .tl { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
        .tr { top: 20px; right: 20px; border-left: 0; border-bottom: 0; }
        .bl { bottom: 20px; left: 20px; border-right: 0; border-top: 0; }
        .br { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }

        .icon-portal {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .ring, .ring-inner {
          position: absolute;
          border: 1px solid var(--primary);
          border-radius: 50%;
          opacity: 0.2;
        }

        .ring { width: 100%; height: 100%; animation: pulse 2s infinite; }
        .ring-inner { width: 70%; height: 70%; border-style: dashed; }

        .text-wrapper h3 {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(to right, #FFF, #94A3B8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .text-wrapper p { color: var(--text-muted); font-size: 0.9rem; }

        .file-preview-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          position: relative;
          z-index: 20;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .type-icon { color: var(--primary); }
        .file-name { 
          flex: 1; 
          text-align: left; 
          font-weight: 600; 
          overflow: hidden; 
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .status-tag {
          color: var(--primary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, transparent, var(--primary), transparent);
          box-shadow: 0 0 10px var(--primary);
          animation: scan 2s linear infinite;
          z-index: 30;
        }

        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }

        .analysis-btn {
          position: relative;
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(139, 92, 246, 0.15));
          border: 1px solid rgba(0, 229, 255, 0.4);
          border-radius: 16px;
          color: white;
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.1), inset 0 0 15px rgba(0, 229, 255, 0.05);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .analysis-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transform: skewX(-20deg);
          transition: all 0.6s ease;
        }

        .analysis-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(139, 92, 246, 0.3));
          border-color: rgba(0, 229, 255, 0.9);
          box-shadow: 0 15px 30px -5px rgba(0, 229, 255, 0.5), inset 0 0 30px rgba(0, 229, 255, 0.3);
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
        }

        .analysis-btn:hover:not(:disabled)::before {
          left: 200%;
          transition: all 0.6s ease;
        }

        .clear-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 0.4rem;
          border-radius: 50%;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .clear-btn:hover:not(:disabled) { background: var(--accent); }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
