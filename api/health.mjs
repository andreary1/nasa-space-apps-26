// Vercel: GET /api/health — informa se a IA está configurada (sem expor a chave).
import { providerConfig } from '../scripts/ai_reports/ai_client.mjs';

export default function handler(req, res) {
  let configured = true;
  let model = null;
  try { model = providerConfig().model; } catch { configured = false; }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, hosted: true, configured, provider: process.env.AI_PROVIDER || 'gemini', model });
}
