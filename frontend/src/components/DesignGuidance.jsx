import React, { useState, useEffect } from 'react';
import { 
  Compass, GraduationCap, ShoppingBag, Grid, Layers, Lightbulb, 
  BarChart3, ArrowLeftRight, CheckCircle2, Download, FileText, 
  Sparkles, Eye, ShieldCheck, HelpCircle, ArrowRight
} from 'lucide-react';

export default function DesignGuidance() {
  const [category, setCategory] = useState('Education');
  const [refData, setRefData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [otherData, setOtherData] = useState(null);

  useEffect(() => {
    fetchReferenceData(category);
  }, [category]);

  const fetchReferenceData = async (cat) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reference/${cat}`);
      if (!res.ok) throw new Error('Failed to load reference data');
      const data = await res.json();
      setRefData(data);

      // Also fetch alternative category for side-by-side comparison
      const otherCat = cat === 'Education' ? 'Product' : 'Education';
      const otherRes = await fetch(`/api/reference/${otherCat}`);
      if (otherRes.ok) {
        const oData = await otherRes.json();
        setOtherData(oData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch(`/api/reports/guidance/${category}`);
      if (!res.ok) throw new Error('Failed to download report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UI_Insight_${category}_Design_Blueprint.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not download PDF blueprint. Please check server connection.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const currentMeans = refData?.means || {
    pct_top_left: 26.4, pct_top_right: 22.0, pct_bottom_left: 26.9, pct_bottom_right: 24.6,
    pct_top: 48.4, pct_bottom: 51.6, pct_left: 53.4, pct_right: 46.6, saliency_concentration_gini: 0.51
  };

  const compBench = refData?.complexity_benchmarks || {};
  const otherBench = otherData?.complexity_benchmarks || {};

  return (
    <div className="space-y-10 py-4">
      
      {/* Workflow A Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" /> Workflow A &bull; New Website Planning
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            New Website Design Guidance
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Plan spatial attention hierarchy, content density, and whitespace using empirical benchmarks from our 105 analyzed websites.
          </p>
        </div>

        {/* Action Controls: Category Switcher & PDF Download */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setCategory('Education')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                category === 'Education'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Educational</span>
            </button>

            <button
              onClick={() => setCategory('Product')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                category === 'Product'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Product &amp; Store</span>
            </button>
          </div>

          <button
            onClick={handleDownloadReport}
            disabled={downloadingPdf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
          >
            {downloadingPdf ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download Blueprint (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Guidance Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 6 Columns: Dimension A - Visual Attention Reference */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Dimension A: Visual Attention Reference</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Aggregate spatial heatmap from {refData?.sample_count || 50} analyzed {category} websites
                </span>
              </div>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                  showGrid ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>2×2 Grid</span>
              </button>
            </div>

            {/* Heatmap Viewer with 2x2 grid */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[300px]">
              {refData?.visualizations?.aggregate_heatmap_url ? (
                <img
                  src={refData.visualizations.aggregate_heatmap_url}
                  alt={`${category} aggregate heatmap`}
                  className="w-full h-auto object-contain max-h-[360px]"
                />
              ) : (
                <div className="p-8 text-xs text-slate-500">Loading aggregate heatmap...</div>
              )}

              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2 border border-dashed border-white/20">
                  <div className="border-r border-b border-dashed border-white/20 p-2 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-white bg-slate-950/70 px-1.5 py-0.5 rounded self-start">
                      TL: {currentMeans.pct_top_left}%
                    </span>
                  </div>
                  <div className="border-b border-dashed border-white/20 p-2 flex flex-col justify-between items-end">
                    <span className="text-[10px] font-bold text-white bg-slate-950/70 px-1.5 py-0.5 rounded">
                      TR: {currentMeans.pct_top_right}%
                    </span>
                  </div>
                  <div className="border-r border-dashed border-white/20 p-2 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-white bg-slate-950/70 px-1.5 py-0.5 rounded self-start">
                      BL: {currentMeans.pct_bottom_left}%
                    </span>
                  </div>
                  <div className="p-2 flex flex-col justify-between items-end">
                    <span className="text-[10px] font-bold text-white bg-slate-950/70 px-1.5 py-0.5 rounded">
                      BR: {currentMeans.pct_bottom_right}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Macro Balance & Focus Distribution */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Upper-Half Focus</span>
                <span className="text-base font-bold text-white">{currentMeans.pct_top}%</span>
                <span className="text-[10px] text-slate-500 block">Initial hero scan</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Left-Side Weight</span>
                <span className="text-base font-bold text-indigo-300">{currentMeans.pct_left}%</span>
                <span className="text-[10px] text-slate-500 block">Reading column bias</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Focus Concentration</span>
                <span className="text-base font-bold text-cyan-300">
                  {currentMeans.saliency_concentration_gini > 0.45 ? 'Focused' : 'Distributed'}
                </span>
                <span className="text-[10px] text-slate-500 block">Gini: {currentMeans.saliency_concentration_gini}</span>
              </div>
            </div>

            {/* Design Implication */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-indigo-300 block">Layout Planning Implication:</span>
              <p>
                {category === 'Education'
                  ? 'Educational portals exhibit strong left-side attention (53.4%). Place institutional branding and primary navigation in the top-left, and anchor main admissions or enrollment CTAs directly along this natural scan path.'
                  : 'Product websites distribute attention more evenly across left and right (50.5% vs 49.5%). Pair prominent product photography on one side with clear pricing and checkout buttons on the other.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Dimension B - Reading & Visual Complexity Planning */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Dimension B: Content &amp; Complexity Planning</span>
              </h3>
              <span className="text-xs text-slate-400">
                Target ranges derived from 105 measured websites in our academic corpus
              </span>
            </div>

            {/* Complexity Benchmark Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Target Visual Complexity</span>
                <span className="text-xl font-bold text-white">
                  {compBench?.complexity_score?.mean || 38.5} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </span>
                <span className="text-[10px] text-emerald-400 block font-medium">
                  {compBench?.complexity_score?.distribution?.moderate_pct || 65}% of sites in Moderate tier
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Recommended Whitespace</span>
                <span className="text-xl font-bold text-indigo-300">
                  {compBench?.whitespace_ratio?.mean_pct || 24.5}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Aim for &ge; 20% margin breathing room
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Text Viewport Coverage</span>
                <span className="text-xl font-bold text-white">
                  ~{compBench?.text_density?.mean_pct || 14.8}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ~{compBench?.word_count?.mean || 355} words average per viewport
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Edge Texture Detail</span>
                <span className="text-xl font-bold text-cyan-300">
                  {compBench?.edge_density?.mean_pct || 4.6}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Limit complex patterns pushing edge &gt; 8%
                </span>
              </div>
            </div>

            {/* Complexity Guidance Advice */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
              <span className="font-bold text-slate-200 block">Content Density Strategy:</span>
              <p>
                {category === 'Education'
                  ? 'Educational pages tend to be text-rich with course catalogs and accreditation details. To prevent cognitive overload, structure long copy into bite-sized card components with distinct sub-headings and ample section margins.'
                  : 'Product pages feature rich image cards and specifications. Guard against visual clutter by limiting decorative borders and using clean white or neutral backdrops for product showcases.'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Seven-Point Practical Design Checklist */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Seven-Point Practical Design Checklist for {category} Websites</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Actionable wireframe and layout guidelines grounded in empirical visual and readability benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">1. Visual Hierarchy</span>
            <h4 className="font-bold text-white">Establish One Clear Primary Anchor</h4>
            <p className="text-slate-400 leading-relaxed">
              Position the primary headline or hero visual in the top 40% of the viewport to immediately orient incoming gaze.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">2. Navigation Clarity</span>
            <h4 className="font-bold text-white">Limit Global Links to 5–7 Items</h4>
            <p className="text-slate-400 leading-relaxed">
              Maintain standard header placement. Avoid overwhelming top bars with complex multi-level dropdowns on first landing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">3. Primary Action Visibility</span>
            <h4 className="font-bold text-white">High-Contrast Call-to-Action</h4>
            <p className="text-slate-400 leading-relaxed">
              Ensure enrollment or buy buttons possess distinct luminance contrast against their surroundings to stand out.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">4. Text Chunking</span>
            <h4 className="font-bold text-white">Modular Card Layouts</h4>
            <p className="text-slate-400 leading-relaxed">
              Keep paragraphs under 3–4 sentences. Utilize bold lead-ins and structured badges for quick scannability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">5. Margin Breathing Room</span>
            <h4 className="font-bold text-white">Preserve Generous Whitespace</h4>
            <p className="text-slate-400 leading-relaxed">
              Maintain at least 32px–64px vertical spacing between major thematic sections to avoid perceived visual clutter.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">6. Visual Clutter Restraint</span>
            <h4 className="font-bold text-white">Minimize Competing Badges</h4>
            <p className="text-slate-400 leading-relaxed">
              Avoid surrounding products with excessive stickers, floating alerts, or heavy outlines that inflate edge density.
            </p>
          </div>
        </div>
      </div>

      {/* Educational vs. Product Side-by-Side Comparison */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-violet-400" />
          <span>Educational vs. Product Website Design Comparison</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Design Dimension</th>
                <th className="p-3 text-indigo-300">Educational Portals (55 Sites)</th>
                <th className="p-3 text-cyan-300">Product &amp; Storefronts (50 Sites)</th>
                <th className="p-3">Strategic Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              <tr>
                <td className="p-3 font-semibold text-white">Left vs. Right Attention</td>
                <td className="p-3 text-slate-300">53.4% Left / 46.6% Right</td>
                <td className="p-3 text-slate-300">50.5% Left / 49.5% Right</td>
                <td className="p-3 text-slate-400">Education leans into Western reading column; Product balances image &amp; action.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Average Whitespace</td>
                <td className="p-3 text-slate-300">24.5% open space</td>
                <td className="p-3 text-slate-300">21.3% open space</td>
                <td className="p-3 text-slate-400">Educational sites allocate more breathing room to offset dense body typography.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Canny Edge Density</td>
                <td className="p-3 text-slate-300">4.59% boundary lines</td>
                <td className="p-3 text-slate-300">4.77% boundary lines</td>
                <td className="p-3 text-slate-400">Product sites feature higher edge detail from item cards, grids, and rating stars.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Dominant Focus Pattern</td>
                <td className="p-3 text-slate-300">Top-Left Focal &amp; F-Pattern</td>
                <td className="p-3 text-slate-300">Distributed &amp; Dual-Anchor</td>
                <td className="p-3 text-slate-400">Educational users seek institutional identity; shoppers scan multi-item grids.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-slate-500 pt-1">
          <strong>Methodological Note:</strong> Category benchmarks are computed from the real 105-screenshot academic corpus. Guidance assists pre-design wireframing and does not evaluate unbuilt sites.
        </div>
      </div>

    </div>
  );
}
