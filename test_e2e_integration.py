import os
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    res = requests.get(f"{BASE_URL}/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    data = res.json()
    print("Health check OK:", data["status"], "K-Means Model:", data.get("models_available"), "RF Model:", data.get("complexity_model_available"))

def test_reference():
    for cat in ["Education", "Product"]:
        res = requests.get(f"{BASE_URL}/api/reference/{cat}")
        assert res.status_code == 200, f"Reference check for {cat} failed: {res.text}"
        data = res.json()
        print(f"Reference for {cat}: Top left={data['means']['pct_top_left']}%, Gini={data['means']['saliency_concentration_gini']}, Count={data['sample_count']}")

def test_analyze_file(file_path, category="Education", label=""):
    print(f"\n--- Testing Analyze: {label} ({os.path.basename(file_path)}) ---")
    assert os.path.exists(file_path), f"File not found: {file_path}"
    
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "image/png")}
        data = {"category": category}
        res = requests.post(f"{BASE_URL}/api/analyze", files=files, data=data)
    
    assert res.status_code == 200, f"Analysis failed: {res.status_code} - {res.text}"
    resp = res.json()
    
    # Check Saliency Branch
    saliency = resp.get("saliency", {})
    print(f"Saliency Quadrants: TL={saliency.get('regional_percentages', {}).get('top_left')}%, TR={saliency.get('regional_percentages', {}).get('top_right')}%, BL={saliency.get('regional_percentages', {}).get('bottom_left')}%, BR={saliency.get('regional_percentages', {}).get('bottom_right')}%")
    print(f"Macro: Left={saliency.get('macro_left')}%, Top={saliency.get('macro_top')}%")
    
    # Check K-Means ML Profile
    ml = resp.get("ml_profile", {})
    print(f"K-Means Archetype: Cluster {ml.get('cluster_id')} - '{ml.get('profile_name')}' (Dist={ml.get('distance_to_cluster_centroid')})")
    
    # Check Cognitive / Complexity Branch (Random Forest Regressor)
    comp = resp.get("complexity", {})
    print(f"Complexity Score: {comp.get('complexity_score')}/100, Level: {comp.get('complexity_level')}")
    print(f"RF Model Info: {comp.get('model_info', {}).get('model_type')} (Trees={comp.get('model_info', {}).get('n_estimators')}, Depth={comp.get('model_info', {}).get('max_depth')}, R2={comp.get('model_info', {}).get('cv_r2')})")
    print(f"Physical Metrics: Edges={comp.get('metrics', {}).get('edge_density_pct')}%, Whitespace={comp.get('metrics', {}).get('whitespace_pct')}%, Text={comp.get('metrics', {}).get('text_density_pct')}%, Words={comp.get('metrics', {}).get('word_count')}")
    
    # Check Recommendations
    recs = resp.get("recommendations", [])
    print(f"Recommendations Generated: {len(recs)}")
    for r in recs:
        print(f"  [{r.get('severity')}] {r.get('aspect')}: {r.get('suggestion')[:70]}...")
        
    return resp

def test_error_handling():
    print("\n--- Testing Error Handling for Invalid Upload ---")
    files = {"file": ("fake.txt", b"not an image content", "text/plain")}
    res = requests.post(f"{BASE_URL}/api/analyze", files=files, data={"category": "Education"})
    print(f"Response status: {res.status_code}")
    assert res.status_code == 400 or res.status_code == 422, f"Expected 400/422 but got {res.status_code}"
    print("Invalid file handled successfully with error:", res.json())

if __name__ == "__main__":
    test_health()
    test_reference()
    
    # 1. Educational screenshot
    edu_img = "images/eduDataset/eduDataset/Screenshot 2026-10-12 181428.png"
    if not os.path.exists(edu_img):
        # find any edu image
        import glob
        edu_imgs = glob.glob("images/eduDataset/**/*.png", recursive=True)
        edu_img = edu_imgs[0]
    test_analyze_file(edu_img, category="Education", label="Educational Dataset Site")
    
    # 2. Product screenshot
    prod_img = "images/ProductDataset/Screenshot 2026-10-12 203644.png"
    test_analyze_file(prod_img, category="Product", label="Product Dataset Site")
    
    # 3. Unseen screenshot (Flipkart screenshot from browser session)
    flipkart_img = "static/uploads/flipkart_unseen.png"
    if os.path.exists(flipkart_img):
        test_analyze_file(flipkart_img, category="Product", label="Unseen Flipkart Live Capture")
    else:
        # Use another distinct image
        import glob
        imgs = glob.glob("images/ProductDataset/*.png")
        if len(imgs) > 1:
            test_analyze_file(imgs[-1], category="Product", label="Unseen Alternative Screenshot")
            
    # 4. Error Handling
    test_error_handling()
    print("\n>>> ALL BACKEND E2E TESTS PASSED SUCCESSFULLY! <<<")
