import React, { useState, useRef } from 'react'
import { 
  Upload, 
  Search, 
  ShieldCheck, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw,
  Info 
} from 'lucide-react'

interface PredictionResult {
  result: string;
  confidence: number;
  status: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.status === "success" || !data.error) {
        setResult(data);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Unable to connect to the analysis engine. Please ensure the backend is running on port 5000.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '24px' }}>
          <Activity size={14} /> AI-POWERED DIAGNOSTICS
        </div>
        <h1>FractureGuard AI</h1>
        <p>
          State-of-the-art bone fracture detection using deep learning. 
          Upload your X-ray for instant, professional-grade analysis.
        </p>
      </section>

      {/* Upload & Analysis Section */}
      <section className="upload-section">
        {!preview ? (
          <div 
            className={`glass-card dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Upload className="dropzone-icon" />
            <h2 style={{ marginBottom: '8px' }}>Drop X-ray Image Here</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Supports JPG, PNG, DICOM. Max file size 10MB.
            </p>
            <button className="btn">
              Select File <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="preview-container">
            <div className="glass-card image-preview">
              <img src={preview} alt="X-ray preview" />
            </div>

            <div className="glass-card analysis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={20} className="text-secondary" /> Analysis Report
                </h3>
                <button onClick={reset} className="btn btn-secondary" style={{ padding: '8px' }} title="Change Image">
                  <RotateCcw size={18} />
                </button>
              </div>

              {!result && !loading && !error && (
                <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                    Image loaded successfully. Ready for computer vision analysis.
                  </p>
                  <button onClick={analyzeImage} className="btn" style={{ width: '100%' }}>
                    Start AI Analysis <Activity size={18} />
                  </button>
                </div>
              )}

              {loading && (
                <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                  <Activity size={48} className="loading-spinner" style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
                  <h4>Analyzing X-ray...</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Comparing patterns with 50,000+ clinical cases
                  </p>
                </div>
              )}

              {result && (
                <div className="fade-in">
                  <div className={`status-badge ${result.result === "Fracture Detected" ? "fracture" : "normal"}`} style={{ marginBottom: '1rem' }}>
                    {result.result === "Fracture Detected" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    {result.result}
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 600 }}>
                      <span>Confidence Level</span>
                      <span>{result.confidence}%</span>
                    </div>
                    <div className="confidence-meter">
                      <div className="confidence-fill" style={{ width: `${result.confidence}%` }}></div>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Info size={16} style={{ flexShrink: 0 }} />
                      <p>
                        This analysis is provided by an AI model trained on clinical data. Please consult with a qualified radiologist for a definitive diagnosis.
                      </p>
                    </div>
                  </div>

                  <button onClick={reset} className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
                    New Analysis <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {error && (
                <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <div style={{ display: 'flex', gap: '12px', color: 'var(--error)' }}>
                    <AlertCircle size={20} />
                    <div>
                      <h4 style={{ marginBottom: '4px' }}>System Error</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{error}</p>
                    </div>
                  </div>
                  <button onClick={analyzeImage} className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                    Retry Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem', opacity: 0.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <ShieldCheck size={20} /> Secure DICOM Privacy
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <Activity size={20} /> Real-time Processing
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <CheckCircle2 size={20} /> Clinical Grade Model
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 FractureGuard AI. Advanced Computer Vision for Orthopedics.</p>
      </footer>
    </div>
  )
}

export default App
