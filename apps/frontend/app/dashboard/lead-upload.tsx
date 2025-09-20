// app/dashboard/lead-upload.tsx
// PRD v1.3, Section 2: Lead Manager table in dashboard

"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { parseCSV, hashLead } from "../../lib/csv-parser";
import { useAuth } from "../../components/AuthProvider";

export default function LeadUpload() {
  const [leads, setLeads] = useState([]);
  const [hashes, setHashes] = useState([]);
  const { user, session } = useAuth();

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const parsedLeads = await parseCSV(file);
    setLeads(parsedLeads);

    // PRD v1.3, Section 4: Client-side hash each row PII
    const nonce = Date.now(); // Simple nonce
    const leadHashes = parsedLeads.map(lead => hashLead(lead, nonce));
    setHashes(leadHashes);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone", cell: ({ getValue }) => `****${getValue().slice(-4)}` },
    { id: 'hash', header: "Hash Preview", cell: ({ row }) => hashes[row.index]?.slice(0, 10) + "..." },
  ];

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleUpload = async () => {
    const message = JSON.stringify(leads);
    // This is a simplified example. In a real app, you'd use a library like ethers.js to sign the message with the user's private key.
    // const signature = await session.provider.getSigner().signMessage(message);
    const signature = "0x000"; // Placeholder

    const res = await fetch("/api/contacts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ leads, walletSignature: signature }),
    });

    if (res.ok) {
      // Show success toast
    } else {
      // Show error toast
    }
  };

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center cursor-pointer">
        <input {...getInputProps()} />
        <p>Drag 'n' drop a CSV file here, or click to select a file</p>
      </div>

      {leads.length > 0 && (
        <>
          <table className="min-w-full divide-y divide-gray-200 mt-4">
            {/* ... TanStack Table rendering ... */}
          </table>
          <button onClick={handleUpload} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            Upload Leads
          </button>
        </>
      )}
    </div>
  );
}
