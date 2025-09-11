"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/apiFetch";

interface ContactDetail {
  contact: {
    id: string;
    name: string;
    phone: string;
    email: string;
    [key: string]: any;
  };
  calls: any[];
  transcripts: any[];
  meetings: any[];
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [contactDetail, setContactDetail] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactDetail = async () => {
      setLoading(true);
      const response = await apiFetch(`/contacts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContactDetail(data);
      } else {
        console.error("Failed to fetch contact details");
      }
      setLoading(false);
    };

    if (id) {
      fetchContactDetail();
    }
  }, [id]);

  if (loading) {
    return <div>Loading contact details...</div>;
  }

  if (!contactDetail) {
    return <div>Contact not found.</div>;
  }

  const { contact, calls, transcripts, meetings } = contactDetail;

  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>{contact.name}</h1>
      <p><strong>Phone:</strong> {contact.phone}</p>
      <p><strong>Email:</strong> {contact.email || "N/A"}</p>

      <h2>Latest Summary</h2>
      <div className="card" style={{ marginBottom: 20 }}>
        <p>No summary available yet.</p>
      </div>

      <h2>Transcripts</h2>
      <div className="card" style={{ marginBottom: 20 }}>
        {transcripts.length === 0 ? (
          <p>No transcripts available.</p>
        ) : (
          // Render expandable transcripts here
          <p>Transcripts will be displayed here.</p>
        )}
      </div>

      <h2>Meeting Links</h2>
      <div className="card" style={{ marginBottom: 20 }}>
        {meetings.length === 0 ? (
          <p>No meeting links available.</p>
        ) : (
          // Render meeting links here
          <p>Meeting links will be displayed here.</p>
        )}
      </div>

      <h2>Call History</h2>
      <div className="card">
        {calls.length === 0 ? (
          <p>No call history available.</p>
        ) : (
          // Render call history here
          <p>Call history will be displayed here.</p>
        )}
      </div>
    </div>
  );
}