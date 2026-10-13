<p align="center">
  <img src="assets/banner.jpg" alt="UI Insight Banner" width="100%"/>
</p>

<h1 align="center">UI Insight</h1>
<h3 align="center">Visual Attention Prediction & Cognitive Demand Analysis<br/>for Educational and Product Websites</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV"/>
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="scikit-learn"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Model_R²-0.9411-00C851?style=flat-square" alt="R2 Score"/>
  <img src="https://img.shields.io/badge/Dataset-105_Screenshots-6366F1?style=flat-square" alt="Dataset"/>
  <img src="https://img.shields.io/badge/Categories-Education_&_Product-0EA5E9?style=flat-square" alt="Categories"/>
  <img src="https://img.shields.io/badge/License-Academic-E11D48?style=flat-square" alt="License"/>
</p>

---

## 📋 Overview

**UI Insight** is a full-stack AI/ML web application that provides automated, evidence-based website design analysis by combining computer vision, unsupervised clustering, and supervised regression within a unified analysis pipeline.

Users can either **explore category-specific design benchmarks** or **upload a website screenshot** to receive:
- 🔥 **Visual attention heatmaps** predicting where users look first
- 🧠 **Cognitive complexity scoring** estimating reading & visual effort
- 📊 **Layout archetype classification** identifying structural patterns
- 💡 **Prioritised design recommendations** backed by measurable evidence
- 📄 **Downloadable PDF reports** for professional documentation

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Spectral Residual Saliency** | OpenCV-based bottom-up visual attention prediction — generates heatmaps, saliency maps, and overlays |
| **K-Means Layout Classification** | Unsupervised clustering (k=3) identifies layout archetypes: Balanced, Top-Left Focal, Bottom-Left Focal |
| **Random Forest Complexity** | Supervised regression (R²=0.9411) predicts visual complexity from 8 physical features |
| **Category Benchmarking** | Compare against empirically derived benchmarks for Educational and Product websites |
| **Evidence-Based Recommendations** | Multi-criteria rule engine generating prioritised, metric-backed design suggestions |
| **PDF Report Generation** | Professional multi-page reports with embedded images, tables, and recommendations |
| **Academic ML Workspace** | Model comparison, feature importances, cluster profiles, and evaluation metrics |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                        │
│  ┌──────────┐  ┌───────────────┐  ┌───────────┐  ┌──────────┐ │
│  │ Overview  │  │Design Guidance│  │ Website   │  │  Model   │ │
│  │  (Hero)   │  │ (Workflow A)  │  │ Analysis  │  │ Insights │ │
│  │          │  │              │  │(Workflow B)│  │          │ │
│  └──────────┘  └───────────────┘  └─────┬─────┘  └──────────┘ │
└─────────────────────────────────────────┼───────────────────────┘
                                          │ HTTP/REST
┌─────────────────────────────────────────┼───────────────────────┐
│                 FastAPI Backend Server   │                       │
│                                         ▼                       │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  Branch A: Saliency  │  │ Branch B: Complexity  │            │
│  │  ┌────────────────┐  │  │  ┌────────────────┐  │            │
│  │  │ OpenCV Spectral│  │  │  │ 8-Feature      │  │            │
│  │  │ Residual       │  │  │  │ Extraction     │  │            │
│  │  └───────┬────────┘  │  │  └───────┬────────┘  │            │
│  │  ┌───────▼────────┐  │  │  ┌───────▼────────┐  │            │
│  │  │ 2×2 Regional   │  │  │  │ Random Forest  │  │            │
│  │  │ Features + Gini│  │  │  │ Regressor      │  │            │
│  │  └───────┬────────┘  │  │  └───────┬────────┘  │            │
│  │  ┌───────▼────────┐  │  │  ┌───────▼────────┐  │            │
│  │  │ K-Means Layout │  │  │  │ Qualitative    │  │            │
│  │  │ Classification │  │  │  │ Categorisation │  │            │
│  │  └───────┬────────┘  │  │  └───────┬────────┘  │            │
│  └──────────┼───────────┘  └──────────┼───────────┘            │
│             └──────────┬──────────────┘                        │
│                ┌───────▼────────┐                               │
│                │ Recommendation │                               │
│                │ Engine         │                               │
│                └───────┬────────┘                               │
│                ┌───────▼────────┐                               │
│                │ PDF Report     │                               │
│                │ Generator      │                               │
│                └────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, Lucide Icons |
| **Backend** | FastAPI, Uvicorn (ASGI) |
| **Computer Vision** | OpenCV (Spectral Residual Saliency, Canny Edge, Morphological Ops) |
| **Machine Learning** | scikit-learn (K-Means, Random Forest), NumPy, Pandas |
| **PDF Reports** | ReportLab (Platypus flowables, NumberedCanvas) |
| **Model Persistence** | joblib |
| **Language** | Python 3.x, JavaScript ES2024+ |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- pip & npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/UI-Insight.git
cd UI-Insight

# 2. Install Python dependencies
pip install fastapi uvicorn opencv-contrib-python scikit-learn pandas numpy joblib pillow reportlab

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

### Running the Application

```bash
# Terminal 1 — Start the backend
python -m uvicorn server:app --host 127.0.0.1 --port 8000

# Terminal 2 — Start the frontend
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Training Models (Optional)

If you want to retrain models from scratch with the dataset:

```bash
# Step 1: Generate saliency maps for all screenshots
python saliency_opencv.py

