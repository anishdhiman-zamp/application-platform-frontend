import { Provider } from 'react-redux';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@zamp-platform/ui';
import { LicenseManager as LicenseManagerCharts } from 'ag-charts-enterprise';
import { LicenseManager } from 'ag-grid-enterprise';
import { inter } from 'constants/common.constants';
import { FAVICON } from 'constants/icons';
import { FeatureFlagsProvider } from 'modules/feature-flags/provider';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import ErrorBoundary from 'pages/ErrorBoundary';
import posthogJs from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { store } from 'store';
import { NextPageWithLayout } from 'types/commonTypes';
import { initializePostHog } from 'utils/postHog';
import { AG_CHART_KEY, AG_GRID_KEY } from 'components/common/agGridTable/agGridTable.constants';
import { AuthGuard } from 'components/hoc/AuthGuard';
import { RouteGuard } from 'components/hoc/RouteGuard';
import NetworkStatus from 'components/NetWorkStatus';
import '@zamp-platform/ui/globals.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'styles/ag-styles.css';
import 'styles/common.css';
import 'styles/react-datepicker.css';
import 'styles/react-dates.css';

LicenseManager.setLicenseKey(AG_GRID_KEY);
LicenseManagerCharts.setLicenseKey(AG_CHART_KEY);

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: any) => page);

  const getComponent = () => {
    return <div>{getLayout(<Component {...pageProps} />)}</div>;
  };

  initializePostHog();

  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Zamp</title>
        <link rel='icon' type='image/x-icon' href={FAVICON} />
      </Head>
      <div className={inter.className}>
        <NetworkStatus />
        <ErrorBoundary>
          <SpeedInsights />
          <Provider store={store}>
            <PostHogProvider client={posthogJs}>
              <AuthGuard loginRoute='/login'>
                <FeatureFlagsProvider>
                  <RouteGuard>
                    <div className={'h-screen light-mode'}>{getComponent()}</div>
                  </RouteGuard>
                  <Toaster />
                </FeatureFlagsProvider>
              </AuthGuard>
            </PostHogProvider>
          </Provider>
        </ErrorBoundary>
      </div>
    </>
  );
}
