# KumoRFM Integration Architecture

## Overview

KumoRFM (Real-time Feature Modeling) is integrated into KumoHax to provide real-time adverse event prediction and risk assessment. This document explains the complete data flow and integration architecture.

## Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│    Database     │───►│   KumoHax API    │───►│    KumoRFM      │───►│    Frontend      │
│   (Clinical)    │    │   (Backend)      │    │   (External)    │    │   (Dashboard)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └──────────────────┘
         │                        │                        │                        │
         │                        │                        │                        │
    ┌─────────┐               ┌─────────┐               ┌─────────┐               ┌─────────┐
    │Patient  │               │REST API │               │ML Model │               │Real-time│
    │Data     │               │Services │               │& RFM    │               │Updates  │
    │EHR/EMR  │               │Auth     │               │Features │               │Charts   │
    │Lab Results│              │Validation│              │Prediction│              │Alerts   │
    └─────────┘               └─────────┘               └─────────┘               └─────────┘
```

## Integration Flow

### 1. Database → Backend (Data Ingestion)
```typescript
// Patient data from your clinical database
interface PatientData {
  id: string;
  demographics: {
    age: number;
    sex: 'M' | 'F';
    race: string;
    weight: number;
    height: number;
  };
  medications: {
    name: string;
    dosage: string;
    startDate: string;
    endDate?: string;
    indication: string;
  }[];
  labResults: {
    testName: string;
    value: number;
    unit: string;
    referenceRange: string;
    dateCollected: string;
  }[];
  vitalSigns: {
    bloodPressure: { systolic: number; diastolic: number };
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    timestamp: string;
  }[];
  comorbidities: string[];
  adverseEvents?: {
    event: string;
    severity: 'mild' | 'moderate' | 'severe';
    outcome: string;
    dateReported: string;
  }[];
}
```

### 2. Backend → KumoRFM (Feature Engineering & Prediction)
```typescript
// KumoRFM API Integration
class KumoRFMService {
  async predictAdverseEvents(patientData: PatientData): Promise<RiskPrediction> {
    // 1. Transform patient data into KumoRFM feature format
    const features = this.extractFeatures(patientData);
    
    // 2. Call KumoRFM API for real-time prediction
    const response = await this.client.post('/predict/adverse-events', {
      patient_id: patientData.id,
      features: features,
      model_version: '2.1',
      include_explanability: true,
      real_time_mode: true
    });
    
    // 3. Return structured prediction
    return {
      patientId: patientData.id,
      riskScore: response.data.overall_risk_score,
      predictedEvents: response.data.predicted_events,
      riskFactors: response.data.risk_factors,
      confidence: response.data.confidence_interval,
      modelVersion: response.data.model_version,
      timestamp: new Date().toISOString()
    };
  }
  
  private extractFeatures(patient: PatientData): KumoRFMFeatures {
    return {
      // Demographic features
      age_normalized: patient.demographics.age / 100,
      sex_encoded: patient.demographics.sex === 'M' ? 1 : 0,
      bmi: this.calculateBMI(patient.demographics),
      
      // Medication features
      polypharmacy_score: patient.medications.length,
      drug_interaction_risk: this.calculateDrugInteractions(patient.medications),
      high_risk_medications: this.identifyHighRiskMeds(patient.medications),
      
      // Lab result features (time-series)
      creatinine_trend: this.calculateTrend(patient.labResults, 'creatinine'),
      alt_trend: this.calculateTrend(patient.labResults, 'ALT'),
      hemoglobin_latest: this.getLatestValue(patient.labResults, 'hemoglobin'),
      
      // Vital signs features
      bp_variability: this.calculateBPVariability(patient.vitalSigns),
      heart_rate_trend: this.calculateHRTrend(patient.vitalSigns),
      
      // Comorbidity features
      comorbidity_count: patient.comorbidities.length,
      diabetes_flag: patient.comorbidities.includes('diabetes') ? 1 : 0,
      renal_disease_flag: patient.comorbidities.includes('renal_disease') ? 1 : 0,
      
      // Historical adverse event features
      previous_ae_count: patient.adverseEvents?.length || 0,
      severe_ae_history: patient.adverseEvents?.some(ae => ae.severity === 'severe') ? 1 : 0
    };
  }
}
```

### 3. KumoRFM → Frontend (Real-time Updates)
```typescript
// Real-time streaming from backend to frontend
app.get('/api/events/alerts', (req, res) => {
  // Setup SSE connection
  res.setHeader('Content-Type', 'text/event-stream');
  
  // Start KumoRFM real-time monitoring
  kumoRFMService.streamAlerts((prediction) => {
    if (prediction.riskScore > ALERT_THRESHOLD) {
      const alert = {
        id: nanoid(),
        patientId: prediction.patientId,
        riskScore: prediction.riskScore,
        predictedEvents: prediction.predictedEvents,
        severity: this.calculateSeverity(prediction.riskScore),
        recommendations: this.generateRecommendations(prediction),
        timestamp: prediction.timestamp
      };
      
      // Send to frontend
      res.write(`data: ${JSON.stringify(alert)}\n\n`);
      
      // Store in database for audit trail
      this.storeAlert(alert);
    }
  });
});
```

## KumoRFM Configuration

### Environment Setup
```bash
# Backend .env configuration
KUMORFM_API_KEY=your_kumorfm_api_key_here
KUMORFM_BASE_URL=https://api.kumorfm.com/v1
KUMORFM_MODEL_VERSION=2.1
KUMORFM_TIMEOUT=30000
KUMORFM_RETRY_ATTEMPTS=3

