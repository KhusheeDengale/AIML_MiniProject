import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Image, Eye, BarChart3, Brain, Layers, Sliders, Grid, 
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Sparkles, 
  Info, ShieldAlert, Zap, GraduationCap, ShoppingBag, Download,
  ChevronDown, ChevronUp, FileText, Compass
} from 'lucide-react';

export default function WebsiteAnalysis() {
  const [selectedCategory, setSelectedCategory] = useState('Product');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [samplePath, setSamplePath] = useState(null);
  const [samples, setSamples] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Technical Disclosures toggle states
  const [showSaliencyTech, setShowSaliencyTech] = useState(false);
  const [showComplexityTech, setShowComplexityTech] = useState(false);

  // Visualization Console Controls
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay', 'heatmap', 'original', 'map'
  const [overlayOpacity, setOverlayOpacity] = useState(0.55);
  const [showGrid, setShowGrid] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await fetch('/api/samples');
      if (res.ok) {
        const data = await res.json();
        setSamples(data.samples || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setSamplePath(null);
      setPreviewUrl(URL.createObjectURL(f));
      setError(null);
    }
  };

  const handleSelectSample = (sample) => {
    setSamplePath(sample.relative_path);
    setFile(null);
    setPreviewUrl(sample.thumbnail_url);
    setSelectedCategory(sample.category);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      setSamplePath(null);
      setPreviewUrl(URL.createObjectURL(f));
      setError(null);
    }
  };

  const runAnalysis = async () => {
    if (!file && !samplePath) {
      setError('Please upload a screenshot or select a sample preset first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('category', selectedCategory);
    if (file) {
      formData.append('file', file);
    } else if (samplePath) {
      formData.append('sample_path', samplePath);
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Analysis request failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result?.report_download_url) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch(result.report_download_url);
      if (!res.ok) throw new Error('Failed to generate report PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UI_Insight_Report_${result.analysis_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not download analysis report. Please verify connection.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setFile(null);
    setSamplePath(null);
    setPreviewUrl(null);
    setError(null);
  };

  // Helper for human-friendly focus description
  const getFocusDescription = (gini) => {
    if (gini < 0.35) {
      return {
        label: 'Widely Distributed Focus',
        tag: 'Distributed',
        desc: 'Visual attention is spread across multiple competing areas. Consider establishing a stronger primary visual anchor.'
      };
    } else if (gini > 0.65) {
      return {
        label: 'Highly Focused Anchor',
        tag: 'Concentrated',
        desc: 'Attention locks onto one dominant focal zone. Ensure secondary content and navigation remain discoverable.'
      };
    } else {
      return {
        label: 'Balanced Visual Focus',
        tag: 'Balanced',
        desc: 'Visual weight guides users progressively from main focal anchors into supporting content.'
      };
    }
  };

  return (
    <div className="space-y-10 py-4">
      
      {/* Workflow Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" /> Workflow B &bull; Existing Website Analysis
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Website Visual Saliency &amp; Reading Effort Analysis
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Upload any website screenshot to predict where user attention concentrates, measure reading complexity, and receive prioritized design improvements.
        </p>
      </div>

      {/* Upload & Configuration Section */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Upload Box */}
          <div className="lg:col-span-8 space-y-5">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer relative ${
                previewUrl 
                  ? 'border-indigo-500/50 bg-slate-900/60' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="max-h-72 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 inline-block">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-72 w-auto object-contain mx-auto"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Screenshot selected. Click "Analyze Screenshot" to process.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">
                      Drop website screenshot here, or <span className="text-indigo-400 underline">browse files</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PNG, JPG, or WebP desktop website viewports
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Sample Selector */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                Or select from corpus sample presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {samples.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(s)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      samplePath === s.relative_path
                        ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                    }`}
                  >
                    <div className="w-12 h-10 rounded bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                      <img src={s.thumbnail_url} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{s.name}</p>
                      <span className="text-[10px] text-slate-400 block">{s.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration & Launch Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Category Context</span>
              </h3>

              <div className="space-y-3">
                <label className="text-xs text-slate-400 block">
                  Select website category for benchmark comparison:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Education')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedCategory === 'Education'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
                    <span className="text-xs block">Educational</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Product')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedCategory === 'Product'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
                    <span className="text-xs block">Product &amp; Store</span>
                  </button>
                </div>
              </div>

              <button
                onClick={runAnalysis}
                disabled={loading || (!file && !samplePath)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Visual &amp; Textual Features...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Screenshot</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          ANALYSIS RESULTS VIEW
          ======================================================== */}
      {result && (
        <div className="space-y-10">
          
          {/* Section A: Website Overview & Action Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Target:</span>
                <span className="text-sm font-bold text-white">{result.image_info.filename}</span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {result.category} Website
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  ({result.image_info.width}×{result.image_info.height}px)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {downloadingPdf ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download Report (PDF)</span>
                </button>

                <button
                  onClick={resetAnalysis}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Analyze Another</span>
                </button>
              </div>
            </div>

            {/* Executive Status Banner */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Visual Focus Pattern</span>
                <p className="text-sm font-bold text-white">{result.ml_profile.profile_name}</p>
                <span className="text-[10px] text-indigo-300">Dominant: {result.saliency.dominant_quadrant.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Focus Concentration</span>
                <p className="text-sm font-bold text-cyan-300">{getFocusDescription(result.saliency.concentration_gini).label}</p>
                <span className="text-[10px] text-slate-400">Gini Concentration: {result.saliency.concentration_gini.toFixed(3)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Reading &amp; Visual Effort</span>
                <p className="text-sm font-bold text-emerald-300">
                  {result.complexity.complexity_level} Effort ({result.complexity.complexity_score}/100)
                </p>
                <span className="text-[10px] text-slate-400">Whitespace: {result.complexity.metrics.whitespace_pct}% &bull; Text: {result.complexity.metrics.text_density_pct}%</span>
              </div>
            </div>
          </div>

          {/* Section B: Visual Attention & Spatial Prominence */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-400" />
                  <span>Visual Attention &amp; Spatial Prominence</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive gaze layer predicting where visitors' eyes naturally land on your interface
                </p>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['overlay', 'heatmap', 'original', 'map'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer capitalize ${
                      viewMode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m === 'map' ? 'Grayscale' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider & 2x2 Boundary Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300 font-medium">Heatmap Blending:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-32 accent-indigo-500 cursor-pointer"
                />
                <span className="font-bold text-white">{Math.round(overlayOpacity * 100)}%</span>
              </div>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                  showGrid ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>2×2 Quadrant Boundary Grid</span>
              </button>
            </div>

            {/* Viewport Image Canvas */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[620px]">
              {viewMode === 'original' && (
                <img src={result.visualizations.original_url} alt="Original" className="max-h-[620px] w-auto object-contain" />
              )}
              {viewMode === 'heatmap' && (
                <img src={result.visualizations.heatmap_url} alt="Heatmap" className="max-h-[620px] w-auto object-contain" />
              )}
              {viewMode === 'map' && (
                <img src={result.visualizations.saliency_map_url} alt="Saliency Map" className="max-h-[620px] w-auto object-contain" />
              )}
              {viewMode === 'overlay' && (
                <div className="relative max-h-[620px] flex items-center justify-center">
                  <img src={result.visualizations.original_url} alt="Original" className="max-h-[620px] w-auto object-contain block" />
                  <img
                    src={result.visualizations.heatmap_url}
                    alt="Heatmap Blend"
                    style={{ opacity: overlayOpacity }}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150"
                  />
                </div>
              )}

              {/* 2x2 Grid Boundary Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2 border border-dashed border-white/20">
                  <div className="border-r border-b border-dashed border-white/20 p-3 flex flex-col justify-between">
                    <span className="text-xs font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded self-start">
                      Top-Left: {result.saliency.regional_percentages.top_left}%
                    </span>
                  </div>
                  <div className="border-b border-dashed border-white/20 p-3 flex flex-col justify-between items-end">
                    <span className="text-xs font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                      Top-Right: {result.saliency.regional_percentages.top_right}%
                    </span>
                  </div>
                  <div className="border-r border-dashed border-white/20 p-3 flex flex-col justify-between">
                    <span className="text-xs font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded self-start">
                      Bottom-Left: {result.saliency.regional_percentages.bottom_left}%
                    </span>
                  </div>
                  <div className="p-3 flex flex-col justify-between items-end">
                    <span className="text-xs font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                      Bottom-Right: {result.saliency.regional_percentages.bottom_right}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Spatial Focus Pattern & Category Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Focus Pattern Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Observed Spatial Attention Pattern
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {result.ml_profile.profile_name}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {getFocusDescription(result.saliency.concentration_gini).desc}
                </p>

                {/* Macro percentages */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Upper Half: <strong>{result.saliency.macro_top}%</strong></span>
                    <span>Lower Half: <strong>{result.saliency.macro_bottom}%</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Left Side: <strong>{result.saliency.macro_left}%</strong></span>
                    <span>Right Side: <strong>{result.saliency.macro_right}%</strong></span>
                  </div>
                </div>

                {/* Expandable Disclosure: How was this calculated? */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowSaliencyTech(!showSaliencyTech)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>How was this calculated?</span>
                    {showSaliencyTech ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showSaliencyTech && (
                    <div className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <p>• <strong>Method:</strong> OpenCV Spectral Residual Algorithm calculates 2D log-frequency residual saliency maps.</p>
                      <p>• <strong>K-Means Clustering:</strong> Assigned to <em>Cluster {result.ml_profile.cluster_id}</em> (centroid distance: {result.ml_profile.distance_to_cluster_centroid}) out of 3 learned layout archetypes.</p>
                      <p>• <strong>Focus Concentration (Gini):</strong> {result.saliency.concentration_gini.toFixed(3)} (0 = uniform attention across page, 1 = concentrated point).</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Benchmark Comparison Card */}
              {result.category_comparison && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                    Comparison vs. {result.category_comparison.reference_group} Website Benchmarks
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Top Focus</span>
                      <span className={`text-sm font-bold ${result.category_comparison.pct_top_diff >= 0 ? 'text-indigo-300' : 'text-slate-300'}`}>
                        {result.category_comparison.pct_top_diff >= 0 ? '+' : ''}{result.category_comparison.pct_top_diff}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Left Focus</span>
                      <span className={`text-sm font-bold ${result.category_comparison.pct_left_diff >= 0 ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {result.category_comparison.pct_left_diff >= 0 ? '+' : ''}{result.category_comparison.pct_left_diff}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Focus Gini</span>
                      <span className="text-sm font-bold text-cyan-300">
                        {result.category_comparison.gini_diff >= 0 ? '+' : ''}{result.category_comparison.gini_diff}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed pt-2">
                    {result.category_comparison.pct_left_diff > 5
                      ? `Your page has ${result.category_comparison.pct_left_diff}% stronger left-side bias than the average ${result.category} website.`
                      : result.category_comparison.pct_top_diff > 5
                      ? `Attention is ${result.category_comparison.pct_top_diff}% more concentrated in the upper viewport than standard ${result.category} sites.`
                      : `Spatial attention closely matches typical ${result.category} reference websites.`}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Section C: Reading & Visual Effort (Content & Complexity) */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>Reading &amp; Visual Effort (Content &amp; Complexity)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Physical interface measurements influencing how easily visitors scan and read content
                </p>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                result.complexity.complexity_level === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                result.complexity.complexity_level === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {result.complexity.complexity_level} Reading Effort
              </span>
            </div>

            {/* Score Banner */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Estimated Visual Complexity Index</span>
                <p className="text-2xl font-black text-white">{result.complexity.complexity_score} <span className="text-xs font-normal text-slate-400">/ 100</span></p>
                <p className="text-xs text-slate-300 mt-1">{result.complexity.interpretation}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center font-bold text-cyan-300 text-sm shrink-0">
                {result.complexity.complexity_score}
              </div>
            </div>

            {/* 4 Concrete Dimensions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* 1. Text Load */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">1. Text Load</span>
                <p className="text-lg font-bold text-white">{result.complexity.metrics.text_density_pct}% coverage</p>
                <p className="text-slate-400 text-[11px]">
                  ~{result.complexity.metrics.word_count} words across {result.complexity.metrics.text_block_count} detected text blocks.
                </p>
                <span className="text-[10px] text-slate-500 block pt-1 border-t border-slate-800/80">
                  {result.complexity.metrics.text_density_pct > 20 ? 'Text-heavy viewport' : 'Comfortable text density'}
                </span>
              </div>

              {/* 2. Visual Clutter */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">2. Visual Clutter</span>
                <p className="text-lg font-bold text-white">{result.complexity.metrics.edge_density_pct}% edge density</p>
                <p className="text-slate-400 text-[11px]">
                  Boundary and visual texture lines detected via Canny filter.
                </p>
                <span className="text-[10px] text-slate-500 block pt-1 border-t border-slate-800/80">
                  {result.complexity.metrics.edge_density_pct > 7 ? 'High visual texture/lines' : 'Clean, quiet boundaries'}
                </span>
              </div>

              {/* 3. Breathing Room */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">3. Breathing Room</span>
                <p className="text-lg font-bold text-white">{result.complexity.metrics.whitespace_pct}% whitespace</p>
                <p className="text-slate-400 text-[11px]">
                  Low-variance open margins separating content sections.
                </p>
                <span className="text-[10px] text-slate-500 block pt-1 border-t border-slate-800/80">
                  {result.complexity.metrics.whitespace_pct >= 25 ? 'Generous breathing room' : 'Compact margin spacing'}
                </span>
              </div>

              {/* 4. Visual Contrast */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">4. Visual Contrast</span>
                <p className="text-lg font-bold text-white">RMS: {result.complexity.metrics.contrast_rms}</p>
                <p className="text-slate-400 text-[11px]">
                  Luminance dynamic range (Brightness: {result.complexity.metrics.brightness_mean}).
                </p>
                <span className="text-[10px] text-slate-500 block pt-1 border-t border-slate-800/80">
                  RMS contrast does not verify WCAG compliance
                </span>
              </div>

            </div>

            {/* Contributing Factors & Expandable Technical Disclosure */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                Primary Model Drivers Behind This Estimate:
              </span>
              <p className="text-xs text-slate-300">
                This estimate is primarily driven by <strong>Text Density ({result.complexity.metrics.text_density_pct}%)</strong> and <strong>Edge Density ({result.complexity.metrics.edge_density_pct}%)</strong>, which together represent the largest physical contributors to scanning resistance.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setShowComplexityTech(!showComplexityTech)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>How was this calculated?</span>
                  {showComplexityTech ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showComplexityTech && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1 leading-relaxed">
                    <p>• <strong>Model:</strong> Random Forest Regressor (100 estimators, max depth 4, R² = 0.9411) fitted on 105 website screenshots.</p>
                    <p>• <strong>Target Definition:</strong> Formulated as a bounded physical composite of text density, edge density, block density, and whitespace ratio.</p>
                    <p>• <strong>Scientific Limitation:</strong> This score acts as an empirical physical complexity proxy and does not directly measure biological human cognitive workload.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Section D: Actionable Improvement Plan (Prioritized Recommendations) */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Actionable Design Improvement Plan</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Prioritized recommendations combining visual attention distribution, content density, and category comparisons
              </p>
            </div>

            <div className="space-y-4">
              {result.recommendations.map((rec, idx) => {
                const priority = rec.priority || rec.severity || 'Medium';
                const pColor = 
                  priority === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  priority === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                return (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{rec.aspect || 'Design Recommendation'}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${pColor}`}>
                        {priority} Priority
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-slate-300">
                        <strong className="text-slate-400">Finding:</strong> {rec.finding || rec.observation}
                      </p>
                      <p className="text-slate-300">
                        <strong className="text-slate-400">Why It Matters:</strong> {rec.why_it_matters || 'Affects initial scanning flow and readability.'}
                      </p>
                      <p className="text-slate-200 font-medium bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <strong className="text-indigo-300">Suggested Action:</strong> {rec.suggested_improvement || rec.suggestion}
                      </p>
                      {rec.evidence && (
                        <p className="text-[11px] text-slate-500 pt-1">
                          <strong>Evidence:</strong> {rec.evidence}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section E: Download Report Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Need an Executive Report for Your Team or Presentation?</span>
              </h4>
              <p className="text-xs text-slate-400">
                Generate a professionally formatted PDF containing all visual attention heatmaps, complexity measurements, and prioritized recommendations.
              </p>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {downloadingPdf ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download Full Analysis Report (PDF)</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
