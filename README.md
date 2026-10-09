# Customs Performance Measurement Mechanism (PMM) Dashboard

The Customs PMM Dashboard is a comprehensive, full-stack application designed to track, monitor, and visualize critical customs performance metrics across multiple ports. It is built to handle millions of records (currently seeded with 50,000 synthetic records) and compute aggregations for Time Release Studies (TRS), Revenue Intelligence, and Enforcement tracking within strict performance targets (< 500ms).

## 🚀 Features

- **Executive Dashboard:** High-level KPIs spanning all organizational dimensions.
- **Time Release Study (TRS):** Detailed analysis of clearance times, bottlenecks, and release distribution.
- **Revenue Intelligence:** Identifies theoretical vs. actual revenue gaps and valuation anomalies using an AG Grid Server-Backed infinite scrolling table.
- **Enforcement Tracking:** Monitors seizure and flag rates.
- **Alerts Center:** Real-time, configurable alert rules with auto-resolution tracking.
- **Global Context:** Filter metrics synchronously by Date Range, Port, and HS Code via Redux state.

## 🏗️ Architecture Stack

- **Backend:** Node.js, Express, TypeScript.
- **Database:** MySQL (optimized with indexes for sub-second analytical queries).
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS.
- **State Management:** Redux Toolkit.
- **Data Visualization:** Recharts, AG Grid (Server-Side Pagination & Sorting).

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)
- Python 3.9+ (for generating synthetic data)

### 1. Database Setup
1. Create a MySQL database (e.g., `customs_pmm`).
2. Run the schema creation script located at `sql/01_schema.sql` to generate tables and indexes.

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory based on `.env.example`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=customs_pmm
JWT_SECRET=your_jwt_secret
```

### 3. Generate Synthetic Data
Navigate to the `data-generator` directory and run the Python script to seed the database with 50,000 realistic records spanning 2 years.
```bash
cd data-generator
pip install mysql-connector-python faker
python generate_data.py
```

### 4. Running the Application
A convenience script `start_all.bat` is provided for Windows users to start both the frontend and backend simultaneously.

Alternatively, you can run them manually:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📝 Deployment Notes

For production deployments:
1. **Frontend:** Build the static assets using `npm run build` and serve via Nginx, Vercel, or AWS S3/CloudFront.
2. **Backend:** Compile TypeScript to JavaScript `npx tsc` and run the server using `pm2` or deploy as a Docker container.
3. **Database:** Ensure proper connection pooling is configured and read replicas are utilized if analytical querying volume grows.

## 🧪 Testing

To run the backend health checks and basic testing:
```bash
cd backend
npm test
```
