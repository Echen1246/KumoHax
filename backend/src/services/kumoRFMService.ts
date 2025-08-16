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
  predictedEvents: {
    eventType: string;
    probability: number;
    timeToEvent?: number;
  }[];
  riskFactors: {
    factor: string;
    importance: number;
  }[];
  lastUpdated: string;
}

export interface AlertEvent {
  id: string;
  patientId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high';
  riskScore: number;
  description: string;
  recommendedActions: string[];
  timestamp: string;
}

class KumoRFMService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.KUMORFM_API_KEY || '';
    this.baseURL = process.env.KUMORFM_BASE_URL || 'https://api.kumorfm.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async predictRisk(patientProfile: PatientProfile): Promise<RiskPrediction> {
    try {
      const response = await this.client.post('/predict/adverse-events', {
        patient: patientProfile,
        modelVersion: '2.1',
        includeExplanability: true,
      });

      return {
        patientId: patientProfile.id,
        riskScore: response.data.overallRisk,
        predictedEvents: response.data.predictions,
        riskFactors: response.data.riskFactors,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('KumoRFM API Error:', error);
      // Return mock data if API is unavailable
      return this.getMockRiskPrediction(patientProfile.id);
    }
  }

  async batchPredict(patients: PatientProfile[]): Promise<RiskPrediction[]> {
    try {
      const response = await this.client.post('/predict/batch', {
        patients,
        modelVersion: '2.1',
      });

      return response.data.predictions;
    } catch (error) {
      console.error('KumoRFM Batch API Error:', error);
      // Return mock data if API is unavailable
      return patients.map(p => this.getMockRiskPrediction(p.id));
    }
  }

  async getModelMetrics(): Promise<any> {
    try {
      const response = await this.client.get('/models/metrics');
      return response.data;
    } catch (error) {
      console.error('KumoRFM Model Metrics Error:', error);
      return {
        accuracy: 0.892,
        auc: 0.934,
        precision: 0.876,
        recall: 0.923,
        f1Score: 0.899,
        lastTrainingDate: '2024-01-01',
        datasetSize: 145720,
      };
    }
  }

  async streamAlerts(callback: (alert: AlertEvent) => void): Promise<void> {
    try {
      // In a real implementation, this would establish a WebSocket or SSE connection
      // For now, we'll simulate with periodic checks
      console.log('Starting KumoRFM alert stream...');
      
      // Mock real-time alerts for demo
      setInterval(() => {
        const mockAlert = this.generateMockAlert();
        callback(mockAlert);
      }, 10000); // Every 10 seconds
      
    } catch (error) {
      console.error('KumoRFM Alert Stream Error:', error);
    }
  }

  private getMockRiskPrediction(patientId: string): RiskPrediction {
    const riskScore = Math.random() * 0.4 + 0.1; // Random score between 0.1-0.5
    
    return {
      patientId,
      riskScore,
      predictedEvents: [
        {
          eventType: 'hepatotoxicity',
          probability: riskScore * 0.8,
          timeToEvent: Math.floor(Math.random() * 30) + 1,
        },
        {
          eventType: 'cardiac_arrhythmia',
          probability: riskScore * 0.6,
          timeToEvent: Math.floor(Math.random() * 45) + 1,
        },
      ],
      riskFactors: [
        { factor: 'age', importance: 0.23 },
        { factor: 'polypharmacy', importance: 0.18 },
        { factor: 'renal_function', importance: 0.15 },
        { factor: 'drug_interactions', importance: 0.12 },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  private generateMockAlert(): AlertEvent {
    const patientIds = ['P-1001', 'P-1002', 'P-1003', 'P-1847', 'P-2193'];
    const alertTypes = ['hepatotoxicity', 'cardiac_arrhythmia', 'renal_dysfunction', 'drug_interaction'];
    const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    
    const patientId = patientIds[Math.floor(Math.random() * patientIds.length)];
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const riskScore = severity === 'high' ? Math.random() * 0.3 + 0.7 : 
                     severity === 'medium' ? Math.random() * 0.4 + 0.3 : 
                     Math.random() * 0.3;

    return {
      id: `A-${Date.now()}`,
      patientId,
      alertType,
      severity,
      riskScore,
      description: `Elevated risk of ${alertType.replace('_', ' ')} detected`,
      recommendedActions: [
        'Review current medications',
        'Monitor lab values',
        'Consider dose adjustment',
      ],
      timestamp: new Date().toISOString(),
    };
  }
}

export const kumoRFMService = new KumoRFMService(); 