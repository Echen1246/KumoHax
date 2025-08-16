import axios, { AxiosInstance } from 'axios';

export interface PatientProfile {
  id: string;
  age: number;
  sex: 'M' | 'F';
  race: string;
  medications: string[];
  comorbidities: string[];
  labResults: Record<string, number>;
  vitalSigns: Record<string, number>;
}

export interface RiskPrediction {
  patientId: string;
  riskScore: number;
  predictedEvents: string[];
  riskFactors: {
    factor: string;
    impact: number;
    confidence: number;
  }[];
  lastUpdated: string;
}

export interface AlertEvent {
  id: string;
  patientId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  riskScore: number;
  timestamp: string;
}

class KumoRFMService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.KUMORFM_API_KEY || '';
    this.baseURL = process.env.KUMORFM_BASE_URL || 'https://api.kumo.ai/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(process.env.KUMORFM_TIMEOUT || '30000'),
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[KumoRFM] Initialized with base URL: ${this.baseURL}`);
    console.log(`[KumoRFM] API Key configured: ${!!this.apiKey}`);
  }

  async predictRisk(patientProfile: PatientProfile): Promise<RiskPrediction> {
    try {
      if (!this.apiKey) {
        console.warn('[KumoRFM] No API key configured, using mock data');
        return this.getMockRiskPrediction(patientProfile.id);
      }

      // Transform patient data for Kumo API format
      const kumoPayload = {
        patient_data: {
          demographics: {
            age: patientProfile.age,
            sex: patientProfile.sex,
            race: patientProfile.race,
          },
          medications: patientProfile.medications,
          comorbidities: patientProfile.comorbidities,
          lab_results: patientProfile.labResults,
          vital_signs: patientProfile.vitalSigns,
        },
        model_version: process.env.KUMORFM_MODEL_VERSION || '2.1',
        prediction_type: 'adverse_event_risk',
      };

      console.log(`[KumoRFM] Predicting risk for patient: ${patientProfile.id}`);
      
      const response = await this.client.post('/predict', kumoPayload);
      
      return {
        patientId: patientProfile.id,
        riskScore: response.data.risk_score || 0,
        predictedEvents: response.data.predicted_events || [],
        riskFactors: response.data.risk_factors || [],
        lastUpdated: new Date().toISOString(),
      };

    } catch (error) {
      console.error(`[KumoRFM] Error predicting risk for patient ${patientProfile.id}:`, error);
      
      // Fall back to mock data on error
      return this.getMockRiskPrediction(patientProfile.id);
    }
  }

  async batchPredict(patients: PatientProfile[]): Promise<RiskPrediction[]> {
    const predictions: RiskPrediction[] = [];
    
    // Process in smaller batches to avoid API limits
    const batchSize = 5;
    
    for (let i = 0; i < patients.length; i += batchSize) {
      const batch = patients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(patient => 
        this.predictRisk(patient).catch(error => {
          console.error(`Error in batch prediction for ${patient.id}:`, error);
          return this.getMockRiskPrediction(patient.id);
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      predictions.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < patients.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return predictions;
  }

  async getModelMetrics(): Promise<any> {
    try {
      if (!this.apiKey) {
        return this.getMockModelMetrics();
      }

      const response = await this.client.get('/model/metrics');
      return response.data;
    } catch (error) {
      console.error('[KumoRFM] Error fetching model metrics:', error);
      return this.getMockModelMetrics();
    }
  }

  async streamAlerts(callback: (alert: AlertEvent) => void): Promise<void> {
    // Simulate real-time alerts for demo
    // In production, this would connect to Kumo's streaming endpoint
    
    const generateAlert = () => {
      const alert = this.generateMockAlert();
      callback(alert);
      
      // Schedule next alert (random interval between 10-60 seconds)
      const nextInterval = Math.random() * 50000 + 10000;
      setTimeout(generateAlert, nextInterval);
    };
    
    // Start generating alerts
    setTimeout(generateAlert, 5000);
  }

  private getMockRiskPrediction(patientId: string): RiskPrediction {
    const riskScore = Math.random() * 0.7 + 0.1; // 0.1 to 0.8
    
    const possibleEvents = [
      'Hepatotoxicity',
      'Cardiac Arrhythmia',
      'Renal Function Decline',
      'GI Bleeding',
      'Hypoglycemia',
      'Hyperkalemia',
      'Drug Interaction',
    ];
    
    const predictedEvents = possibleEvents
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    return {
      patientId,
      riskScore,
      predictedEvents,
      riskFactors: [
        { factor: 'Age', impact: 0.3, confidence: 0.9 },
        { factor: 'Medication Interactions', impact: 0.25, confidence: 0.85 },
        { factor: 'Comorbidities', impact: 0.2, confidence: 0.8 },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  private getMockModelMetrics() {
    return {
      accuracy: 0.876,
      precision: 0.823,
      recall: 0.891,
      f1_score: 0.856,
      auc_roc: 0.924,
      model_version: '2.1',
      last_trained: '2024-01-15T10:30:00Z',
      training_samples: 125847,
    };
  }

  private generateMockAlert(): AlertEvent {
    const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
    const conditions = [
      'Elevated liver enzymes detected',
      'Cardiac rhythm abnormality risk',
      'Renal function declining trend',
      'Drug interaction warning',
      'Blood glucose instability',
    ];
    
    return {
      id: `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      patientId: `P-${Math.floor(Math.random() * 9000) + 1000}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: conditions[Math.floor(Math.random() * conditions.length)],
      riskScore: Math.random() * 0.6 + 0.4, // 0.4 to 1.0 for alerts
      timestamp: new Date().toISOString(),
    };
  }
}

export const kumoRFMService = new KumoRFMService(); 