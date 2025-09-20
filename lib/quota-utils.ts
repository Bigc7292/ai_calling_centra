// lib/quota-utils.ts
// PRD v1.3, Section 2: UX Flows

export function getQuotaPercentage(quota, plan) {
    const maxQuota = plan === 'trial' ? 100 : 1000; // Simplified
    return (quota / maxQuota) * 100;
}

export function showLowQuotaToast() {
    // In a real app, you would use a toast library like react-hot-toast
    console.warn("Low quota – Add card?");
}
