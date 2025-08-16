# KumoHax - Adverse Event Risk Monitoring Platform

A professional-grade healthcare platform for real-time adverse event prediction and risk monitoring, powered by KumoRFM (Real-time Feature Modeling) and advanced machine learning analytics.

## 🚀 Overview

KumoHax is a comprehensive solution for clinical trial safety monitoring and post-market adverse event prediction. The platform combines:

- **Real-time Risk Assessment**: Continuous patient monitoring with KumoRFM integration
- **Advanced Analytics**: ML-powered cohort analysis and predictive modeling  
- **Professional Dashboard**: Medical-grade UI with interactive charts and alerts
- **Microservices Architecture**: Scalable backend with Python ML services

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │ Python Services │
│   (React/TS)    │◄──►│   (Node.js/TS)   │◄──►│   (FastAPI/ML)  │
│                 │    │                  │    │                 │
│ • Dashboard     │    │ • KumoRFM API    │    │ • Risk Modeling │
│ • Analytics     │    │ • Real-time SSE  │    │ • Cohort Analysis│
│ • Charts        │    │ • Data Endpoints │    │ • Synthetic Data │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │     KumoRFM      │
                       │   (External API) │
                       │                  │
                       │ • Risk Prediction│
                       │ • Feature Models │
                       │ • Real-time RFM  │
                       └──────────────────┘
```

## 🎯 Key Features

### Frontend Dashboard
- **Real-time Metrics**: Live patient counts, alert tracking, risk scores
- **Interactive Charts**: Risk trends, distribution analysis, cohort visualization
- **Professional UI**: Medical-grade design with Tailwind CSS
- **Responsive Layout**: Works on desktop, tablet, and mobile

### Backend Services
- **KumoRFM Integration**: Direct API connection for real-time risk modeling
- **Advanced Endpoints**: Patient management, cohort analysis, model metrics
- **Real-time Streaming**: Server-Sent Events for live alerts
- **Security**: Helmet.js protection, CORS configuration

### Python ML Services
- **Risk Prediction**: Scikit-learn models for adverse event prediction
- **Cohort Analysis**: Statistical analysis of patient populations
- **Synthetic Data**: Generate test datasets for development
- **Model Performance**: Track ML metrics and model health

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- KumoRFM API Key (contact your provider)

### 1. Clone Repository
```bash
git clone https://github.com/Echen1246/KumoHax.git
cd KumoHax
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev  # Runs on http://localhost:5173
```

### 3. Backend Setup  
```bash
cd backend
npm install
cp .env.example .env
# Add your KumoRFM API key to .env:
# KUMORFM_API_KEY=your_api_key_here
# KUMORFM_BASE_URL=https://api.kumorfm.com/v1
npm run dev  # Runs on http://localhost:3001
```

### 4. Python Services Setup
```bash
cd python-services
pip install -r requirements.txt
python main.py  # Runs on http://localhost:8000
```

### 5. Middleware (Optional)
```bash
cd middleware
npm install
cp .env.example .env
npm run dev  # Runs on http://localhost:4000
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_BASE_URL=/api
VITE_DEV_PROXY_TARGET=http://localhost:3001
```

#### Backend (.env)  
```bash
PORT=3001
CORS_ORIGIN=http://localhost:5173
KUMORFM_API_KEY=your_api_key_here
KUMORFM_BASE_URL=https://api.kumorfm.com/v1
```

#### Middleware (.env)
```bash
PORT=4000
BACKEND_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:5173
```

## 📊 API Endpoints

### Dashboard APIs
- `GET /api/dashboard/metrics` - Real-time dashboard metrics
- `GET /api/dashboard/risk-trends` - Risk trend data for charts  
- `GET /api/dashboard/risk-distribution` - Patient risk distribution

### Patient APIs
- `GET /api/patients` - List all patients with risk scores
- `GET /api/patients/:id/risk` - Individual patient risk assessment
- `POST /api/cohorts/analyze` - Cohort analysis with filters

### KumoRFM APIs
- `POST /api/kumorfm/configure` - Configure KumoRFM credentials
- `GET /api/kumorfm/status` - Check KumoRFM connection status
- `GET /api/model/metrics` - ML model performance metrics

### Real-time APIs
- `GET /api/events/alerts` - Server-Sent Events for live alerts
- `GET /api/alerts/recent` - Recent high-priority alerts

### Python ML APIs
- `POST /analyze/patient-risk` - Advanced risk analysis
- `POST /analyze/cohort` - Detailed cohort insights
- `POST /generate/synthetic-data` - Generate test patients

## 🚀 Deployment

### Development
```bash
# Start all services in separate terminals
npm run dev  # Frontend
npm run dev  # Backend  
python main.py  # Python services
```

### Production (Railway)

1. **Backend Deployment**:
   - Deploy `backend/` to Railway
   - Set environment variables in Railway dashboard
   - Domain: `https://your-app.railway.app`

2. **Frontend Deployment**:
   - Build: `npm run build`
   - Deploy `dist/` to Vercel/Netlify
   - Set `VITE_API_BASE_URL=https://your-backend.railway.app/api`

3. **Python Services**:
   - Deploy to Railway/Google Cloud Run
   - Set ML service endpoint in backend configuration

## 🔐 Security Features

- **Helmet.js**: Security headers protection
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Zod schema validation
- **Error Handling**: Graceful error responses
- **API Rate Limiting**: (Implementation ready)

## 📈 Monitoring & Analytics

### Real-time Features
- Live patient risk scoring
- Continuous adverse event monitoring  
- Real-time alert notifications
- Dashboard metric updates

### Analytics Capabilities
- Cohort risk analysis
- Trend identification
- Statistical modeling
- Predictive insights

## 🧪 Testing & Development

### Sample Data
The system includes synthetic patient data for testing:
- Mock patient profiles with realistic medical data
- Simulated lab results and vital signs
- Generated medication and comorbidity lists

### KumoRFM Integration
- Graceful fallback when API is unavailable
- Mock data for development environment
- Production-ready API client with error handling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **KumoRFM Support**: Contact your KumoRFM provider for API assistance

---

**Built for healthcare professionals by healthcare technologists** 🏥

*KumoHax - Transforming clinical safety through intelligent monitoring* 