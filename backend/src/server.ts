import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { kumoRFMService, PatientProfile } from './services/kumoRFMService';

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const PORT = Number(process.env.PORT || 3001);

// In-memory storage (replace with real database)
const patients: PatientProfile[] = [
  {
    id: 'P-1001',
    age: 72,
    sex: 'F',
    race: 'White',
    medications: ['metformin', 'lisinopril', 'atorvastatin'],
    comorbidities: ['diabetes', 'hypertension', 'hyperlipidemia'],
    labResults: { 'creatinine': 1.2, 'alt': 45, 'ast': 38 },
    vitalSigns: { 'bp_systolic': 145, 'bp_diastolic': 92, 'heart_rate': 78 },
  },
  {
    id: 'P-1002',
    age: 28,
    sex: 'M',
    race: 'Asian',
    medications: ['fluoxetine', 'ibuprofen'],
    comorbidities: ['depression'],
    labResults: { 'creatinine': 0.9, 'alt': 22, 'ast': 25 },
    vitalSigns: { 'bp_systolic': 120, 'bp_diastolic': 75, 'heart_rate': 68 },
  },
  {
    id: 'P-1003',
    age: 55,
    sex: 'M',
    race: 'Black',
    medications: ['warfarin', 'metoprolol', 'furosemide'],
    comorbidities: ['atrial_fibrillation', 'heart_failure'],
    labResults: { 'creatinine': 1.8, 'alt': 55, 'ast': 48, 'inr': 2.3 },
    vitalSigns: { 'bp_systolic': 110, 'bp_diastolic': 65, 'heart_rate': 55 },
  },
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'kumohax-backend', 
    version: '1.0.0',
    kumoRFM: process.env.KUMORFM_API_KEY ? 'connected' : 'not_configured',
    timestamp: new Date().toISOString(),
  });
});

