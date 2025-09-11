"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/apiFetch";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import { DailyMetric, CampaignKpi, AssistantKpi, AgentKpi, HourOfDayRow, GeoMeetingRow } from "@eva/types";

const MeetingGeoMap = dynamic(() => import('../../components/dashboard/MeetingGeoMap'), { ssr: false });

const DayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardPage() {
  const [dailyData, setDailyData] = useState<DailyMetric[]>([]);
  const [campaignKpis, setCampaignKpis] = useState<CampaignKpi[]>([]);
  const [assistantKpis, setAssistantKpis] = useState<AssistantKpi[]>([]);
  const [agentKpis, setAgentKpis] = useState<AgentKpi[]>([]);
  const [hourOfDayData, setHourOfDayData] = useState<HourOfDayRow[]>([]);
  const [geoMeetingData, setGeoMeetingData] = useState<GeoMeetingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dailyRes, campaignsRes, assistantsRes, agentsRes, hourRes, geoRes] = await Promise.all([
          apiFetch("/analytics/daily"),
          apiFetch("/analytics/campaigns"),
          apiFetch("/analytics/assistants"),
          apiFetch("/analytics/agents"),
          apiFetch("/analytics/hourly"),
          apiFetch("/analytics/geo"),
        ]);

        if (dailyRes.ok) setDailyData(await dailyRes.json());
        if (campaignsRes.ok) setCampaignKpis(await campaignsRes.json());
        if (assistantsRes.ok) setAssistantKpis(await assistantsRes.json());
        if (agentsRes.ok) setAgentKpis(await agentsRes.json());
        if (hourRes.ok) setHourOfDayData(await hourRes.json());
        if (geoRes.ok) setGeoMeetingData(await geoRes.json());

      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const costPerMeetingData = dailyData.map(d => ({
    day: d.day,
    cost_per_meeting: d.meetings > 0 ? (d.cost_total / d.meetings).toFixed(2) : 0,
  }));

  const hourOfDayGrid: (HourOfDayRow | null)[][] = Array(7).fill(null).map(() => Array(24).fill(null));
  hourOfDayData.forEach(row => {
    if (row.dow_local >= 0 && row.dow_local < 7 && row.hour_local >= 0 && row.hour_local < 24) {
      hourOfDayGrid[row.dow_local][row.hour_local] = row;
    }
  });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>

      {loading ? (
        <div>Loading dashboard data...</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <h2>Daily Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calls_out" stroke="#8884d8" name="Calls Out" />
                <Line type="monotone" dataKey="answered" stroke="#82ca9d" name="Answered" />
                <Line type="monotone" dataKey="meetings" stroke="#ffc658" name="Meetings Booked" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2>Cost per Meeting (USD)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costPerMeetingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cost_per_meeting" stroke="#ff7300" name="Cost per Meeting" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2>Campaign KPIs</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e6ebf2" }}>
                  <th style={{ padding: "10px 0", textAlign: "left" }}>Campaign</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Calls Out</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Answered</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Meetings</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Cost Total</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Cost per Meeting</th>
                </tr>
              </thead>
              <tbody>
                {campaignKpis.map((kpi) => (
                  <tr key={kpi.id} style={{ borderBottom: "1px solid #e6ebf2" }}>
                    <td style={{ padding: "10px 0" }}>{kpi.name}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.calls_out}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.answered}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.meetings}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>${kpi.cost_total.toFixed(2)}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>${kpi.cost_per_meeting.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2>Assistant Leaderboard</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e6ebf2" }}>
                  <th style={{ padding: "10px 0", textAlign: "left" }}>Assistant</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Calls Out</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Answered</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Meetings</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Cost Total</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Cost per Meeting</th>
                </tr>
              </thead>
              <tbody>
                {assistantKpis.map((kpi) => (
                  <tr key={kpi.id} style={{ borderBottom: "1px solid #e6ebf2" }}>
                    <td style={{ padding: "10px 0" }}>{kpi.name}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.calls_out}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.answered}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.meetings}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>${kpi.cost_total.toFixed(2)}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>${kpi.cost_per_meeting.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2>Agent Leaderboard</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e6ebf2" }}>
                  <th style={{ padding: "10px 0", textAlign: "left" }}>Agent</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Calls Out</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Answered</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Meetings</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>AHT (s)</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Cost Total</th>
                  <th style={{ padding: "10px 0", textAlign: "right" }}>Cost per Meeting</th>
                </tr>
              </thead>
              <tbody>
                {agentKpis.map((kpi) => (
                  <tr key={kpi.agent} style={{ borderBottom: "1px solid #e6ebf2" }}>
                    <td style={{ padding: "10px 0" }}>{kpi.agent}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.calls_out}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.answered}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.meetings}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>{kpi.aht_seconds.toFixed(0)}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>${kpi.cost_total.toFixed(2)}</td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>${kpi.cost_per_meeting.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2>Hour-of-Day Heatmap (Answer Rate)</h2>
            <div style={{ display: "grid", gridTemplateColumns: "30px repeat(24, 1fr)", gap: "2px", fontSize: "12px" }}>
              <div style={{ fontWeight: "bold" }}></div>
              {Array(24).fill(null).map((_, hour) => (
                <div key={hour} style={{ textAlign: "center", fontWeight: "bold" }}>{hour}</div>
              ))}
              {hourOfDayGrid.map((day, dow) => (
                <>
                  <div key={`day-label-${dow}`} style={{ fontWeight: "bold" }}>{DayNames[dow]}</div>
                  {day.map((hourData, hour) => {
                    const answerRate = hourData ? (hourData.answered / Math.max(1, hourData.calls_out)) : 0;
                    const bgColor = `rgba(52, 93, 168, ${answerRate})`; // Varying blue based on answer rate
                    return (
                      <div
                        key={`cell-${dow}-${hour}`}
                        style={{
                          background: bgColor,
                          padding: "5px",
                          textAlign: "center",
                          borderRadius: "4px",
                          color: answerRate > 0.5 ? "white" : "black",
                        }}
                        title={hourData ? `Calls: ${hourData.calls_out}, Answered: ${hourData.answered}, Rate: ${(answerRate * 100).toFixed(1)}%` : "No data"}
                      >
                        {hourData ? (answerRate * 100).toFixed(0) : '-'}%
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2>Meeting Geography</h2>
            <MeetingGeoMap meetingGeos={geoMeetingData} />
          </div>
        </>
      )}
    </div>
  );
}
