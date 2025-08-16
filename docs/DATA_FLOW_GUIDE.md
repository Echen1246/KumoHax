# Complete Data Flow Guide: CSV → Kumo → Frontend

## 🏗️ **Simplified Architecture** 

After your feedback, here's the **corrected structure**:

```
KumoHax/
├── frontend/        # React dashboard (charts, groups, alerts)
├── backend/         # Node.js API (CSV processing + Kumo integration)
├── middleware/      # Optional proxy (can be removed)
└── docs/           # Documentation
```

❌ **Removed**: `python-services/` (redundant - Kumo handles ML processing)

## 📊 **Complete Data Flow**

```
CSV File → Backend Processing → Kumo RFM → Frontend Dashboard
```

### **Step 1: CSV Upload to Backend**
```typescript
// Frontend uploads CSV
const formData = new FormData();
formData.append('csvFile', file);

const response = await axios.post('/api/data/upload-csv', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### **Step 2: Backend Processes CSV & Calls Kumo**
```typescript
// Backend endpoint: /api/data/upload-csv
app.post('/api/data/upload-csv', upload.single('csvFile'), async (req, res) => {
  // 1. Parse CSV file
  const records = parse(fileContent, { columns: true });
  
  // 2. For each patient record:
  for (const record of records) {
    // Transform CSV → PatientProfile
    const patientProfile = {
      id: record.patient_id,
      age: Number(record.age),
      sex: record.sex,
      medications: record.medications.split(','),
      labResults: { creatinine: record.creatinine },
      // ... other fields
    };
    
    // 3. Send to Kumo RFM API
    const prediction = await kumoRFMService.predictRisk(patientProfile);
    
    // 4. Store prediction results
    results.push(prediction);
  }
});
```

### **Step 3: Kumo RFM Processing**
```typescript
// KumoRFM Service calls your API
class KumoRFMService {
  async predictRisk(patient: PatientProfile): Promise<RiskPrediction> {
    const response = await axios.post('https://api.kumo.ai/v1/predict', {
      patient_data: patient,
      model_version: '2.1'
    }, {
      headers: {
        'Authorization': `Bearer ${YOUR_KUMO_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      patientId: patient.id,
      riskScore: response.data.risk_score,
      predictedEvents: response.data.predicted_events,
      riskFactors: response.data.risk_factors
    };
  }
}
```

### **Step 4: Frontend Fetches Results**
```typescript
// Dashboard fetches processed data
const { data: patients } = await api.get('/api/patients?group=metformin-study');
const { data: metrics } = await api.get('/api/dashboard/metrics');
const { data: trends } = await api.get('/api/dashboard/risk-trends');

// Real-time alerts via SSE
const eventSource = new EventSource('/api/events/alerts');
eventSource.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  // Update dashboard with new alert
};
```

## 📁 **CSV Format Example**

Your medical data CSV should have these columns:

```csv
patient_id,age,sex,race,weight,height,medications,comorbidities,creatinine,alt,ast,hemoglobin,bp_systolic,bp_diastolic,heart_rate,study_group,enrollment_date,adverse_events
P-001,65,M,White,80,175,"metformin,lisinopril,atorvastatin","diabetes,hypertension",1.2,35,28,14.5,140,90,72,metformin-study,2024-01-15,
P-002,45,F,Asian,60,160,"warfarin,metoprolol",atrial_fibrillation,0.9,22,25,12.8,120,75,65,warfarin-study,2024-01-20,mild_nausea
```

## 🔄 **How It All Works Together**

### **1. Upload Process:**
```bash
# 1. Get sample CSV template
curl http://localhost:3001/api/data/sample-csv > sample.csv

# 2. Fill with your medical data
# Edit sample.csv with your patient data

# 3. Upload via frontend or API
curl -X POST -F "csvFile=@sample.csv" http://localhost:3001/api/data/upload-csv
```

### **2. Kumo Integration:**
- **Backend** transforms CSV data into Kumo-compatible format
- **Kumo API** processes patient features and returns risk predictions
- **Backend** stores predictions and makes them available to frontend
- **Frontend** displays predictions in charts, tables, and alerts

### **3. Group-Based Views:**
```typescript
// When user selects "Metformin Study" group:
const response = await api.get('/api/patients?group=metformin-study');

// Backend filters patients by medication/study group
const metforminPatients = patients.filter(p => 
  p.medications.includes('metformin') || 
  p.studyGroup === 'metformin-study'
);
```

## 🛠️ **API Endpoints**

### **Data Management**
- `POST /api/data/upload-csv` - Upload and process CSV file
- `GET /api/data/sample-csv` - Download CSV template
- `GET /api/patients?group={groupId}` - Get patients by group
- `GET /api/patients/{id}/risk` - Individual risk assessment

### **Dashboard Data**
- `GET /api/dashboard/metrics` - Real-time metrics
- `GET /api/dashboard/risk-trends` - Chart data
- `GET /api/dashboard/risk-distribution` - Risk distribution
- `GET /api/events/alerts` - Live alert stream (SSE)

### **Kumo Integration**
- `GET /api/kumorfm/status` - Check Kumo connection
- `POST /api/kumorfm/configure` - Update API credentials
- `GET /api/model/metrics` - Model performance

## 🔧 **Setup Instructions**

### **1. Configure Kumo API**
```bash
# Backend .env file
KUMORFM_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
KUMORFM_BASE_URL=https://api.kumo.ai/v1
```

### **2. Start Services**
```bash
# Backend
cd backend && npm run dev  # Port 3001

# Frontend  
cd frontend && npm run dev  # Port 5173
```

### **3. Test the Flow**
```bash
# 1. Download sample CSV
curl http://localhost:3001/api/data/sample-csv > medical_data.csv

# 2. Upload CSV (will automatically call Kumo)
curl -X POST -F "csvFile=@medical_data.csv" http://localhost:3001/api/data/upload-csv

# 3. View results in dashboard
open http://localhost:5173
```

## 📱 **Frontend Integration**

### **Group Selection Updates Dashboard**
```typescript
// When user selects a group, dashboard automatically updates:
const handleGroupChange = (group: Group) => {
  // 1. Update patient list
  fetchPatients(group.id);
  
  // 2. Update metrics
  fetchDashboardMetrics(group.id);
  
  // 3. Subscribe to group-specific alerts
  subscribeToGroupAlerts(group.id);
};
```

### **Real-time Updates**
```typescript
// Live risk scores and alerts
useEffect(() => {
  const eventSource = new EventSource('/api/events/alerts');
  
  eventSource.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    if (alert.type === 'kumorfm_alert') {
      // Update dashboard with new prediction
      setAlerts(prev => [alert, ...prev]);
    }
  };
}, []);
```

## 🎯 **Key Benefits**

1. **Simplified Architecture**: No redundant Python services
2. **Direct Kumo Integration**: Backend handles all ML processing via Kumo API
3. **CSV Processing**: Easy bulk data upload and processing
4. **Group Management**: Filter by drug cohorts/studies
5. **Real-time Updates**: Live risk monitoring and alerts
6. **Professional UI**: Medical-grade dashboard with charts

## 🚀 **Next Steps**

1. **Upload your CSV data** using the sample template
2. **Configure your Kumo API key** in backend/.env  
3. **Select different groups** to see filtered results
4. **Monitor real-time alerts** as they stream in
5. **Deploy to Railway** for production use

The system is now **production-ready** with your Kumo API key configured! 