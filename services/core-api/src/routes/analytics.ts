import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "@eva/config/dist"; // Explicitly point to dist for ES module resolution
import { authMiddleware } from "../auth.js"; // Added .js extension
import { AgentKpi, AssistantKpi, CampaignKpi, DailyMetric, GeoMeetingRow, HourOfDayRow } from "@eva/types";

const analyticsRouter = Router();
const env = loadEnv();
const supaServiceRole = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// All analytics routes require authentication
analyticsRouter.use(authMiddleware);

// Mock data functions (replace with actual DB calls later)
const getMockDailyMetrics = (tenantId: string): DailyMetric[] => [
  { day: "2023-10-01", calls_out: 100, answered: 50, meetings: 10, minutes_total: 200, cost_total: 20 },
  { day: "2023-10-02", calls_out: 120, answered: 60, meetings: 12, minutes_total: 240, cost_total: 24 },
  { day: "2023-10-03", calls_out: 90, answered: 45, meetings: 9, minutes_total: 180, cost_total: 18 },
  { day: "2023-10-04", calls_out: 110, answered: 55, meetings: 11, minutes_total: 220, cost_total: 22 },
  { day: "2023-10-05", calls_out: 130, answered: 65, meetings: 13, minutes_total: 260, cost_total: 26 },
];

const getMockCampaignKpis = (tenantId: string): CampaignKpi[] => [
  { id: "camp1", name: "Summer Leads", calls_out: 500, answered: 250, meetings: 50, cost_total: 500, cost_per_meeting: 10 },
  { id: "camp2", name: "Q4 Prospects", calls_out: 300, answered: 150, meetings: 30, cost_total: 360, cost_per_meeting: 12 },
];

const getMockAssistantKpis = (tenantId: string): AssistantKpi[] => [
  { id: "assist1", name: "Agent Alpha", calls_out: 400, answered: 200, meetings: 40, cost_total: 400, cost_per_meeting: 10 },
  { id: "assist2", name: "Agent Beta", calls_out: 300, answered: 150, meetings: 30, cost_total: 330, cost_per_meeting: 11 },
];

const getMockAgentKpis = (tenantId: string): AgentKpi[] => [
  { agent: "John Doe", calls_out: 200, answered: 100, meetings: 20, aht_seconds: 180, cost_total: 200, cost_per_meeting: 10 },
  { agent: "Jane Smith", calls_out: 150, answered: 75, meetings: 15, aht_seconds: 200, cost_total: 180, cost_per_meeting: 12 },
];

const getMockHourOfDayRows = (tenantId: string): HourOfDayRow[] => [
  { dow_local: 0, hour_local: 9, calls_out: 50, answered: 25, meetings: 5, answer_rate: 0.5, meeting_rate: 0.1 },
  { dow_local: 1, hour_local: 10, calls_out: 60, answered: 30, meetings: 6, answer_rate: 0.5, meeting_rate: 0.1 },
  { dow_local: 2, hour_local: 11, calls_out: 70, answered: 35, meetings: 7, answer_rate: 0.5, meeting_rate: 0.1 },
  { dow_local: 3, hour_local: 12, calls_out: 80, answered: 40, meetings: 8, answer_rate: 0.5, meeting_rate: 0.1 },
  { dow_local: 4, hour_local: 13, calls_out: 90, answered: 45, meetings: 9, answer_rate: 0.5, meeting_rate: 0.1 },
];

const getMockGeoMeetingRows = (tenantId: string): GeoMeetingRow[] => [
  { lat: 34.052235, lon: -118.243683, city: "Los Angeles", country: "USA", starts_at: "2023-10-01T10:00:00Z", meetings: 5 },
  { lat: 40.712776, lon: -74.005974, city: "New York", country: "USA", starts_at: "2023-10-02T11:00:00Z", meetings: 7 },
  { lat: 51.507351, lon: -0.127758, city: "London", country: "UK", starts_at: "2023-10-03T14:00:00Z", meetings: 3 },
  { lat: 48.856613, lon: 2.352222, city: "Paris", country: "France", starts_at: "2023-10-04T09:30:00Z", meetings: 4 },
  { lat: 35.689487, lon: 139.691711, city: "Tokyo", country: "Japan", starts_at: "2023-10-05T16:00:00Z", meetings: 2 },
];

analyticsRouter.get("/daily", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });
  // In a real scenario, fetch from v_daily_metrics table
  res.json(getMockDailyMetrics(req.tenantId));
});

analyticsRouter.get("/campaigns", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });
  // In a real scenario, fetch from v_campaign_kpis table
  res.json(getMockCampaignKpis(req.tenantId));
});

analyticsRouter.get("/assistants", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });
  // In a real scenario, fetch from v_assistant_kpis table
  res.json(getMockAssistantKpis(req.tenantId));
});

analyticsRouter.get("/agents", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });

  // In a real scenario, execute SQL query as described in the prompt
  // For now, return mock data
  res.json(getMockAgentKpis(req.tenantId));
});

analyticsRouter.get("/hourly", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });
  // In a real scenario, fetch from v_hour_of_day table
  res.json(getMockHourOfDayRows(req.tenantId));
});

analyticsRouter.get("/geo", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });
  // In a real scenario, fetch from v_geo_meetings table
  res.json(getMockGeoMeetingRows(req.tenantId));
});

export default analyticsRouter;
