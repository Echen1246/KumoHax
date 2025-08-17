# KumoHax - Adverse Event Prediction Platform

A hackathon project for **post-clinical trial adverse event prediction** using Kumo RFM (Real-time Feature Modeling). Predicts hospital admission risk based on patient profiles including demographics, medications, comorbidities, and lab results.

## 🏗️ **Architecture**

```
Frontend (React)  →  Python Backend (FastAPI)  →  Kumo RFM API
     ↓                        ↓                      ↓
  Dashboard UI         Web API + Kumo SDK        Cloud ML Platform
  - Charts/Alerts     - CSV Processing           - Risk Predictions  
  - Patient Lists     - Real Predictions         - Model Training
  - Group Selection   - Authentication           - Data Processing
```

### **Key Features**
- 📊 **Real-time Dashboard**: Live adverse event monitoring with charts and alerts
- 👥 **Patient Groups**: Track different drug cohorts (Metformin, Warfarin, etc.)
- 📁 **CSV Upload**: Bulk patient data processing 
- 🤖 **Kumo Integration**: Direct Python SDK for advanced ML predictions
- ⚡ **Live Updates**: Real-time risk score updates and alerts

---

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
# Python backend
cd backend-python
pyenv global 3.11.8  # or your Python version
pip install -r requirements.txt

# Frontend
cd frontend  
npm install
```

### **2. Configure Environment**
```bash
# backend-python/.env
KUMORFM_API_KEY=your_kumo_api_key_here
KUMORFM_BASE_URL=https://api.kumo.ai
PORT=8000

# frontend/.env
VITE_DEV_PROXY_TARGET=http://localhost:8000
```

### **3. Start Services**
```bash
# Terminal 1: Python Backend
cd backend-python
python main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### **4. Access Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (FastAPI auto-generated)

---

## 📊 **How It Works**

### **1. Upload Patient Data**
Upload CSV files with patient information:
```csv
patient_id,age,sex,medications,comorbidities,study_group
P-001,65,M,"metformin,lisinopril","diabetes,hypertension",metformin-study
P-002,45,F,"warfarin","atrial_fibrillation",warfarin-study
```

### **2. Kumo Risk Prediction**  
Python backend processes data and calls Kumo:
```python
# Kumo SDK integration
import kumoai
client = kumoai.KumoClient(url="https://api.kumo.ai", api_key=api_key)

# Risk prediction (TODO: implement with your trained model)
prediction = client.predict(
    model_name="adverse_event_model",
    entity_id=patient.patient_id,
    features={...}
)
```

### **3. Dashboard Visualization**
Frontend displays:
- **Patient risk scores** with color-coded severity
- **Group comparisons** (different drug studies)  
- **Trend charts** showing risk over time
- **Real-time alerts** for high-risk patients

---

## 🔗 **API Endpoints**

### **Frontend Integration**
```
GET  /api/dashboard/metrics      # Overview stats
GET  /api/dashboard/risk-trends  # Chart data  
GET  /api/patients?group=...     # Patient lists
GET  /api/alerts/recent          # Recent alerts
```

### **Kumo Integration**
```
POST /predict/patient-risk       # Single prediction
POST /predict/batch             # Batch predictions
POST /upload/csv                # CSV processing
GET  /model/status              # Kumo connection
```

---

## 📁 **Project Structure**

```
KumoHax/
├── frontend/              # React + TypeScript
│   ├── src/components/   # Charts, tables, UI
│   ├── src/pages/        # Dashboard, Patients
│   └── src/lib/          # API client
│
├── backend-python/        # FastAPI Backend  
│   ├── main.py           # Kumo integration
│   ├── requirements.txt  # Dependencies
│   └── .env             # Configuration
│
└── docs/                 # Documentation
```

---

## 🎯 **Next Steps**

1. **Train Kumo Model**: Upload your medical dataset to Kumo platform
2. **Configure Predictions**: Replace TODO comments with actual Kumo API calls  
3. **Add Authentication**: Implement login/user management
4. **Deploy Production**: Use Railway, Heroku, or similar
5. **Add Monitoring**: Set up alerts and performance tracking

---

## 🔐 **Security & Compliance**

- **API Keys**: Environment variables only, never in code
- **Data Privacy**: Patient data processed in-memory, not persisted
- **CORS**: Properly configured for production
- **HTTPS**: Use secure connections in production

---

## 🤝 **Contributing**

This is a hackathon project! Feel free to:
- Add new patient risk factors
- Improve the ML model integration  
- Enhance the dashboard UI
- Add more visualization types

---

## 📚 **Resources**

- **Kumo Docs**: https://docs.kumo.ai/
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/

Built with ❤️ for healthcare innovation! 