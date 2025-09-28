import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../auth.js"; // Added .js extension
import { AgentKpi, AssistantKpi, CampaignKpi, DailyMetric, GeoMeetingRow, HourOfDayRow } from "@eva/types";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: "../../../.env" });

// Load environment variables
const env = {
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!
};

const analyticsRouter = Router();
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
  
  try {
    const { data, error } = await supaServiceRole
      .from('daily_metrics')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('day', { ascending: false })
      .limit(30);
    
    if (error) {
      console.error('Daily metrics query error:', error);
      return res.json(getMockDailyMetrics(req.tenantId));
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Daily metrics error:', err);
    res.json(getMockDailyMetrics(req.tenantId));
  }
});

analyticsRouter.get("/campaigns", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });
  
  try {
    const { data, error } = await supaServiceRole
      .from('campaign_kpis')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('calls_out', { ascending: false });
    
    if (error) {
      console.error('Campaign KPIs query error:', error);
      return res.json(getMockCampaignKpis(req.tenantId));
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Campaign KPIs error:', err);
    res.json(getMockCampaignKpis(req.tenantId));
  }
});

analyticsRouter.get("/assistants", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });
  
  try {
    const { data, error } = await supaServiceRole
      .from('assistant_kpis')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('calls_out', { ascending: false });
    
    if (error) {
      console.error('Assistant KPIs query error:', error);
      return res.json(getMockAssistantKpis(req.tenantId));
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Assistant KPIs error:', err);
    res.json(getMockAssistantKpis(req.tenantId));
  }
});

analyticsRouter.get("/agents", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });

  try {
    const { data, error } = await supaServiceRole
      .from('agent_kpis')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('calls_out', { ascending: false });
    
    if (error) {
      console.error('Agent KPIs query error:', error);
      return res.json(getMockAgentKpis(req.tenantId));
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Agent KPIs error:', err);
    res.json(getMockAgentKpis(req.tenantId));
  }
});

analyticsRouter.get("/hourly", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });
  
  try {
    const { data, error } = await supaServiceRole
      .from('hourly_metrics')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('dow_local', { ascending: true })
      .order('hour_local', { ascending: true });
    
    if (error) {
      console.error('Hourly metrics query error:', error);
      return res.json(getMockHourOfDayRows(req.tenantId));
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Hourly metrics error:', err);
    res.json(getMockHourOfDayRows(req.tenantId));
  }
});

analyticsRouter.get("/geo", async (req: Request, res: Response) => {
  if (!req.tenantId) return res.status(403).json({ error: "Forbidden: No tenant ID." });
  
  try {
    const { data, error } = await supaServiceRole
      .from('geo_meetings')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('starts_at', { ascending: false });
    
    if (error) {
      console.error('Geo meetings query error:', error);
      return res.json(getMockGeoMeetingRows(req.tenantId));
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Geo meetings error:', err);
    res.json(getMockGeoMeetingRows(req.tenantId));
  }
});

export default analyticsRouter;
