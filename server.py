"""
server.py
---------
FastAPI Backend Application for UI Insight.
Connects real computer vision, K-Means clustering, and visual/textual complexity analysis.
Serves static generated artifacts and exposes RESTful JSON endpoints.
"""

import os
import shutil
import uuid
import json
from pathlib import Path
from typing import Optional, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Internal domain engines
from infer_saliency import analyze_screenshot
from complexity_analysis import analyze_complexity
from report_generator import generate_website_analysis_pdf, generate_category_guidance_pdf, REPORTS_DIR

# Workspace directories
BASE_DIR = Path(__file__).resolve().parent
IMAGES_DIR = BASE_DIR / "images"
OUTPUT_OPENCV_DIR = BASE_DIR / "output_opencv"
OUTPUT_INFERENCE_DIR = BASE_DIR / "output_inference"
UPLOADS_DIR = BASE_DIR / "uploads"
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

# Ensure runtime directories exist
OUTPUT_OPENCV_DIR.mkdir(exist_ok=True)
OUTPUT_INFERENCE_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="UI Insight API",
    description="Visual Saliency & Cognitive Complexity Analysis Engine",
    version="2.0.0"
)

# CORS Configuration for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file directories so frontend can view generated images
app.mount("/static/inference", StaticFiles(directory=str(OUTPUT_INFERENCE_DIR)), name="inference")
app.mount("/static/opencv", StaticFiles(directory=str(OUTPUT_OPENCV_DIR)), name="opencv")
app.mount("/static/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
if IMAGES_DIR.exists():
    app.mount("/static/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")

# Load reference statistics cached in data
REFERENCE_STATS = {}
STATS_FILE = DATA_DIR / "category_reference_stats.json"
if STATS_FILE.exists():
    try:
        with open(STATS_FILE, "r", encoding="utf-8") as f:
            REFERENCE_STATS = json.load(f)
    except Exception as e:
        print(f"[warning] Failed to load reference stats: {e}")

# Load ML Insights data
ML_INSIGHTS_DATA = {}
ML_INSIGHTS_FILE = DATA_DIR / "ml_insights_data.json"
if ML_INSIGHTS_FILE.exists():
    try:
        with open(ML_INSIGHTS_FILE, "r", encoding="utf-8") as f:
            ML_INSIGHTS_DATA = json.load(f)
    except Exception as e:
        print(f"[warning] Failed to load ML insights data: {e}")

# In-memory analysis cache for report downloads
ANALYSIS_CACHE = {}

# Load cluster profiles metadata
CLUSTER_PROFILES = {}
PROFILES_FILE = MODELS_DIR / "saliency_cluster_profiles.json"
if PROFILES_FILE.exists():
    try:
        with open(PROFILES_FILE, "r", encoding="utf-8") as f:
            CLUSTER_PROFILES = json.load(f)
    except Exception as e:
        print(f"[warning] Failed to load cluster profiles: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "UI Insight Backend",
        "engine": "OpenCV Spectral Residual + Scikit-Learn K-Means & Random Forest Complexity",
        "models_available": (MODELS_DIR / "kmeans_saliency_model.joblib").exists(),
        "complexity_model_available": (MODELS_DIR / "random_forest_complexity_model.joblib").exists(),
        "datasets_available": STATS_FILE.exists(),
        "ml_insights_available": ML_INSIGHTS_FILE.exists()
    }

@app.get("/api/categories")
def get_categories():
    return {
        "categories": [
            {
                "id": "Education",
                "name": "Educational Websites",
                "description": "Universities, academic platforms, online courses, and research portals.",
                "characteristics": "Prioritizes typography, navigational clarity, structured content blocks, and admissions actions."
            },
            {
                "id": "Product",
                "name": "Product & E-Commerce",
                "description": "Online marketplaces, electronics stores, fashion retailers, and product showcases.",
                "characteristics": "Focuses on visual product prominence, clear purchase CTAs, scannable pricing, and promotional restraint."
            }
        ]
    }

@app.get("/api/reference/{category}")
def get_category_reference(category: str):
    cat_key = "Education" if "edu" in category.lower() else "Product"
    
    if not REFERENCE_STATS or "categories" not in REFERENCE_STATS:
        raise HTTPException(status_code=500, detail="Reference statistics not loaded on backend.")
    
    cat_data = REFERENCE_STATS["categories"].get(cat_key)
    if not cat_data:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found.")

    # Image asset URLs for category aggregates
    agg_heatmap = f"/static/opencv/{'eduDataset' if cat_key == 'Education' else 'ProductDataset'}_aggregate_heatmap.png"
    agg_gray = f"/static/opencv/{'eduDataset' if cat_key == 'Education' else 'ProductDataset'}_aggregate_gray.png"

    guidelines = []
    if cat_key == "Education":
        guidelines = [
            {
                "title": "Establish an F-Pattern Reading Flow",
                "description": "Academic portals typically exhibit high left-side saliency (53.4% left). Anchor primary institutional logos and course navigators in the upper-left quadrant.",
                "principle": "Hierarchy"
            },
            {
                "title": "Segment Information Densities",
                "description": "Ensure course descriptions and announcements do not crowd out primary enrollment or application call-to-actions.",
                "principle": "Chunking"
            },
            {
                "title": "Preserve Structural Whitespace",
                "description": "Academic text density can elevate cognitive demand. Maintain clear section margins to provide visual breathing room.",
                "principle": "Readability"
            }
        ]
    else:
        guidelines = [
            {
                "title": "Balance Hero Imagery & Purchase CTAs",
                "description": "Product websites show symmetrical left-right attention (50.5% vs 49.5%). Ensure prominent product photography does not overshadow buy buttons or pricing.",
                "principle": "Conversion"
            },
            {
                "title": "Manage Promotional Clutter",
                "description": "Dispersed saliency (lower Gini index 0.43) indicates competing stimuli. Highlight one primary conversion goal per viewport.",
                "principle": "Focus"
            },
            {
                "title": "Scannable Specifications",
                "description": "Organize technical specs and ratings into compact badge components rather than unformatted text blocks.",
                "principle": "Scannability"
            }
        ]

    return {
        "category": cat_key,
        "sample_count": cat_data["count"],
        "means": cat_data["means"],
        "medians": cat_data["medians"],
        "cluster_distribution": cat_data["cluster_profile_distribution"],
        "complexity_benchmarks": cat_data.get("complexity_benchmarks", {}),
        "visualizations": {
            "aggregate_heatmap_url": agg_heatmap,
            "aggregate_gray_url": agg_gray
        },
        "design_guidelines": guidelines
    }

@app.get("/api/ml-insights")
def get_ml_insights():
    """Returns genuine academic ML model evaluation metrics, comparisons, and feature correlations."""
    if not ML_INSIGHTS_DATA:
        if ML_INSIGHTS_FILE.exists():
            with open(ML_INSIGHTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        raise HTTPException(status_code=500, detail="ML insights data not found.")
    return ML_INSIGHTS_DATA

@app.get("/api/reports/analysis/{analysis_id}")
def download_analysis_report(analysis_id: str):
    """Generates and serves a professional PDF report for an analyzed website."""
    cached = ANALYSIS_CACHE.get(analysis_id)
    if not cached:
        raise HTTPException(status_code=404, detail="Analysis session expired or not found. Please re-run analysis.")
    
    orig_path = cached.get("_original_path")
    heat_path = cached.get("_heatmap_path")
    pdf_filename = f"UI_Insight_Report_{analysis_id}.pdf"
    pdf_out = REPORTS_DIR / pdf_filename
    
    try:
        generate_website_analysis_pdf(
            analysis_result=cached["data"],
            original_image_path=orig_path,
            heatmap_image_path=heat_path,
            output_path=pdf_out
        )
        return FileResponse(
            str(pdf_out),
            media_type="application/pdf",
            filename=pdf_filename
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis PDF: {e}")

@app.get("/api/reports/guidance/{category}")
def download_guidance_report(category: str):
    """Generates and serves a professional PDF design blueprint for a website category."""
    cat_key = "Education" if "edu" in category.lower() else "Product"
    if not REFERENCE_STATS or "categories" not in REFERENCE_STATS:
        raise HTTPException(status_code=500, detail="Reference statistics not loaded.")
    
    cat_data = REFERENCE_STATS["categories"].get(cat_key)
    if not cat_data:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found.")
        
    agg_heatmap = OUTPUT_OPENCV_DIR / f"{'eduDataset' if cat_key == 'Education' else 'ProductDataset'}_aggregate_heatmap.png"
    pdf_filename = f"UI_Insight_{cat_key}_Design_Blueprint.pdf"
    pdf_out = REPORTS_DIR / pdf_filename
    
    try:
        generate_category_guidance_pdf(
            category=cat_key,
            cat_data=cat_data,
            aggregate_heatmap_path=str(agg_heatmap),
            output_path=pdf_out
        )
        return FileResponse(
            str(pdf_out),
            media_type="application/pdf",
            filename=pdf_filename
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate guidance PDF: {e}")

@app.get("/api/samples")
def get_sample_screenshots():
    """Return available pre-loaded sample screenshots for instant demonstration."""
    samples = []
    edu_dir = IMAGES_DIR / "eduDataset" / "eduDataset"
    prod_dir = IMAGES_DIR / "ProductDataset"
    
    if edu_dir.exists():
        for p in sorted(edu_dir.glob("*.png"))[:3]:
            samples.append({
                "id": p.stem,
                "name": f"Education Sample: {p.stem[:22]}...",
                "category": "Education",
                "relative_path": f"eduDataset/eduDataset/{p.name}",
                "thumbnail_url": f"/static/images/eduDataset/eduDataset/{p.name}"
            })

    if prod_dir.exists():
        for p in sorted(prod_dir.glob("*.png"))[:3]:
            samples.append({
                "id": p.stem,
                "name": f"Product Sample: {p.stem[:22]}...",
                "category": "Product",
                "relative_path": f"ProductDataset/{p.name}",
                "thumbnail_url": f"/static/images/ProductDataset/{p.name}"
            })

    return {"samples": samples}

@app.post("/api/analyze")
async def analyze_website(
    file: Optional[UploadFile] = File(None),
    sample_path: Optional[str] = Form(None),
    category: str = Form("Product")
):
    """
    Unified analysis endpoint executing:
      1. OpenCV Saliency Prediction & Map Generation
      2. 2x2 Regional Feature Extraction & Gini Concentration
      3. Scikit-Learn K-Means Layout Archetype Classification
      4. Category Benchmark Deviation Comparison
      5. Visual & Textual Complexity Analysis (Proxy Index)
      6. Dual-Branch Evidence-Based Design Recommendations
    """
    cat_key = "Education" if "edu" in category.lower() else "Product"
    unique_id = uuid.uuid4().hex[:10]

    # Handle file input: either uploaded file or preset sample
    if file and file.filename:
        stem = Path(file.filename).stem
        ext = Path(file.filename).suffix or ".png"
        saved_filename = f"{unique_id}_{stem}{ext}"
        saved_path = UPLOADS_DIR / saved_filename
        
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        original_img_url = f"/static/uploads/{saved_filename}"
    elif sample_path:
        sample_file = IMAGES_DIR / sample_path
        if not sample_file.exists():
            raise HTTPException(status_code=400, detail="Requested sample file not found on disk.")
        saved_path = sample_file
        original_img_url = f"/static/images/{sample_path}"
    else:
        raise HTTPException(status_code=400, detail="No screenshot file uploaded or sample selected.")

    try:
        # Branch A: Visual Saliency Inference
        saliency_result = analyze_screenshot(
            image_path=str(saved_path),
            category=cat_key,
            save_outputs=True
        )

        # Branch B: Visual & Textual Complexity Analysis
        complexity_result = analyze_complexity(image_input=str(saved_path))

        # Build accessible static URLs for generated saliency images
        stem = saved_path.stem
        map_url = f"/static/inference/{stem}_saliency_map.png"
        heatmap_url = f"/static/inference/{stem}_heatmap.png"
        overlay_url = f"/static/inference/{stem}_overlay.png"

        # Generate prioritized, evidence-based recommendations
        reg = saliency_result["regional_percentages"]
        comp_score = complexity_result["complexity_score"]
        comp_metrics = complexity_result["metrics"]
        gini = saliency_result["saliency_concentration_gini"]
        
        # Get category benchmark references
        cat_data = REFERENCE_STATS.get("categories", {}).get(cat_key, {})
        ref_means = cat_data.get("means", {})
        comp_bench = cat_data.get("complexity_benchmarks", {})
        
        prioritized_recs = []
        
        # 1. High-Density Text & Cognitive Reading Load
        txt_dens = comp_metrics.get("text_density_pct", 0)
        word_cnt = comp_metrics.get("word_count", 0)
        ref_txt = comp_bench.get("text_density", {}).get("mean_pct", 14.8)
        
        if txt_dens > 20.0 or word_cnt > 400:
            prioritized_recs.append({
                "finding": f"High text coverage detected ({txt_dens}% of viewport, ~{word_cnt} words).",
                "why_it_matters": "Extensive uninterrupted text blocks significantly elevate reading effort and hinder rapid scanning.",
                "suggested_improvement": "Break continuous paragraphs into modular cards, bulleted takeaways, and distinct sub-headings.",
                "priority": "High",
                "evidence": f"Text density of {txt_dens}% exceeds the {cat_key} benchmark average of {ref_txt}%.",
                "aspect": "Content Density & Text Load",
                "observation": f"High text coverage detected ({txt_dens}% of viewport, ~{word_cnt} words).",
                "suggestion": "Break continuous paragraphs into modular cards, bulleted takeaways, and distinct sub-headings.",
                "severity": "High"
            })
        
        # 2. Visual Clutter / Edge Texture
        edge_dens = comp_metrics.get("edge_density_pct", 0)
        ref_edge = comp_bench.get("edge_density", {}).get("mean_pct", 4.6)
        
        if edge_dens > 7.0:
            prioritized_recs.append({
                "finding": f"High edge density ({edge_dens}%) indicating dense visual textures and borders.",
                "why_it_matters": "Excessive high-frequency visual lines create visual noise and compete with focal content.",
                "suggested_improvement": "Simplify card borders, decrease thumbnail outlines, and replace busy background textures with flat fills.",
                "priority": "High",
                "evidence": f"Canny edge density of {edge_dens}% is elevated compared to the {cat_key} baseline of {ref_edge}%.",
                "aspect": "Visual Clutter & Texture",
                "observation": f"High edge density ({edge_dens}%) indicating dense visual textures and borders.",
                "suggestion": "Simplify card borders, decrease thumbnail outlines, and replace busy background textures with flat fills.",
                "severity": "High"
            })
            
        # 3. Structural Whitespace / Breathing Room
        white_pct = comp_metrics.get("whitespace_pct", 0)
        ref_white = comp_bench.get("whitespace_ratio", {}).get("mean_pct", 23.0)
        
        if white_pct < 12.0:
            prioritized_recs.append({
                "finding": f"Restricted structural whitespace ({white_pct}% open space).",
                "why_it_matters": "Elements placed too closely together cause visual crowding and reduce comprehension speed.",
                "suggested_improvement": "Increase layout margins between major sections to at least 32px–48px to introduce breathing room.",
                "priority": "High",
                "evidence": f"Whitespace ratio of {white_pct}% is below the {cat_key} benchmark average of {ref_white}%.",
                "aspect": "Layout Breathing Room",
                "observation": f"Restricted structural whitespace ({white_pct}% open space).",
                "suggestion": "Increase layout margins between major sections to at least 32px–48px to introduce breathing room.",
                "severity": "High"
            })
        elif white_pct >= 35.0:
            prioritized_recs.append({
                "finding": f"Generous whitespace ratio detected ({white_pct}% open space).",
                "why_it_matters": "Ample open space creates a calm, focused reading environment and highlights key elements.",
                "suggested_improvement": "Preserve this clean visual pacing while verifying that primary action buttons maintain sufficient visual prominence.",
                "priority": "Low",
                "evidence": f"Whitespace of {white_pct}% comfortably exceeds the {cat_key} baseline ({ref_white}%).",
                "aspect": "Visual Breathing Room",
                "observation": f"Generous whitespace ratio detected ({white_pct}% open space).",
                "suggestion": "Preserve this clean visual pacing while verifying that primary action buttons maintain sufficient visual prominence.",
                "severity": "Low"
            })

        # 4. Attention Dispersion (Gini Index)
        ref_gini = ref_means.get("saliency_concentration_gini", 0.47)
        if gini < 0.35:
            prioritized_recs.append({
                "finding": f"Dispersed visual attention pattern across multiple regions (Focus Index: {gini:.3f}).",
                "why_it_matters": "When attention is divided across multiple stimuli, visitors can experience uncertainty about where to look first.",
                "suggested_improvement": "Establish one dominant primary visual anchor (e.g., prominent hero banner or heading) with stronger visual contrast.",
                "priority": "Medium",
                "evidence": f"Focus concentration index ({gini:.3f}) is lower than the {cat_key} benchmark ({ref_gini}).",
                "aspect": "Visual Focus & Hierarchy",
                "observation": f"Dispersed visual attention pattern across multiple regions (Focus Index: {gini:.3f}).",
                "suggestion": "Establish one dominant primary visual anchor (e.g., prominent hero banner or heading) with stronger visual contrast.",
                "severity": "Medium"
            })
        elif gini > 0.65:
            prioritized_recs.append({
                "finding": f"Strongly concentrated visual focus in a single region (Focus Index: {gini:.3f}).",
                "why_it_matters": "A clear dominant element successfully captures initial attention; however, secondary items may risk being missed.",
                "suggested_improvement": "Ensure essential secondary information (key links, navigation, secondary CTAs) is placed near the dominant focal anchor.",
                "priority": "Low",
                "evidence": f"Focus concentration index ({gini:.3f}) exceeds concentrated threshold (0.60).",
                "aspect": "Focal Anchor Prominence",
                "observation": f"Strongly concentrated visual focus in a single region (Focus Index: {gini:.3f}).",
                "suggestion": "Ensure essential secondary information is placed near the dominant focal anchor.",
                "severity": "Low"
            })

        # 5. Vertical & Horizontal Visual Balance
        macro_top = reg.get("top_total", 50)
        macro_bottom = reg.get("bottom_total", 50)
        macro_left = reg.get("left_total", 50)
        
        if macro_top >= 65.0:
            prioritized_recs.append({
                "finding": f"Heavy upper-viewport visual concentration ({macro_top}% in top half).",
                "why_it_matters": "Header and hero elements dominate the initial gaze; lower content sections may experience lower scroll engagement.",
                "suggested_improvement": "Add visual directional cues or contrasting thumbnail cards below the fold to encourage downward scrolling.",
                "priority": "Medium",
                "evidence": f"Top half captures {macro_top}% of saliency compared to {cat_key} benchmark {ref_means.get('pct_top', 48.4)}%.",
                "aspect": "Vertical Visual Balance",
                "observation": f"Heavy upper-viewport visual concentration ({macro_top}% in top half).",
                "suggestion": "Add visual directional cues or contrasting thumbnail cards below the fold to encourage downward scrolling.",
                "severity": "Medium"
            })
        elif macro_bottom >= 60.0:
            prioritized_recs.append({
                "finding": f"Dominant lower-viewport visual concentration ({macro_bottom}% in lower half).",
                "why_it_matters": "Lower content cards pull gaze away before brand identity or primary navigation can be established.",
                "suggested_improvement": "Reinforce top-of-page visual anchor with clearer typography or higher logo contrast.",
                "priority": "Medium",
                "evidence": f"Bottom half captures {macro_bottom}% of saliency compared to {cat_key} benchmark {ref_means.get('pct_bottom', 51.6)}%.",
                "aspect": "Vertical Visual Balance",
                "observation": f"Dominant lower-viewport visual concentration ({macro_bottom}% in lower half).",
                "suggestion": "Reinforce top-of-page visual anchor with clearer typography or higher logo contrast.",
                "severity": "Medium"
            })
        elif macro_left >= 60.0:
            prioritized_recs.append({
                "finding": f"Left-skewed visual distribution ({macro_left}% left vs {100-macro_left}% right).",
                "why_it_matters": "Naturally supports Western reading flow, but actions placed on the far right may suffer reduced spontaneous engagement.",
                "suggested_improvement": "If primary conversion actions reside on the right, emphasize them with contrasting button fills.",
                "priority": "Medium",
                "evidence": f"Left-side visual weight is {macro_left}% vs {cat_key} average {ref_means.get('pct_left', 53.4)}%.",
                "aspect": "Horizontal Layout Flow",
                "observation": f"Left-skewed visual distribution ({macro_left}% left vs {100-macro_left}% right).",
                "suggestion": "If primary conversion actions reside on the right, emphasize them with contrasting button fills.",
                "severity": "Medium"
            })

        # 6. Overall Complexity Summary Recommendation
        if comp_score >= 60.0:
            prioritized_recs.append({
                "finding": f"High estimated Reading & Visual Effort (Score: {comp_score:.1f}/100).",
                "why_it_matters": "Visitors face high cognitive demand when attempting to process complex, densely packed interface layouts.",
                "suggested_improvement": "Target the primary complexity drivers above (e.g. text density or edge clutter) to simplify visual scan paths.",
                "priority": "High",
                "evidence": f"Random Forest Complexity Model rating of {comp_score:.1f} places this in the High Effort tier (>=60).",
                "aspect": "Overall Reading & Visual Effort",
                "observation": f"High estimated Reading & Visual Effort (Score: {comp_score:.1f}/100).",
                "suggestion": "Target the primary complexity drivers above to simplify visual scan paths.",
                "severity": "High"
            })
        elif comp_score < 30.0:
            prioritized_recs.append({
                "finding": f"Low estimated Reading & Visual Effort (Score: {comp_score:.1f}/100 - Clean & Spacious).",
                "why_it_matters": "Visitors can scan the interface quickly with minimal visual friction.",
                "suggested_improvement": "Ensure essential call-to-actions, value propositions, and navigation pathways remain unambiguous.",
                "priority": "Low",
                "evidence": f"Random Forest Complexity Model rating of {comp_score:.1f} places this in the Minimalist tier (<30).",
                "aspect": "Overall Reading & Visual Effort",
                "observation": f"Low estimated Reading & Visual Effort (Score: {comp_score:.1f}/100).",
                "suggestion": "Ensure essential call-to-actions and navigation pathways remain unambiguous.",
                "severity": "Low"
            })
        else:
            prioritized_recs.append({
                "finding": f"Moderate estimated Reading & Visual Effort (Score: {comp_score:.1f}/100 - Balanced Layout).",
                "why_it_matters": "Layout provides a standard commercial balance between information density and visual breathing room.",
                "suggested_improvement": "Focus on subtle micro-spacing and hierarchy refinements rather than major layout overhauls.",
                "priority": "Medium",
                "evidence": f"Random Forest Complexity Model rating of {comp_score:.1f} places this in the Moderate tier (30–60).",
                "aspect": "Overall Reading & Visual Effort",
                "observation": f"Moderate estimated Reading & Visual Effort (Score: {comp_score:.1f}/100 - Balanced Layout).",
                "suggestion": "Focus on subtle micro-spacing and hierarchy refinements rather than major layout overhauls.",
                "severity": "Medium"
            })

        # Structured final response contract
        response_data = {
            "analysis_id": unique_id,
            "category": cat_key,
            "image_info": {
                "filename": saved_path.name,
                "width": saliency_result["image_dimensions"]["width"],
                "height": saliency_result["image_dimensions"]["height"],
                "aspect_ratio": round(saliency_result["image_dimensions"]["width"] / float(saliency_result["image_dimensions"]["height"]), 3),
                "original_url": original_img_url
            },
            "visualizations": {
                "original_url": original_img_url,
                "saliency_map_url": map_url,
                "heatmap_url": heatmap_url,
                "overlay_url": overlay_url
            },
            "saliency": {
                "regional_percentages": saliency_result["regional_percentages"],
                "dominant_quadrant": saliency_result["dominant_quadrant"],
                "concentration_gini": saliency_result["saliency_concentration_gini"],
                "macro_top": saliency_result["regional_percentages"]["top_total"],
                "macro_bottom": saliency_result["regional_percentages"]["bottom_total"],
                "macro_left": saliency_result["regional_percentages"]["left_total"],
                "macro_right": saliency_result["regional_percentages"]["right_total"]
            },
            "ml_profile": saliency_result["kmeans_analysis"],
            "category_comparison": saliency_result["reference_comparison"],
            "complexity": complexity_result,
            "recommendations": prioritized_recs,
            "report_download_url": f"/api/reports/analysis/{unique_id}"
        }

        # Cache in memory for instant report downloads
        ANALYSIS_CACHE[unique_id] = {
            "data": response_data,
            "_original_path": str(saved_path),
            "_heatmap_path": str(OUTPUT_INFERENCE_DIR / f"{stem}_heatmap.png")
        }

        return response_data

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
