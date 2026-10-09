import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export async function getLiveCustomsContext(): Promise<string> {
  try {
    const [summaryRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as totalShipments,
        COALESCE(SUM(tax_collected), 0) as totalRevenue,
        COALESCE(AVG(TIMESTAMPDIFF(MINUTE, arrival_time, release_time)) / 60, 0) as avgDwellHours,
        SUM(CASE WHEN inspection_status = 'Cleared' THEN 1 ELSE 0 END) as clearedCount,
        SUM(CASE WHEN inspection_status = 'Flagged' THEN 1 ELSE 0 END) as flaggedCount,
        SUM(CASE WHEN inspection_status = 'Seized' THEN 1 ELSE 0 END) as seizedCount
      FROM shipments
    `);

    const [alertRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as totalAlerts,
        SUM(CASE WHEN severity = 'critical' AND status = 'active' THEN 1 ELSE 0 END) as criticalAlerts,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeAlerts
      FROM alerts
    `);

    const stats = summaryRows[0] || {};
    const alertStats = alertRows[0] || {};

    const total = Number(stats.totalShipments || 0);
    const clearedPct = total > 0 ? ((Number(stats.clearedCount || 0) / total) * 100).toFixed(1) : '0';
    const flaggedPct = total > 0 ? ((Number(stats.flaggedCount || 0) / total) * 100).toFixed(1) : '0';

    return `
[LIVE CUSTOMS PMM SYSTEM METRICS]:
- Total Shipments Analyzed: ${total.toLocaleString()}
- Total Duty & Taxes Collected: PKR ${(Number(stats.totalRevenue || 0) / 1e6).toFixed(2)} Million
- Average Port Clearance Dwell Time: ${Number(stats.avgDwellHours || 0).toFixed(1)} Hours (WCO Target: < 48 hrs)
- Clearance Status Breakdown: Cleared / Facilitated: ${clearedPct}% | Flagged / Examined: ${flaggedPct}%
- Physical Seizures Recorded: ${Number(stats.seizedCount || 0)}
- Active Security & Revenue Alerts: ${Number(alertStats.activeAlerts || 0)} (Critical Unresolved: ${Number(alertStats.criticalAlerts || 0)})
`;
  } catch (err: any) {
    console.warn('[AI Service] Failed to retrieve live context:', err.message);
    return `[LIVE CUSTOMS PMM CONTEXT]: Operational on Pakistan Customs PMM Portal.`;
  }
}

export async function askGeminiCustomsChat(
  message: string,
  history: ChatMessage[] = [],
  userRole?: string
): Promise<{ reply: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyD22K2ZG41ovftxbqix7DWtjCU9FuKhQNc';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment.');
  }

  const liveContext = await getLiveCustomsContext();

  const systemInstruction = `
You are the "Customs AI Intelligence Officer" (Customs PMM Copilot) for the Pakistan Customs Performance Measurement Mechanism (PMM) Dashboard under the Federal Board of Revenue (FBR).

Key Objectives & Capabilities:
1. Tone: Highly professional, analytical, authoritative yet helpful customs domain expert.
2. Language Policy: You MUST ALWAYS respond in professional, clear, fluent ENGLISH by default. Only reply in Urdu or Roman Urdu if the user specifically and explicitly writes their message in Urdu or Roman Urdu.
3. Domain Knowledge:
   - WCO TRS (Time Release Study): Dwell time from discharge to gate-out, assessment delays, physical exam time, green/yellow/red channels, standard benchmark is < 48 hours.
   - Revenue Intelligence: Custom Duties, Sales Tax, ACD, RD, AIT, HS Code classification, Post Clearance Audit (PCA) yield, under-invoicing and valuation rulings.
   - Risk Management (RMS): Risk selectivity, trade facilitation via Green channel (> 65% recommended by WCO), Red channel physical examination targeting high risk shipments, contraband and trade misinvoicing.
   - Organizational Scorecard: Collectorate operational efficiency, clearance throughput across major collectorates (Port Qasim, Karachi Appraisement East/West, Lahore Dry Port, Peshawar, Islamabad Air Cargo).
   - Alert Monitoring: Dynamic threshold breaches (e.g. dwell time spikes, duty collection gaps, anomaly alerts).
4. System Context:
   You have access to current live PMM metrics:
   ${liveContext}
   ${userRole ? `Current user role: ${userRole}` : ''}

Formatting Guidelines:
- Use clear bullet points and bold section headers.
- Include appropriate contextual emojis (e.g. 🛃, ⏱️, 💰, 🛡️, 📊, ⚡).
- Keep responses direct, insightful, and actionable with practical recommendations for customs collectors, appraisers, and officers.
`;

  // Prepare Gemini contents payload
  // Convert previous history to Gemini contents format
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Add past conversation turns
  for (const h of history.slice(-8)) {
    const role = h.role === 'user' ? 'user' : 'model';
    contents.push({
      role,
      parts: [{ text: h.content }],
    });
  }

  // Add the current user query
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-pro-latest',
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: any = await response.json();
      const candidate = data.candidates?.[0];
      const reply = candidate?.content?.parts?.[0]?.text;

      if (reply) {
        return { reply, model };
      }
    } catch (err: any) {
      console.warn(`[AI Service] Model ${model} failed:`, err.message);
      lastError = err;
      // continue to next model
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API.');
}
