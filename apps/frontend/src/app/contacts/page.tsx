"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/apiFetch";
import Link from "next/link";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      const response = await apiFetch(`/contacts?q=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error("Failed to fetch contacts");
      }
      setLoading(false);
    };

    fetchContacts();
  }, [searchQuery]);

  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>Contacts</h1>
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="Search contacts by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flexGrow: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />
      </div>
      {loading ? (
        <div>Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div>No contacts found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e6ebf2" }}>
              <th style={{ padding: "10px 0", textAlign: "left" }}>Name</th>
              <th style={{ padding: "10px 0", textAlign: "left" }}>Phone</th>
              <th style={{ padding: "10px 0", textAlign: "left" }}>Email</th>
              <th style={{ padding: "10px 0", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} style={{ borderBottom: "1px solid #e6ebf2" }}>
                <td style={{ padding: "10px 0" }}>{contact.name}</td>
                <td style={{ padding: "10px 0" }}>{contact.phone}</td>
                <td style={{ padding: "10px 0" }}>{contact.email}</td>
                <td style={{ padding: "10px 0", textAlign: "right" }}>
                  <Link href={`/contacts/${contact.id}`} className="btn-outline">Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}