// CSV Upload and Processing
app.post('/api/data/upload-csv', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const { parse } = await import('csv-parse/sync');
    const fs = await import('fs');
    
    // Read and parse CSV
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      cast: true
    });

    console.log(`Processing ${records.length} patient records from CSV...`);

    const results = {
      processed: 0,
      predictions: [] as any[],
      errors: [] as string[]
    };

    // Process each record and send to Kumo RFM
    for (const record of records) {
      try {
        // Transform CSV record to PatientProfile format
        const patientProfile: PatientProfile = {
          id: record.patient_id || `P-${nanoid(8)}`,
          age: Number(record.age),
          sex: record.sex as 'M' | 'F',
          race: record.race || 'Unknown',
          medications: record.medications ? record.medications.split(',').map((m: string) => m.trim()) : [],
          comorbidities: record.comorbidities ? record.comorbidities.split(',').map((c: string) => c.trim()) : [],
          labResults: {
            ...(record.creatinine && { creatinine: Number(record.creatinine) }),
            ...(record.alt && { alt: Number(record.alt) }),
            ...(record.ast && { ast: Number(record.ast) }),
            ...(record.hemoglobin && { hemoglobin: Number(record.hemoglobin) })
          },
          vitalSigns: {
            ...(record.bp_systolic && { bp_systolic: Number(record.bp_systolic) }),
            ...(record.bp_diastolic && { bp_diastolic: Number(record.bp_diastolic) }),
            ...(record.heart_rate && { heart_rate: Number(record.heart_rate) })
          }
        };

        // Get prediction from Kumo RFM
        const prediction = await kumoRFMService.predictRisk(patientProfile);
        
        results.predictions.push({
          ...prediction,
          studyGroup: record.study_group || 'default',
          originalData: record
        });
        
        results.processed++;

        // Add to our in-memory storage
        patients.push(patientProfile);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Error processing patient ${record.patient_id}: ${errorMessage}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: `Successfully processed ${results.processed} patients`,
      ...results
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to process CSV: ${errorMessage}` });
  }
});

// Generate sample CSV template
app.get('/api/data/sample-csv', (req, res) => {
  const sampleData = [
    {
      patient_id: 'P-001',
      age: 65,
      sex: 'M',
      race: 'White',
      weight: 80,
      height: 175,
      medications: 'metformin,lisinopril,atorvastatin',
      comorbidities: 'diabetes,hypertension',
      creatinine: 1.2,
      alt: 35,
      ast: 28,
      hemoglobin: 14.5,
      bp_systolic: 140,
      bp_diastolic: 90,
      heart_rate: 72,
      study_group: 'metformin-study',
      enrollment_date: '2024-01-15',
      adverse_events: ''
    },
    {
      patient_id: 'P-002',
      age: 45,
      sex: 'F',
      race: 'Asian',
      weight: 60,
      height: 160,
      medications: 'warfarin,metoprolol',
      comorbidities: 'atrial_fibrillation',
      creatinine: 0.9,
      alt: 22,
      ast: 25,
      hemoglobin: 12.8,
      bp_systolic: 120,
      bp_diastolic: 75,
      heart_rate: 65,
      study_group: 'warfarin-study',
      enrollment_date: '2024-01-20',
      adverse_events: 'mild_nausea'
    }
  ];

  // Convert to CSV format
  const headers = Object.keys(sampleData[0]).join(',');
  const rows = sampleData.map(row => Object.values(row).join(','));
  const csvContent = [headers, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample_medical_data.csv"');
  res.send(csvContent);
});

// Dashboard metrics
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const totalPatients = patients.length;
    const predictions = await kumoRFMService.batchPredict(patients);
    const highRiskPatients = predictions.filter(p => p.riskScore > 0.7).length;
    const averageRiskScore = predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length;
    
    res.json({
      totalPatients: totalPatients * 947, // Scale up for demo
      activeAlerts: Math.floor(Math.random() * 30) + 15,
      highRiskPatients: highRiskPatients * 42,
      averageRiskScore,
      alertsTrend: (Math.random() - 0.5) * 20,
      riskTrend: (Math.random() - 0.5) * 10,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// Risk trend data
app.get('/api/dashboard/risk-trends', (req, res) => {
  const trends = [];
  const baseDate = new Date();
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      averageRisk: Math.random() * 0.3 + 0.2,
      highRiskPatients: Math.floor(Math.random() * 50) + 80,
      alertsCount: Math.floor(Math.random() * 15) + 10,
    });
  }
  
  res.json(trends);
});

// Risk distribution data
app.get('/api/dashboard/risk-distribution', async (req, res) => {
  try {
    const predictions = await kumoRFMService.batchPredict(patients);
    const totalPatients = predictions.length * 947; // Scale for demo
    
    const low = Math.floor(totalPatients * 0.664);
    const medium = Math.floor(totalPatients * 0.291);
    const high = totalPatients - low - medium;
    
    res.json([
      { riskCategory: 'Low (0.0-0.3)', patientCount: low, percentage: 66.4 },
      { riskCategory: 'Medium (0.3-0.7)', patientCount: medium, percentage: 29.1 },
      { riskCategory: 'High (0.7-1.0)', patientCount: high, percentage: 4.5 },
    ]);
  } catch (error) {
    console.error('Risk distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch risk distribution' });
  }
});

// Patients endpoint with risk predictions
app.get('/api/patients', async (req, res) => {
  try {
    const groupId = req.query.group as string;
    let filteredPatients = patients;
    
    // Filter by group if specified
    if (groupId && groupId !== 'all') {
      // This is where you'd filter by study group in real implementation
      // For demo, we'll just return a subset based on group
      if (groupId === 'metformin-study') {
        filteredPatients = patients.filter(p => p.medications.includes('metformin'));
      } else if (groupId === 'warfarin-study') {
        filteredPatients = patients.filter(p => p.medications.includes('warfarin'));
      }
    }
    
    const predictions = await kumoRFMService.batchPredict(filteredPatients);
    
    const enrichedPatients = filteredPatients.map(patient => {
      const prediction = predictions.find(p => p.patientId === patient.id);
      return {
        id: patient.id,
        age: patient.age,
        sex: patient.sex,
        race: patient.race,
        medications: patient.medications,
        comorbidities: patient.comorbidities,
        riskScore: prediction?.riskScore || 0,
        predictedEvents: prediction?.predictedEvents || [],
        lastUpdated: prediction?.lastUpdated || new Date().toISOString(),
      };
    });
    
    res.json(enrichedPatients);
  } catch (error) {
    console.error('Patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Individual patient risk assessment
app.get('/api/patients/:id/risk', async (req, res) => {
  try {
    const patient = patients.find(p => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const prediction = await kumoRFMService.predictRisk(patient);
    res.json(prediction);
  } catch (error) {
    console.error('Patient risk error:', error);
    res.status(500).json({ error: 'Failed to assess patient risk' });
  }
});

// Model performance metrics
app.get('/api/model/metrics', async (req, res) => {
  try {
    const metrics = await kumoRFMService.getModelMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Model metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch model metrics' });
  }
});

// Cohort analysis
app.post('/api/cohorts/analyze', async (req, res) => {
  try {
    const { filters } = req.body;
    
    let filteredPatients = patients;
    
    if (filters?.ageMin) {
      filteredPatients = filteredPatients.filter(p => p.age >= filters.ageMin);
    }
    if (filters?.ageMax) {
      filteredPatients = filteredPatients.filter(p => p.age <= filters.ageMax);
    }
    if (filters?.sex) {
      filteredPatients = filteredPatients.filter(p => p.sex === filters.sex);
    }
    if (filters?.medications && filters.medications.length > 0) {
      filteredPatients = filteredPatients.filter(p => 
        filters.medications.some((med: string) => p.medications.includes(med))
      );
    }
    
    const predictions = await kumoRFMService.batchPredict(filteredPatients);
    const averageRisk = predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length;
    
    res.json({
      cohortSize: filteredPatients.length,
      averageRisk,
      highRiskCount: predictions.filter(p => p.riskScore > 0.7).length,
      predictions,
    });
  } catch (error) {
    console.error('Cohort analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze cohort' });
  }
});

// Recent alerts
app.get('/api/alerts/recent', (req, res) => {
  const recentAlerts = [
    {
      id: 'A-2024-001',
      patientId: 'P-1847',
      riskScore: 0.89,
      condition: 'Hepatotoxicity Risk',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'high',
    },
    {
      id: 'A-2024-002',
      patientId: 'P-2193',
      riskScore: 0.76,
      condition: 'Cardiac Arrhythmia Risk',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: 'high',
    },
    {
      id: 'A-2024-003',
      patientId: 'P-1654',
      riskScore: 0.68,
      condition: 'Renal Function Decline',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      severity: 'medium',
    },
  ];
  
  res.json(recentAlerts);
});

// Real-time alert stream (SSE)
app.get('/api/events/alerts', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  const send = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Start KumoRFM alert stream
  kumoRFMService.streamAlerts((alert) => {
    send({
      id: alert.id,
      patientId: alert.patientId,
      severity: alert.severity,
      message: alert.description,
      riskScore: alert.riskScore,
      createdAt: alert.timestamp,
      type: 'kumorfm_alert',
    });
  });

  // Heartbeat
  const heartbeat = setInterval(() => {
    send({ type: 'heartbeat', timestamp: new Date().toISOString() });
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    res.end();
  });
});

// KumoRFM configuration
app.post('/api/kumorfm/configure', (req, res) => {
  const { apiKey, baseUrl } = req.body;
  
  // In production, store securely
  process.env.KUMORFM_API_KEY = apiKey;
  if (baseUrl) {
    process.env.KUMORFM_BASE_URL = baseUrl;
  }
  
  res.json({ 
    success: true, 
    message: 'KumoRFM configuration updated',
    configured: !!apiKey,
  });
});

app.get('/api/kumorfm/status', (req, res) => {
  res.json({
    configured: !!process.env.KUMORFM_API_KEY,
    baseUrl: process.env.KUMORFM_BASE_URL || 'https://api.kumo.ai/v1',
    lastConnection: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

app.listen(PORT, () => {
  console.log(`[backend] KumoHax server listening on http://localhost:${PORT}`);
  console.log(`[backend] KumoRFM configured: ${!!process.env.KUMORFM_API_KEY}`);
}); 