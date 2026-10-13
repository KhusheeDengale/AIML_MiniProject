import os
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    res = requests.get(f"{BASE_URL}/api/health")
    assert res.status_code == 200, f"Health failed: {res.text}"
    d = res.json()
    print("[PASS] Health Check:", d["status"], "| ML Insights:", d.get("ml_insights_available"))

def test_reference_and_guidance_reports():
    for cat in ["Education", "Product"]:
        # 1. Reference Data with Complexity Benchmarks
        res = requests.get(f"{BASE_URL}/api/reference/{cat}")
        assert res.status_code == 200, f"Reference {cat} failed: {res.text}"
        d = res.json()
        assert "complexity_benchmarks" in d, "complexity_benchmarks missing from reference response"
        bench = d["complexity_benchmarks"]
        print(f"[PASS] Reference {cat}: Saliency Top={d['means']['pct_top']}%, Left={d['means']['pct_left']}%, Complexity Score Mean={bench['complexity_score']['mean']}")
        
        # 2. Guidance PDF Report
        pdf_res = requests.get(f"{BASE_URL}/api/reports/guidance/{cat}")
        assert pdf_res.status_code == 200, f"Guidance report {cat} failed"
        assert pdf_res.headers.get("content-type") == "application/pdf", "Expected application/pdf"
        assert pdf_res.content.startswith(b"%PDF"), "Content does not have valid PDF magic bytes"
        print(f"[PASS] Guidance PDF Report {cat}: Size={len(pdf_res.content)} bytes, Valid %PDF header verified.")

def test_ml_insights():
    res = requests.get(f"{BASE_URL}/api/ml-insights")
    assert res.status_code == 200, f"ML Insights failed: {res.text}"
    d = res.json()
    assert "model_comparison" in d, "model_comparison missing"
    assert "kmeans_analysis" in d, "kmeans_analysis missing"
    assert "feature_correlations" in d, "feature_correlations missing"
    assert "methodology_matrix" in d, "methodology_matrix missing"
    print(f"[PASS] ML Insights API: {len(d['model_comparison'])} models compared | K-Means Silhouette={d['kmeans_analysis']['silhouette_score']} | Correlations={len(d['feature_correlations'])} features")

def test_analysis_and_analysis_pdf(file_path, category):
    print(f"\n--- Testing Analysis: {os.path.basename(file_path)} ({category}) ---")
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "image/png")}
        data = {"category": category}
        res = requests.post(f"{BASE_URL}/api/analyze", files=files, data=data)
    
    assert res.status_code == 200, f"Analysis failed: {res.status_code} - {res.text}"
    d = res.json()
    
    # Verify Visual Attention Branch
    saliency = d["saliency"]
    print(f"  [Saliency] Macro Top={saliency['macro_top']}%, Left={saliency['macro_left']}%, Dominant={saliency['dominant_quadrant']}, Gini={saliency['concentration_gini']}")
    print(f"  [Archetype Pattern] {d['ml_profile']['profile_name']}")
    
    # Verify Reading & Visual Effort (Complexity) Branch
    comp = d["complexity"]
    metrics = comp["metrics"]
    print(f"  [Reading Effort] {comp['complexity_level']} ({comp['complexity_score']}/100) | Text={metrics['text_density_pct']}% (~{metrics['word_count']} words) | Whitespace={metrics['whitespace_pct']}% | Edges={metrics['edge_density_pct']}%")
    
    # Verify 5-part Prioritized Recommendations
    recs = d["recommendations"]
    assert len(recs) > 0, "No recommendations returned"
    print(f"  [Recommendations] {len(recs)} prioritized recommendations generated:")
    for r in recs:
        assert "finding" in r, "Recommendation missing 'finding'"
        assert "why_it_matters" in r, "Recommendation missing 'why_it_matters'"
        assert "suggested_improvement" in r, "Recommendation missing 'suggested_improvement'"
        assert "priority" in r, "Recommendation missing 'priority'"
        assert "evidence" in r, "Recommendation missing 'evidence'"
        print(f"    * [{r['priority'].upper()} PRIORITY] {r.get('aspect')}: {r['finding'][:60]}...")
        
    # Verify PDF Report Generation & Download
    rep_url = f"{BASE_URL}{d['report_download_url']}"
    pdf_res = requests.get(rep_url)
    assert pdf_res.status_code == 200, f"Analysis PDF report failed: {pdf_res.status_code}"
    assert pdf_res.headers.get("content-type") == "application/pdf", "Expected application/pdf"
    assert pdf_res.content.startswith(b"%PDF"), "Analysis report missing valid %PDF magic bytes"
    print(f"  [PDF Report] Successfully downloaded: {len(pdf_res.content)} bytes, Valid %PDF verified.")

def test_invalid_upload():
    print("\n--- Testing Error Handling for Invalid Image ---")
    files = {"file": ("corrupt.txt", b"plain text content not an image", "text/plain")}
    res = requests.post(f"{BASE_URL}/api/analyze", files=files, data={"category": "Education"})
    assert res.status_code == 400, f"Expected status 400 for invalid image, got {res.status_code}"
    print(f"[PASS] Correctly rejected invalid upload with HTTP 400: {res.json()['detail']}")

if __name__ == "__main__":
    test_health()
    test_reference_and_guidance_reports()
    test_ml_insights()
    
    # Test Educational
    test_analysis_and_analysis_pdf(
        "images/eduDataset/eduDataset/Screenshot 2026-10-12 181428.png",
        "Education"
    )
    
    # Test Product
    test_analysis_and_analysis_pdf(
        "images/ProductDataset/Screenshot 2026-10-12 203644.png",
        "Product"
    )
    
    # Test Unseen screenshot
    test_analysis_and_analysis_pdf(
        "images/ProductDataset/Screenshot 2026-10-12 223428.png",
        "Product"
    )
    
    # Test Error Handling
    test_invalid_upload()
    
    print("\n=======================================================")
    print(">>> ALL COMPREHENSIVE BACKEND & PDF TESTS PASSED! <<<")
    print("=======================================================")