# Step 2: Extract 2×2 regional saliency features
python extract_regional_features.py

# Step 3: Train K-Means layout classifier
python train_kmeans_saliency.py

# Step 4: Train Random Forest complexity model
python train_complexity_rf.py

# Step 5: Compute category reference benchmarks
python compute_reference_stats.py

# Step 6: Generate ML insights data
python generate_ml_insights_data.py
```

---

## 📁 Project Structure

```
UI-Insight/
│
├── server.py                        # FastAPI backend (REST API + recommendation engine)
├── saliency_opencv.py               # Batch OpenCV saliency map generation
├── extract_regional_features.py     # 2×2 quadrant feature extraction + Gini
├── train_kmeans_saliency.py         # K-Means clustering training (k=2–5 evaluation)
├── train_complexity_rf.py           # Random Forest regression training pipeline
├── complexity_analysis.py           # Runtime complexity inference module
├── infer_saliency.py                # End-to-end saliency inference pipeline
├── report_generator.py              # PDF report generation (ReportLab)
├── compute_reference_stats.py       # Category benchmark computation
├── generate_ml_insights_data.py     # ML insights data generation
│
├── frontend/                        # React SPA
│   ├── src/
│   │   ├── App.jsx                  # Main app + routing
│   │   └── components/
│   │       ├── HeroOverview.jsx     # Landing page
│   │       ├── DesignGuidance.jsx   # Workflow A — Category benchmarks
│   │       ├── WebsiteAnalysis.jsx  # Workflow B — Screenshot analysis
│   │       ├── ModelInsights.jsx    # Academic ML workspace
│   │       └── Navbar.jsx           # Navigation
│   └── package.json
│
├── models/                          # Trained ML model artifacts
│   ├── kmeans_saliency_model.joblib
│   ├── random_forest_complexity_model.joblib
│   ├── saliency_cluster_profiles.json
│   └── complexity_model_metadata.json
│
├── data/                            # Processed datasets & benchmarks
│   ├── website_complexity_dataset.csv
│   ├── saliency_regional_features.csv
│   ├── saliency_clustered_dataset.csv
│   ├── category_reference_stats.json
│   └── ml_insights_data.json
│
├── cognitive (1).ipynb              # Teammate's completed cognitive analysis notebook
├── assets/                          # Static assets (banner, etc.)
├── .gitignore
└── README.md
```

---

## 📊 Model Performance

| Model | Task | Key Metric | Score |
|---|---|---|---|
| **Random Forest Regressor** | Complexity Prediction | R² | **0.9411** |
| **Random Forest Regressor** | Complexity Prediction | MAE | **2.07** |
| **Random Forest Regressor** | Complexity Prediction | RMSE | **2.82** |
| **K-Means (k=3)** | Layout Classification | Silhouette Score | **0.2716** |

### Top Feature Importances (Random Forest)

| Feature | Importance |
|---|---|
| `text_density` | 33.7% |
| `edge_density` | 29.5% |
| `text_block_density` | 17.5% |
| `whitespace_ratio` | 6.0% |
| `word_count` | 6.0% |

### Discovered Layout Archetypes (K-Means)

| Cluster | Profile | Samples |
|---|---|---|
| 0 | Balanced / Distributed Layout (Multi-Focal) | 49 (46.7%) |
| 1 | Top-Left Focal (Header & Branding Dominant) | 32 (30.5%) |
| 2 | Bottom-Left Focal (Content Grid Dominant) | 24 (22.9%) |

---

## 📸 Application Workflows

### Workflow A — New Website Design Guidance
Select a website category (Education or Product) to receive aggregate saliency benchmarks, complexity targets, design guidelines, and downloadable blueprint PDFs.

### Workflow B — Existing Website Analysis
Upload a screenshot or select a sample to receive a complete dual-branch analysis: saliency heatmaps, layout classification, complexity scoring, prioritised recommendations, and a downloadable PDF report.

---

## 🎓 Academic Context

This project was developed as an **AI/ML Mini Project** for the academic year 2026–27. It demonstrates the integration of computer vision, unsupervised learning, supervised regression, and full-stack web development to solve a real-world problem in website design evaluation.

### Key Algorithms
- **OpenCV Spectral Residual** (Hou & Zhang, 2007) — Bottom-up visual saliency
- **K-Means Clustering** (scikit-learn) — Unsupervised layout archetype discovery
- **Random Forest Regressor** (scikit-learn) — Supervised complexity prediction
- **Rule-Based Recommendation Engine** — Evidence-based design suggestions

---

## 📝 References

1. X. Hou and L. Zhang, "Saliency Detection: A Spectral Residual Approach," *CVPR*, 2007.
2. M. Kümmerer et al., "DeepGaze II," *arXiv:1610.01563*, 2017.
3. S. Miniukovich and A. De Angeli, "Computation of Interface Aesthetics," *ACM CHI*, 2015.
4. K. Reinecke et al., "Predicting Users' First Impressions of Website Aesthetics," *ACM CHI*, 2013.
5. F. Pedregosa et al., "Scikit-learn: Machine Learning in Python," *JMLR*, 2011.

---

<p align="center">
  <b>Built with ❤️ using Python, React, OpenCV & scikit-learn</b>
</p>
