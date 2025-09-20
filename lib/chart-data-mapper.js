// lib/chart-data-mapper.ts
// PRD v1.3, Section 5: Utility to map API response to Recharts format
export function mapToFunnelData(apiData) {
    return [
        { name: 'Called', value: apiData.called },
        { name: 'Engaged', value: apiData.engaged },
        { name: 'Booked', value: apiData.booked },
    ];
}
export function mapToHeatmapData(apiData) {
    // Further processing might be needed depending on the chart library
    return apiData;
}
