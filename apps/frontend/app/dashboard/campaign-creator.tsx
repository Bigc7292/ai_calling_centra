// app/dashboard/campaign-creator.tsx
// PRD v1.3, Section 2: Campaign Creator wizard

"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../components/AuthProvider";

export default function CampaignCreator({ leads }) {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [startDate, setStartDate] = useState(new Date());
  const { session } = useAuth();

  const onSubmit = async (data) => {
    const res = await fetch(`/api/campaigns?start=${data.quickStart}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(data),
    });
    // Handle response
  };

  const handleSuggestScript = async () => {
      // PRD v1.3, Section 4: Gemini Integration
      const res = await fetch("/api/gemini/suggest", {
          method: "POST",
          body: JSON.stringify({ industry: 'real-estate', goal: 'qualification' })
      });
      const { script } = await res.json();
      setValue("script", script);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Step 1: Name/Schedule */}
      <input {...register("name")} placeholder="Campaign Name" />
      <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />

      {/* Step 2: Script */}
      <textarea {...register("script")} placeholder="Call Script" />
      <button type="button" onClick={handleSuggestScript}>Suggest Script</button>

      {/* Step 3: Select Leads */}
      <select multiple {...register("leads")}>
        {leads.map(lead => (
          <option key={lead.id} value={lead.id}>{lead.name}</option>
        ))}
      </select>

      {/* Step 4: Quick Start */}
      <label>
        <input type="checkbox" {...register("quickStart")} />
        Quick Start
      </label>

      <button type="submit">Create Campaign</button>
    </form>
  );
}
