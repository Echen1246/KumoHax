# KumoHax Data Flow Guide

## 🏗️ **Simplified Architecture**

```
Frontend (React)  →  Python Backend (FastAPI)  →  Kumo RFM API
     ↓                        ↓                      ↓
  Dashboard UI         Web API + Kumo SDK        Cloud ML Platform
  - Charts/Alerts     - CSV Processing           - Risk Predictions  
  - Patient Lists     - Real Predictions         - Model Training
  - Group Selection   - Authentication           - Data Processing
```

### **Why This Architecture?**

1. **Frontend (React)**: Modern, responsive dashboard for adverse event monitoring
2. **Python Backend (FastAPI)**: Single backend handling both web API and Kumo integration
3. **Kumo Integration**: Direct Python SDK integration (`import kumoai`)

### **Key Benefits**
- ✅ **Simplified**: Single backend service instead of microservices
- ✅ **Native Kumo**: Direct Python SDK access for maximum features
- ✅ **Fast Development**: FastAPI auto-generates API docs and validation
- ✅ **Type Safety**: Pydantic models ensure data consistency

---

## 📊 **Complete Data Flow: CSV → Kumo → Frontend**

### **Step 1: CSV Upload**
```python
# Frontend uploads CSV to Python backend
POST /upload/csv
Content-Type: multipart/form-data

# Python processes CSV into PatientData objects
```

### **Step 2: Kumo Risk Prediction**
```python
# Python backend calls Kumo SDK
import kumoai
client = kumoai.Client(api_key="your_key")

# TODO: Replace with actual Kumo prediction
# prediction = client.predict(
#     model_name="adverse_event_model",
#     entity_id=patient.patient_id,
#     features={
#         "age": patient.age,
#         "medications": patient.medications,
#         "comorbidities": patient.comorbidities
#     }
# )
```

### **Step 3: Frontend Display**
```javascript
// Frontend fetches processed data
const response = await apiClient.get('/api/patients')
const patients = response.data.map(patient => ({
  ...patient,
  riskScore: patient.riskScore,
  predictedEvents: patient.predictedEvents
}))
```

---

## 📁 **Updated Project Structure**

```
KumoHax/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # UI components (charts, tables, etc.)
│   │   ├── pages/        # Dashboard, Patients, etc.
│   │   └── lib/          # API client, utilities
│   └── package.json      # React dependencies
│
├── backend-python/        # Python FastAPI Backend
│   ├── main.py           # FastAPI app with Kumo integration
│   ├── requirements.txt  # Python dependencies (kumoai, fastapi, etc.)
│   └── .env             # Kumo API key, configuration
│
├── docs/                 # Documentation
└── README.md
```

---

## 🔗 **API Endpoints**

### **Frontend Endpoints (served by Python backend)**
```
GET  /api/dashboard/metrics      # Dashboard overview stats
GET  /api/dashboard/risk-trends  # Chart data for risk trends
GET  /api/dashboard/risk-distribution # Risk distribution chart
GET  /api/alerts/recent         # Recent high-priority alerts
GET  /api/patients?group=...    # Patient list with filtering
```

### **Kumo Integration Endpoints**
```
POST /predict/patient-risk      # Single patient risk prediction
POST /predict/batch            # Batch patient predictions  
POST /upload/csv               # CSV upload and processing
GET  /model/status             # Kumo connection status
```

---

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
# Python backend
cd backend-python
pip install -r requirements.txt

# Frontend
cd frontend  
npm install
```

### **2. Configure Environment**
```bash
# backend-python/.env
KUMORFM_API_KEY=your_kumo_api_key_here
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
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📋 **CSV Data Format**

```csv
patient_id,age,sex,race,medications,comorbidities,study_group,lab_creatinine,vital_bp_systolic
P-001,65,M,White,"metformin,lisinopril","diabetes,hypertension",metformin-study,1.2,140
P-002,45,F,Hispanic,"warfarin,atorvastatin","atrial_fibrillation",warfarin-study,0.9,120
```

**Required Fields:**
- `patient_id`: Unique identifier
- `age`: Patient age  
- `sex`: M/F
- `medications`: Comma-separated drug list
- `comorbidities`: Comma-separated condition list

**Optional Fields:**
- `race`, `study_group`: Demographics and grouping
- `lab_*`: Lab results (e.g., lab_creatinine, lab_alt)
- `vital_*`: Vital signs (e.g., vital_bp_systolic)

---

## 🔐 **Security & Compliance**

- **API Keys**: Stored in environment variables, never in code
- **CORS**: Configured for development and production
- **Data Privacy**: Patient data processed in-memory, not stored
- **Kumo Integration**: Encrypted communication with Kumo platform

---

## 🎯 **Next Steps**

1. **Train Kumo Model**: Upload your medical dataset to Kumo platform
2. **Configure Predictions**: Replace TODO comments with actual Kumo API calls
3. **Deploy**: Use Railway, Heroku, or similar for production deployment
4. **Monitor**: Set up alerts and monitoring for production usage

For questions about Kumo setup, refer to: https://docs.kumo.ai/ 