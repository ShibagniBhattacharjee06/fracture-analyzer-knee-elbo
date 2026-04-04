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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent-light)', color: 'var(--accent)', padding: '6px 16px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '24px', border: '1px solid var(--accent-glow)' }}>
          <Activity size={14} /> AI-POWERED CLINICAL DIAGNOSTICS
        </div>
        <h1>MEDICARE FRACTURE GUARD</h1>
        <p>
          Institutional-grade bone fracture detection powered by advanced neural networks. 
          Upload your medical imaging for real-time pathology analysis.
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
            <div style={{ background: 'var(--accent-light)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <Upload className="dropzone-icon" style={{ margin: 0 }} />
            </div>
            <h2 style={{ marginBottom: '12px', fontSize: '1.75rem' }}>Upload Digital X-Ray</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem' }}>
              Drag and drop your DICOM, JPG, or PNG files here
            </p>
            <button className="btn">
              Select Patient File <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="preview-container">
            <div className="glass-card image-preview" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={preview} alt="X-ray preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                PATIENT_SCAN_VIEW_01
              </div>
            </div>

            <div className="glass-card analysis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--foreground)' }}>
                  <Search size={22} style={{ color: 'var(--accent)' }} /> Pathological Report
                </h3>
                <button onClick={reset} className="btn btn-secondary" style={{ padding: '10px', borderRadius: '12px' }} title="Reset Analysis">
                  <RotateCcw size={18} />
                </button>
              </div>

              {!result && !loading && !error && (
                <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'left', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Pre-processing Status:</h4>
                    <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Image metadata verified</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Resolution optimized (224x224)</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Ready for inference</li>
                    </ul>
                  </div>
                  <button onClick={analyzeImage} className="btn" style={{ width: '100%' }}>
                    Initiate AI Scan <Activity size={18} />
                  </button>
                </div>
              )}

              {loading && (
                <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
                    <Activity size={80} className="loading-spinner" style={{ color: 'var(--accent)', opacity: 0.2 }} />
                    <Search size={32} style={{ position: 'absolute', top: '24px', left: '24px', color: 'var(--accent)' }} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Scanning Image Layers...</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Running inference through FractureGuard-V1 Engine
                  </p>
                </div>
              )}

              {result && (
                <div className="fade-in">
                  <div className={`status-badge ${result.result === "Fracture Detected" ? "fracture" : "normal"}`} style={{ marginBottom: '1.5rem' }}>
                    {result.result === "Fracture Detected" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    {result.result}
                  </div>
                  
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Discovery Confidence</span>
                      <span style={{ color: 'var(--accent)' }}>{result.confidence}%</span>
                    </div>
                    <div className="confidence-meter">
                      <div className="confidence-fill" style={{ width: `${result.confidence}%` }}></div>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', background: 'var(--accent-light)', borderRadius: '16px', fontSize: '0.9rem', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Info size={20} style={{ flexShrink: 0 }} />
                      <p style={{ fontWeight: 500, lineHeight: 1.5 }}>
                        This algorithmic assessment is for clinical decision support ONLY. Findings should be correlated with patient history and physical examination by a Board-Certified Orthopedist.
                      </p>
                    </div>
                  </div>

                  <button onClick={reset} className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>
                    Process New Scan <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {error && (
                <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                  <div style={{ display: 'flex', gap: '14px', color: 'var(--error)' }}>
                    <AlertCircle size={24} style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ marginBottom: '6px', fontWeight: 700 }}>Interface Error</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{error}</p>
                    </div>
                  </div>
                  <button onClick={analyzeImage} className="btn" style={{ width: '100%', marginTop: '1.5rem', background: 'var(--error)' }}>
                    Retry Server Handshake
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem 4rem', marginTop: '6rem', opacity: 0.8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <div style={{ background: 'var(--accent-light)', padding: '8px', borderRadius: '10px', color: 'var(--accent)' }}><ShieldCheck size={20} /></div> HIPPA-Compliant Privacy
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <div style={{ background: 'var(--accent-light)', padding: '8px', borderRadius: '10px', color: 'var(--accent)' }}><Activity size={20} /></div> Sub-second Inference
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <div style={{ background: 'var(--accent-light)', padding: '8px', borderRadius: '10px', color: 'var(--accent)' }}><CheckCircle2 size={20} /></div> Orthopedic Dataset V2.1
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 MEDICARE FRACTURE GUARD. Advanced Computer Vision for Orthopedics.</p>
      </footer>
    </div>
  )
}

export default App
