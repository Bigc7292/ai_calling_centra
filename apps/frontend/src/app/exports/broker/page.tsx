"use client";

import { useState } from "react";
import { apiFetch } from "../../../lib/apiFetch";

export default function BrokerExportPage() {
  const [campaignId, setCampaignId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownloadCSV = async () => {
    setLoading(true);
    let url = `/exports/broker?`;
    if (campaignId) url += `campaignId=${campaignId}&`;
    if (fromDate) url += `from=${fromDate}&`;
    if (toDate) url += `to=${toDate}&`;

    try {
      const response = await apiFetch(url, { method: "GET" });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "broker_export.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download CSV. Please check filters and try again.");
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("An error occurred while downloading the CSV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>Broker Export</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 15, marginBottom: 20 }}>
        <div>
          <label htmlFor="campaignId" style={{ display: "block", marginBottom: 5 }}>Campaign ID (Optional):</label>
          <input
            type="text"
            id="campaignId"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </div>
        <div>
          <label htmlFor="fromDate" style={{ display: "block", marginBottom: 5 }}>From Date (Optional):</label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </div>
        <div>
          <label htmlFor="toDate" style={{ display: "block", marginBottom: 5 }}>To Date (Optional):</label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </div>
        <button onClick={handleDownloadCSV} disabled={loading} className="btn">
          {loading ? "Downloading..." : "Download CSV"}
        </button>
      </div>
    </div>
  );
}