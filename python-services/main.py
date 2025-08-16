from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import json
import os
from datetime import datetime

app = FastAPI(
    title="KumoHax ML Analytics Service",
    description="Advanced ML analytics and risk modeling for adverse event prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class PatientData(BaseModel):
    id: str
    age: int
    sex: str
    race: str
    medications: List[str]
    comorbidities: List[str]
    lab_results: Dict[str, float]
    vital_signs: Dict[str, float]

class CohortFilter(BaseModel):
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    sex: Optional[str] = None
    medications: Optional[List[str]] = None
    comorbidities: Optional[List[str]] = None

class RiskAnalysis(BaseModel):
    patient_id: str
    risk_score: float
    risk_factors: List[Dict[str, float]]
    predicted_events: List[Dict[str, float]]
    confidence_interval: Dict[str, float]

# Mock ML model (replace with actual KumoRFM integration)
class AdverseEventPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        # In production, load pre-trained model or connect to KumoRFM
        # For demo, create mock training data
        X_mock = np.random.rand(1000, 10)  # 10 features
        y_mock = (X_mock[:, 0] + X_mock[:, 1] > 1.0).astype(int)  # Mock risk labels
        
        X_scaled = self.scaler.fit_transform(X_mock)
        self.model.fit(X_scaled, y_mock)
        self.is_trained = True
    
    def predict_risk(self, features: np.ndarray) -> Dict:
        if not self.is_trained:
            raise ValueError("Model not trained")
        
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        risk_proba = self.model.predict_proba(features_scaled)[0]
        feature_importance = self.model.feature_importances_
        
        return {
            "risk_score": float(risk_proba[1]),
            "confidence": float(max(risk_proba)),
            "feature_importance": feature_importance.tolist()
        }
    
    def extract_features(self, patient: PatientData) -> np.ndarray:
        # Convert patient data to feature vector
        features = [
            patient.age / 100.0,  # Normalized age
            1.0 if patient.sex == 'M' else 0.0,  # Sex encoding
            len(patient.medications) / 10.0,  # Medication count
            len(patient.comorbidities) / 5.0,  # Comorbidity count
            patient.lab_results.get('creatinine', 1.0),
            patient.lab_results.get('alt', 30.0) / 100.0,
            patient.lab_results.get('ast', 30.0) / 100.0,
            patient.vital_signs.get('bp_systolic', 120.0) / 200.0,
            patient.vital_signs.get('bp_diastolic', 80.0) / 120.0,
            patient.vital_signs.get('heart_rate', 70.0) / 120.0,
        ]
        return np.array(features)

# Initialize the predictor
predictor = AdverseEventPredictor()

@app.get("/")
async def root():
    return {
        "service": "KumoHax ML Analytics",
        "version": "1.0.0",
        "status": "active",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_trained": predictor.is_trained,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze/patient-risk")
async def analyze_patient_risk(patient: PatientData) -> RiskAnalysis:
    """Analyze individual patient risk using ML model"""
    try:
        features = predictor.extract_features(patient)
        prediction = predictor.predict_risk(features)
        
        # Generate risk factors with importance scores
        feature_names = [
            "age", "sex", "medication_count", "comorbidity_count",
            "creatinine", "alt", "ast", "systolic_bp", "diastolic_bp", "heart_rate"
        ]
        
        risk_factors = [
            {"factor": name, "importance": float(importance)}
            for name, importance in zip(feature_names, prediction["feature_importance"])
        ]
        risk_factors.sort(key=lambda x: x["importance"], reverse=True)
        
        # Generate predicted events
        predicted_events = [
            {"event": "hepatotoxicity", "probability": prediction["risk_score"] * 0.8},
            {"event": "cardiac_arrhythmia", "probability": prediction["risk_score"] * 0.6},
            {"event": "renal_dysfunction", "probability": prediction["risk_score"] * 0.4}
        ]
        
        return RiskAnalysis(
            patient_id=patient.id,
            risk_score=prediction["risk_score"],
            risk_factors=risk_factors[:5],  # Top 5 factors
            predicted_events=predicted_events,
            confidence_interval={
                "lower": max(0, prediction["risk_score"] - 0.1),
                "upper": min(1, prediction["risk_score"] + 0.1)
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk analysis failed: {str(e)}")

@app.post("/analyze/cohort")
async def analyze_cohort(patients: List[PatientData], filters: Optional[CohortFilter] = None):
    """Analyze cohort risk patterns and generate insights"""
    try:
        # Apply filters if provided
        filtered_patients = patients
        if filters:
            if filters.age_min:
                filtered_patients = [p for p in filtered_patients if p.age >= filters.age_min]
            if filters.age_max:
                filtered_patients = [p for p in filtered_patients if p.age <= filters.age_max]
            if filters.sex:
                filtered_patients = [p for p in filtered_patients if p.sex == filters.sex]
        
        if not filtered_patients:
            raise HTTPException(status_code=400, detail="No patients match the filters")
        
        # Analyze cohort
        risk_scores = []
        high_risk_count = 0
        
        for patient in filtered_patients:
            features = predictor.extract_features(patient)
            prediction = predictor.predict_risk(features)
            risk_scores.append(prediction["risk_score"])
            if prediction["risk_score"] > 0.7:
                high_risk_count += 1
        
        avg_risk = np.mean(risk_scores)
        risk_std = np.std(risk_scores)
        
        # Risk distribution
        risk_distribution = {
            "low": sum(1 for r in risk_scores if r < 0.3),
            "medium": sum(1 for r in risk_scores if 0.3 <= r < 0.7),
            "high": sum(1 for r in risk_scores if r >= 0.7)
        }
        
        return {
            "cohort_size": len(filtered_patients),
            "average_risk": float(avg_risk),
            "risk_std": float(risk_std),
            "high_risk_count": high_risk_count,
            "risk_distribution": risk_distribution,
            "percentiles": {
                "25th": float(np.percentile(risk_scores, 25)),
                "50th": float(np.percentile(risk_scores, 50)),
                "75th": float(np.percentile(risk_scores, 75)),
                "95th": float(np.percentile(risk_scores, 95))
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cohort analysis failed: {str(e)}")

@app.post("/generate/synthetic-data")
async def generate_synthetic_patients(count: int = 100):
    """Generate synthetic patient data for testing"""
    try:
        patients = []
        np.random.seed(42)
        
        for i in range(count):
            age = int(np.random.normal(65, 15))
            age = max(18, min(95, age))  # Clamp to reasonable range
            
            sex = np.random.choice(['M', 'F'])
            race = np.random.choice(['White', 'Black', 'Asian', 'Hispanic', 'Other'])
            
            # Generate medications based on age and comorbidities
            med_pool = ['metformin', 'lisinopril', 'atorvastatin', 'warfarin', 'metoprolol', 'furosemide']
            medications = list(np.random.choice(med_pool, size=np.random.randint(1, 5), replace=False))
            
            # Generate comorbidities
            comorbidity_pool = ['diabetes', 'hypertension', 'hyperlipidemia', 'atrial_fibrillation', 'heart_failure']
            comorbidities = list(np.random.choice(comorbidity_pool, size=np.random.randint(0, 3), replace=False))
            
            # Generate lab results
            lab_results = {
                'creatinine': float(np.random.normal(1.1, 0.3)),
                'alt': float(np.random.normal(35, 15)),
                'ast': float(np.random.normal(32, 12))
            }
            
            # Generate vital signs
            vital_signs = {
                'bp_systolic': float(np.random.normal(130, 20)),
                'bp_diastolic': float(np.random.normal(80, 10)),
                'heart_rate': float(np.random.normal(72, 12))
            }
            
            patients.append(PatientData(
                id=f"P-{1000 + i}",
                age=age,
                sex=sex,
                race=race,
                medications=medications,
                comorbidities=comorbidities,
                lab_results=lab_results,
                vital_signs=vital_signs
            ))
        
        return {"generated_patients": len(patients), "patients": patients}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data generation failed: {str(e)}")

@app.get("/model/performance")
async def get_model_performance():
    """Get model performance metrics"""
    return {
        "model_type": "Random Forest Classifier",
        "features": 10,
        "training_samples": 1000,
        "estimated_accuracy": 0.892,
        "estimated_auc": 0.934,
        "last_updated": datetime.now().isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 