# Optional: Webhook for KumoRFM to push alerts
KUMORFM_WEBHOOK_URL=https://your-backend.railway.app/webhooks/kumorfm
KUMORFM_WEBHOOK_SECRET=your_webhook_secret
```

### API Authentication
```typescript
// KumoRFM API client setup
const kumoRFMClient = axios.create({
  baseURL: process.env.KUMORFM_BASE_URL,
  timeout: parseInt(process.env.KUMORFM_TIMEOUT || '30000'),
  headers: {
    'Authorization': `Bearer ${process.env.KUMORFM_API_KEY}`,
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0',
    'X-Client-Name': 'KumoHax'
  }
});
```

## Group-Based Data Flow

When a user selects different groups (drug cohorts), the data flow changes:

```typescript
// Group selection triggers data filtering
const handleGroupChange = async (group: Group) => {
  // 1. Filter patients by group criteria
  const groupPatients = await api.get(`/patients?group=${group.id}`);
  
  // 2. Request KumoRFM predictions for this cohort
  const cohortPredictions = await kumoRFMService.batchPredict(groupPatients);
  
  // 3. Update dashboard with group-specific metrics
  updateDashboardMetrics(group, cohortPredictions);
  
  // 4. Subscribe to group-specific alert stream
  subscribeToGroupAlerts(group.id);
};
```

## Real-time Feature Updates

KumoRFM continuously updates feature models based on:

1. **New patient data** (labs, vitals, medications)
2. **Reported adverse events** (feedback loop)
3. **Model retraining** (periodic updates)
4. **Population trends** (cohort-level patterns)

## Data Privacy & Security

- **PHI Protection**: All patient data is anonymized before sending to KumoRFM
- **API Security**: JWT tokens, API rate limiting, request signing
- **Audit Trail**: All predictions and alerts are logged for compliance
- **Data Retention**: Configure data retention policies per regulations

## Monitoring & Alerting

### Model Performance Monitoring
```typescript
// Track KumoRFM model performance
const modelMetrics = await kumoRFMService.getModelMetrics();
// Returns: accuracy, precision, recall, F1-score, AUC, drift detection

// Alert thresholds
if (modelMetrics.accuracy < 0.85) {
  alertOps('KumoRFM model performance degraded');
}
```

### System Health Monitoring
```typescript
// Monitor integration health
const healthCheck = await kumoRFMService.healthCheck();
// Returns: API status, latency, model availability, feature freshness
```

## Implementation Checklist

- [ ] **Database Integration**: Connect to your clinical database
- [ ] **KumoRFM API Key**: Obtain and configure API credentials  
- [ ] **Feature Mapping**: Map your data schema to KumoRFM features
- [ ] **Group Configuration**: Define patient groups/cohorts
- [ ] **Alert Thresholds**: Configure risk score thresholds
- [ ] **Monitoring Setup**: Implement health checks and performance monitoring
- [ ] **Security Review**: Ensure PHI protection and compliance
- [ ] **Testing**: Test with synthetic data before production
- [ ] **Deployment**: Deploy to Railway/production environment

## Next Steps

1. **Connect Your Database**: Replace mock data with real patient data
2. **Configure KumoRFM**: Add your API key and test connection
3. **Define Groups**: Set up your specific drug cohorts/studies
4. **Customize Alerts**: Configure thresholds for your use case
5. **Deploy**: Push to production environment

This architecture ensures real-time adverse event monitoring with KumoRFM's advanced ML capabilities while maintaining data security and system reliability. 