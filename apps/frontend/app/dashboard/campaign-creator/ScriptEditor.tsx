// app/dashboard/campaign-creator/ScriptEditor.tsx
// PRD v1.3, Section 2: React Flow component with Gemini button

"use client";

import { useState, useCallback } from 'react';
import ReactFlow, { addEdge, applyEdgeChanges, applyNodeChanges, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes, defaultEdgeOptions } from '../../../lib/react-flow-config';

export default function ScriptEditor() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), []);

  const handleSuggestScript = async () => {
    const res = await fetch("/api/ai/suggest-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry: "real-estate", goal: "qualification" }),
    });
    const { script } = await res.json();
    setNodes(script.nodes);
    setEdges(script.edges);
  };

  return (
    <div style={{ height: 500 }}>
        <button onClick={handleSuggestScript}>Suggest Script</button>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
        >
            <Controls />
            <Background />
        </ReactFlow>
    </div>
  );
}
