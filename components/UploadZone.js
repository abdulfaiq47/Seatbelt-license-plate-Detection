import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileVideo, X, CheckCircle2, Cpu, ScanLine } from 'lucide-react'

export default function UploadZone({ onUpload, isUploading }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
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

  const handleUploadClick = () => {
    if (selectedFile) onUpload(selectedFile)
  }

  return (
    <div className="upload-container">
      <motion.div
        className={`scanner-zone ${isDragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''} ${isUploading ? 'scanning' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <input
          type="file"
          id="file-upload"
          className="file-input"
          accept="video/*,image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        <div className="scanner-corners">
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />
        </div>

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.label
              key="prompt"
              htmlFor="file-upload"
              className="upload-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="icon-portal">
                <div className="ring" />
                <div className="ring-inner" />
                <Cpu size={40} className="upload-icon" />
              </div>
              <div className="text-wrapper">
                <h3>Neural Input Port</h3>
                <p>Initialize scan by dragging media here</p>
              </div>
            </motion.label>
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

      {selectedFile && !isUploading && (
        <motion.button
          className="analysis-btn"
          onClick={handleUploadClick}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <ScanLine size={18} />
          <span>Execute Neural Analysis</span>
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

        .scanner-zone.active {
          border-color: var(--primary);
          background: rgba(0, 229, 255, 0.05);
          box-shadow: 0 0 50px rgba(0, 229, 255, 0.1);
        }

        .scanner-zone.scanning {
           border-color: var(--primary);
           box-shadow: 0 0 50px rgba(0, 229, 255, 0.2);
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
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: none;
          border-radius: 16px;
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          box-shadow: 0 10px 20px -5px rgba(0, 229, 255, 0.3);
          transition: var(--transition-fast);
        }

        .analysis-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(0, 229, 255, 0.4);
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
      `}</style>
    </div>
  )
}
