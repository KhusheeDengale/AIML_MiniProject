import React from 'react';
import { Eye, Brain, Compass, BarChart2, Layers, Cpu, Database, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HeroOverview({ setActiveTab }) {
  return (
    <div className="space-y-12 py-6">
      
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
          <Brain className="w-3.5 h-3.5" /> AI-Assisted Design Intelligence System
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Visual Attention Prediction &amp; Cognitive Demand Analysis
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Evaluating website designs through mathematical visual saliency, unsupervised layout clustering,
          and empirical cognitive complexity modeling for educational and product platforms.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('analyze')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Analyze Existing Website</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setActiveTab('guidance')}
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition-all hover:border-indigo-500/50 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Explore Design Guidance</span>
          </button>
        </div>
      </div>

      {/* Dual-Branch Architecture Diagram Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Dual-Branch Analytical Methodology</h2>
          <p className="text-sm text-slate-400">Combining bottom-up spatial attention prediction with structural complexity indicators</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          
          {/* Branch A */}
          <div className="glass-card rounded-xl p-6 border border-indigo-500/20 bg-indigo-950/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Branch A</span>
                <h3 className="text-lg font-bold text-white">Visual Attention Prediction</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Computes computational spatial saliency using the <strong>OpenCV Spectral Residual</strong> algorithm. 
              Extracts 2×2 quadrant attention proportions, spatial dispersion (Gini concentration), and applies 
              unsupervised <strong>Scikit-Learn K-Means ($k=3$)</strong> clustering to classify layout attention archetypes.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pixelwise saliency maps, Jet heatmaps, &amp; 50/50 overlays</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>2×2 Regional proportions (TL, TR, BL, BR $\sum = 100\%$)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>K-Means layout archetype profile matching</span>
              </li>
            </ul>
          </div>

          {/* Branch B */}
          <div className="glass-card rounded-xl p-6 border border-cyan-500/20 bg-cyan-950/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Branch B</span>
                <h3 className="text-lg font-bold text-white">Visual &amp; Textual Complexity</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Evaluates visual and typographical clutter using classical computer vision and OCR. 
              Extracts Canny edge density, luminance contrast, structural patch whitespace, and text coverage 
              to formulate a transparent <strong>Cognitive Demand Proxy Index (0–100)</strong>.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Canny edge density (visual detail and contour clutter)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>10×10 Patch low-variance whitespace estimation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bounded Cognitive Demand Proxy Index (Low/Med/High)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Unified Recommendation Synthesis Footer */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-800/60 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Integrated Output: Dual-Branch Evidence-Based Recommendations &amp; Category Benchmark Deviations</span>
          </div>
        </div>
      </div>

      {/* Dataset & Performance Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-800 text-center">
          <Database className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">105</div>
          <div className="text-xs text-slate-400">Real Screenshots Evaluated</div>
          <div className="text-[10px] text-slate-500 mt-0.5">55 Education / 50 Product</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800 text-center">
          <Cpu className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">k = 3</div>
          <div className="text-xs text-slate-400">K-Means Saliency Clusters</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Silhouette Score: 0.2716</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800 text-center">
          <BarChart2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">2×2</div>
          <div className="text-xs text-slate-400">Spatial Quadrant Density</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Top-Left to Bottom-Right</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800 text-center">
          <Brain className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">0–100</div>
          <div className="text-xs text-slate-400">Cognitive Demand Proxy</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Transparent Heuristic Index</div>
        </div>
      </div>

    </div>
  );
}

function Sparkles(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
