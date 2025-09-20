// lib/react-flow-config.ts
// PRD v1.3, Section 2: React Flow custom nodes/edges definitions

import { MarkerType } from 'reactflow';

export const nodeTypes = {
  // Define custom nodes if needed
};

export const defaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
};
