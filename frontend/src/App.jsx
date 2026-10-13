import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroOverview from './components/HeroOverview';
import WebsiteAnalysis from './components/WebsiteAnalysis';
import DesignGuidance from './components/DesignGuidance';
import ModelInsights from './components/ModelInsights';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [backendStatus, setBackendStatus] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setBackendStatus(true);
      } else {
        setBackendStatus(false);
      }
    } catch {
      setBackendStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendStatus={backendStatus} 
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <HeroOverview setActiveTab={setActiveTab} />
        )}

        {activeTab === 'analyze' && (
          <WebsiteAnalysis />
        )}

        {activeTab === 'guidance' && (
          <DesignGuidance />
        )}

        {activeTab === 'insights' && (
          <ModelInsights />
        )}
      </main>

      {/* System Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">UI Insight</span>
            <span>&mdash; Visual Attention Prediction &amp; Cognitive Demand Analysis</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>OpenCV Spectral Residual</span>
            <span>&bull;</span>
            <span>Scikit-Learn K-Means (k=3)</span>
            <span>&bull;</span>
            <span>FastAPI Backend</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
