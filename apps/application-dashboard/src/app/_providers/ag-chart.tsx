'use client';
import { LicenseManager as LicenseManagerCharts } from 'ag-charts-enterprise';
import { setupAgTestIds } from 'ag-grid-community';
import { LicenseManager } from 'ag-grid-enterprise';
import { AG_CHART_KEY, AG_GRID_KEY } from '@/components/common/agGridTable/agGridTable.constants';

const AgChartInit = () => {
  LicenseManager.setLicenseKey(AG_GRID_KEY);
  LicenseManagerCharts.setLicenseKey(AG_CHART_KEY);

  if (process.env.NODE_ENV !== 'production') {
    console.log('Setting up Ag Grid Test IDs');
    setupAgTestIds();
  }

  return null;
};

export default AgChartInit;
