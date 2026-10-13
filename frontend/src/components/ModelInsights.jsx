import React, { useState, useEffect } from 'react';
import { 
  Brain, BarChart3, Database, Layers, GitCompare, 
  HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, Table as TableIcon,
  ChevronDown, ChevronUp, Cpu, Sparkles
} from 'lucide-react';

export default function ModelInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModelTab, setSelectedModelTab] = useState('comparison');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/ml-insights');
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (err) {
      console.error('Failed to load ML insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading Academic ML Insights &amp; Model Evaluations...</span>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p>ML Insights dataset could not be loaded from backend.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold mb-2">
            <Brain className="w-3.5 h-3.5" /> Academic &amp; Technical Workspace
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Machine Learning Insights &amp; Model Evaluation
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Rigorous evaluation metrics, comparative baselines, and feature correlations across the 105-website academic research corpus.
          </p>
        </div>

        {/* Section Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedModelTab('comparison')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedModelTab === 'comparison' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Comparison
          </button>
          <button
            onClick={() => setSelectedModelTab('kmeans')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedModelTab === 'kmeans' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            K-Means Clustering
          </button>
          <button
            onClick={() => setSelectedModelTab('rf')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedModelTab === 'rf' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Random Forest
          </button>
          <button
            onClick={() => setSelectedModelTab('correlations')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedModelTab === 'correlations' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Correlations
          </button>
          <button
            onClick={() => setSelectedModelTab('transparency')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedModelTab === 'transparency' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transparency Matrix
          </button>
        </div>
      </div>

      {/* SECTION 1: Model Comparison vs. Baselines */}
      {selectedModelTab === 'comparison' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-violet-400" />
                  <span>Cross-Validated Model Comparison (5-Fold CV on 105 Sites)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison between the primary Random Forest model and standard baselines on the complexity index.
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-300 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Model Architecture</th>
                    <th className="p-3">Cross-Val R² Score</th>
                    <th className="p-3">Mean Absolute Error (MAE)</th>
                    <th className="p-3">Root Mean Squared Error (RMSE)</th>
                    <th className="p-3">Methodological Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {insights.model_comparison.map((model, idx) => (
                    <tr key={idx} className={model.is_primary ? 'bg-violet-950/20 font-medium' : ''}>
                      <td className="p-3.5 text-white flex items-center gap-2">
                        {model.is_primary && <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold border border-violet-500/30">Primary</span>}
                        <span>{model.model_name}</span>
                      </td>
                      <td className="p-3.5 font-bold text-cyan-300">
                        {model.cv_r2 >= 0 ? model.cv_r2.toFixed(4) : model.cv_r2.toFixed(2)}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-300">
                        {model.cv_mae.toFixed(2)} pts
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        {model.cv_rmse.toFixed(2)} pts
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-xs leading-relaxed">
                        {model.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Academic Evaluation Discussion Note */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Academic Transparency Note on Model Training Targets</span>
              </h4>
              <p>
                <strong>Why Linear Regression achieves high R²:</strong> The training label in the teammate notebook was derived as a weighted linear combination of 4 normalized features:
                <code className="text-slate-200 ml-1 px-1.5 py-0.5 rounded bg-slate-900 font-mono text-[11px]">
                  score = 100 × (0.35·text + 0.25·edge + 0.20·block + 0.20·(1 - whitespace))
                </code>.
                Consequently, an ordinary linear regression model trivially recovers these coefficients.
              </p>
              <p>
                <strong>Scientific Limitation:</strong> High R² demonstrates that the Random Forest faithfully acts as a surrogate for the mathematical composite formula. It does <strong>not</strong> prove predictive validity against biological human cognitive workload (which requires EEG or NASA-TLX ground truth).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: K-Means Clustering */}
      {selectedModelTab === 'kmeans' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Unsupervised K-Means Layout Archetype Classification (k=3)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trained on 105 website screenshots using 5 spatial attention features (4 quadrant percentages + Gini index).
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                Silhouette Score: 0.2716
              </span>
            </div>

            {/* Clusters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Archetype 0</span>
                <h4 className="text-sm font-extrabold text-white">Balanced / Distributed Layout</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Attention is apportioned smoothly across all quadrants without extreme dominance. Common in multi-product showcase grids.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>Corpus Representation:</span>
                  <span className="font-bold text-white">{insights.kmeans_analysis.cluster_distribution["Cluster 0 (Balanced / Distributed)"]} websites (43%)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Archetype 1</span>
                <h4 className="text-sm font-extrabold text-white">Top-Left Focal (Header &amp; F-Pattern)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Concentrates visual attention strongly in the top-left quadrant (&gt;35%). Reflects traditional Western reading order.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>Corpus Representation:</span>
                  <span className="font-bold text-white">{insights.kmeans_analysis.cluster_distribution["Cluster 1 (Top-Left Focal / F-Pattern)"]} websites (34%)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Archetype 2</span>
                <h4 className="text-sm font-extrabold text-white">Lower Grid / Content Weighted</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Visual weight shifts towards lower-half cards, thumbnails, or product listings beneath minimal headers.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>Corpus Representation:</span>
                  <span className="font-bold text-white">{insights.kmeans_analysis.cluster_distribution["Cluster 2 (Content Grid / Lower-Weighted)"]} websites (23%)</span>
                </div>
              </div>
            </div>

            {/* Distribution by Category */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block">Category Archetype Distribution:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-indigo-300 block mb-1">Educational Websites (55 sites):</span>
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <div className="flex justify-between"><span>Cluster 0 (Balanced):</span> <span className="font-bold text-white">{insights.kmeans_analysis.by_category.Education["Cluster 0"] || 23}</span></div>
                    <div className="flex justify-between"><span>Cluster 1 (Top-Left Focal):</span> <span className="font-bold text-white">{insights.kmeans_analysis.by_category.Education["Cluster 1"] || 20}</span></div>
                    <div className="flex justify-between"><span>Cluster 2 (Lower Weighted):</span> <span className="font-bold text-white">{insights.kmeans_analysis.by_category.Education["Cluster 2"] || 12}</span></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-cyan-300 block mb-1">Product Websites (50 sites):</span>
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <div className="flex justify-between"><span>Cluster 0 (Balanced):</span> <span className="font-bold text-white">{insights.kmeans_analysis.by_category.Product["Cluster 0"] || 22}</span></div>
                    <div className="flex justify-between"><span>Cluster 1 (Top-Left Focal):</span> <span className="font-bold text-white">{insights.kmeans_analysis.by_category.Product["Cluster 1"] || 16}</span></div>
                    <div className="flex justify-between"><span>Cluster 2 (Lower Weighted):</span> <span className="font-bold text-white">{insights.kmeans_analysis.by_category.Product["Cluster 2"] || 12}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Random Forest Feature Importances */}
      {selectedModelTab === 'rf' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Random Forest Regressor Feature Importances (Gini Impurity Reduction)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Relative contribution of each physical visual and textual feature across 100 decision trees (depth = 4).
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(insights.feature_importance_rf).map(([feat, imp], idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200 capitalize">{feat.replace(/_/g, ' ')}</span>
                    <span className="text-cyan-300 font-bold font-mono">{(imp * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      style={{ width: `${imp * 100}%` }}
                      className={`h-full ${
                        idx === 0 ? 'bg-cyan-500' :
                        idx === 1 ? 'bg-indigo-500' :
                        idx === 2 ? 'bg-violet-500' :
                        idx === 3 ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300">Observation:</span>
              <p>
                <strong>Text Density (33.7%)</strong> and <strong>Edge Density (29.5%)</strong> collectively account for over 63% of the total predictive power of the model. 
                This matches design intuition: high visual clutter and heavy typographic coverage are the primary contributors to elevated interface complexity.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Feature Correlations */}
      {selectedModelTab === 'correlations' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span>Feature Correlation Matrix (Pearson r on 105 Websites)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pairwise linear correlation coefficients between extracted physical features and the complexity score.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Feature</th>
                    <th className="p-2.5">Word Count</th>
                    <th className="p-2.5">Text Dens</th>
                    <th className="p-2.5">Edge Dens</th>
                    <th className="p-2.5">Whitespace</th>
                    <th className="p-2.5">Contrast</th>
                    <th className="p-2.5 font-bold text-cyan-300">Complexity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono text-[11px]">
                  {['word_count', 'text_density', 'edge_density', 'whitespace_ratio', 'contrast'].map((rowKey) => (
                    <tr key={rowKey}>
                      <td className="p-2.5 font-sans font-medium text-slate-300 capitalize">{rowKey.replace(/_/g, ' ')}</td>
                      <td className="p-2.5 text-slate-400">{insights.feature_correlations[rowKey]?.word_count}</td>
                      <td className="p-2.5 text-slate-400">{insights.feature_correlations[rowKey]?.text_density}</td>
                      <td className="p-2.5 text-slate-400">{insights.feature_correlations[rowKey]?.edge_density}</td>
                      <td className="p-2.5 text-slate-400">{insights.feature_correlations[rowKey]?.whitespace_ratio}</td>
                      <td className="p-2.5 text-slate-400">{insights.feature_correlations[rowKey]?.contrast}</td>
                      <td className="p-2.5 font-bold text-cyan-300">{insights.feature_correlations[rowKey]?.complexity_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>• <strong>Strong positive correlations with complexity:</strong> Text Density (<code className="text-cyan-300">r = +0.838</code>), Word Count (<code className="text-cyan-300">r = +0.713</code>), and Edge Density (<code className="text-cyan-300">r = +0.672</code>).</p>
              <p>• <strong>Negative correlation with complexity:</strong> Whitespace Ratio (<code className="text-emerald-300">r = -0.528</code>) confirms that open layout margins reduce estimated complexity.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Academic Transparency Matrix */}
      {selectedModelTab === 'transparency' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <span>Academic Methodology &amp; Engineering Transparency Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact technical taxonomy separating classical computer vision, machine learning, OCR, and heuristic rules.
              </p>
            </div>

            <div className="space-y-3">
              {insights.methodology_matrix.map((row, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{row.component}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {row.type}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-300">{row.technique}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{row.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
