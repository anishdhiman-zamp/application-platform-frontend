import type { RecentItem } from '@/modules/macs/types';

// Mock recently visited items - replace with actual API data
export const MOCK_RECENT_ITEMS: RecentItem[] = [
  { id: '1', title: 'Daily Liquidity Summary', type: 'page', icon: 'FileText' },
  { id: '2', title: 'Cash Summary', type: 'dashboard', icon: 'LayoutDashboard' },
  { id: '3', title: 'Accounts Payable Report', type: 'report', icon: 'FileBarChart' },
];
