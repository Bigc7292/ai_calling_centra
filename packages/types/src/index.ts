export interface DailyMetric {
  day: string;
  calls_out: number;
  answered: number;
  meetings: number;
  minutes_total: number;
  cost_total: number;
}

export interface CampaignKpi {
  id: string;
  name: string;
  calls_out: number;
  answered: number;
  meetings: number;
  cost_total: number;
  cost_per_meeting: number;
}

export interface AssistantKpi {
  id: string;
  name: string;
  calls_out: number;
  answered: number;
  meetings: number;
  cost_total: number;
  cost_per_meeting: number;
}

export interface AgentKpi {
  agent: string;
  calls_out: number;
  answered: number;
  meetings: number;
  aht_seconds: number;
  cost_total: number;
  cost_per_meeting: number;
}

export interface HourOfDayRow {
  dow_local: number; // 0 for Sunday, 6 for Saturday
  hour_local: number; // 0-23
  calls_out: number;
  answered: number;
  meetings: number;
  answer_rate: number; // calculated client-side if needed
  meeting_rate: number; // calculated client-side if needed
}

export interface GeoMeetingRow {
  lat: number;
  lon: number;
  city: string;
  country: string;
  starts_at: string;
  meetings: number;
}
