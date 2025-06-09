'use client';
import { useEffect } from 'react';
import { LicenseManager as LicenseManagerCharts } from 'ag-charts-enterprise';
import { LicenseManager } from 'ag-grid-enterprise';
import { AG_CHART_KEY, AG_GRID_KEY } from '@/components/common/agGridTable/agGridTable.constants';

const AgChartInit = () => {
  useEffect(() => {
    LicenseManager.setLicenseKey(AG_GRID_KEY);
    LicenseManagerCharts.setLicenseKey(AG_CHART_KEY);
  }, []);

  return null;
};

export default AgChartInit;
