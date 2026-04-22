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
  }, [showSamples])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const clearFile = (e) => {
    e.stopPropagation()
    setSelectedFile(null)
  }

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
      console.error(err)
      alert('Failed to load sample video.')
    }
  }

  const handleUploadClick = () => {
    if (selectedFile) onUpload(selectedFile)
  }

  return (
    <div className="upload-container">

      {/* 🔥 FIX: input no longer blocks UI */}
      <input
        type="file"
        id="file-upload"
        className="file-input"
        accept="video/*,image/*"
        onChange={handleFileChange}
      />

      <motion.div
        className={`scanner-zone ${isDragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >

        <AnimatePresence mode="wait">
          {showSamples ? (
            <motion.div key="samples" className="samples-container">

              <div className="samples-header">
                <h3>Select Sample Video</h3>
                <button onClick={(e) => { e.stopPropagation(); setShowSamples(false) }}>
                  <X size={16} />
                </button>
              </div>

              <div className="samples-grid">
                <div className="sample-card">
                  <video
                    src="/sample_video.mp4"
                    controls
                    controlsList="nodownload"
                    preload="metadata"
                  />
                  <button onClick={(e) => { e.stopPropagation(); handleSampleVideo('/sample_video.mp4') }}>
                    Select Video 1
                  </button>
                </div>

                <div className="sample-card">
                  <video
                    src="/sample_video1.mp4"
                    controls
                    controlsList="nodownload"
                    preload="metadata"
                  />
                  <button onClick={(e) => { e.stopPropagation(); handleSampleVideo('/sample_video1.mp4') }}>
                    Select Video 2
                  </button>
                </div>
              </div>

            </motion.div>

          ) : !selectedFile ? (

            <motion.div key="upload" className="upload-prompt">

              {/* ✅ upload trigger via label */}
              <label htmlFor="file-upload" className="upload-label">
                <Cpu size={40} />
                <h3>Upload Media</h3>
                <p>Click or drag file here</p>
              </label>

              {/* ✅ YOUR BUTTON (UNCHANGED) */}
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

            <motion.div key="preview" className="file-preview-card">

              <div className="preview-header">
                {selectedFile.type.startsWith('image/')
                  ? <CheckCircle2 />
                  : <FileVideo />
                }

                <span>{selectedFile.name}</span>

                <button onClick={clearFile}>
                  <X size={16} />
                </button>
              </div>

              <p>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>

            </motion.div>

          )}
        </AnimatePresence>

      </motion.div>

      {selectedFile && (
        <button className="upload-btn" onClick={handleUploadClick}>
          {isUploading ? 'Processing...' : 'Upload'}
        </button>
      )}

      <style jsx>{`
        .upload-container {
          max-width: 600px;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .scanner-zone {
          position: relative;
          border: 2px dashed #315cfd;
          padding: 40px;
          border-radius: 16px;
          text-align: center;
        }

        /* 🔥 CRITICAL FIX */
        .file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none; /* 🚀 THIS FIXES EVERYTHING */
        }

        .upload-label {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 2;
          position: relative;
        }

        .sample-btn {
          margin-top: 10px;
          padding: 8px 14px;
          background: #111827;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          z-index: 2;
          position: relative;
        }

        .file-preview-card {
          z-index: 2;
          position: relative;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .upload-btn {
          padding: 15px;
          border-radius: 10px;
          border: none;
          background: #315cfd;
          color: white;
          cursor: pointer;
        }

        .samples-container {
          z-index: 2;
          position: relative;
        }

        .samples-grid {
          display: flex;
          gap: 10px;
        }

        .sample-card video {
          width: 100%;
        }

      `}</style>
    </div>
  )
}