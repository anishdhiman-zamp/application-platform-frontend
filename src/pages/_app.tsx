import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { LicenseManager } from 'ag-grid-enterprise';
import { SIZE } from 'constants/common.constants';
import { FAVICON } from 'constants/icons';
import { FeatureFlagsProvider } from 'modules/feature-flags/provider';
import { AuthGuard } from 'modules/login/AuthGuard';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { store } from 'store';
import { NextPageWithLayout } from 'types/commonTypes';
import { AG_GRID_KEY } from 'components/common/agGridTable/agGridTable.constants';
import { Loader } from 'components/common/loader/Loader';
import 'styles/fonts.css';
import 'styles/globals.css';
import 'styles/colors.css';
import 'styles/react-datepicker.css';
import 'styles/react-dates.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'react-toastify/dist/ReactToastify.css';

// Configure the Inter font
const inter = Inter({
  subsets: ['latin'], // Specify subsets you need (e.g., 'latin', 'latin-ext').
  variable: '--font-inter', // Define a CSS variable to use in your styles.
  display: 'swap', // Controls font-display behavior.
});

LicenseManager.setLicenseKey(AG_GRID_KEY);

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: any) => page);

  const getComponent = () => {
    return <div>{getLayout(<Component {...pageProps} />)}</div>;
  };

  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Zamp Platform</title>
        <link rel='icon' type='image/x-icon' href={FAVICON} />
      </Head>
      <Provider store={store}>
        <AuthGuard
          loader={
            <div className='flex w-full h-screen items-center justify-center'>
              <Loader size={SIZE.LARGE} />
            </div>
          }
          loginRoute='/login'
        >
          <FeatureFlagsProvider>
            <ToastContainer />
            <div className={`${inter.className} h-screen light-mode`}>{getComponent()}</div>
          </FeatureFlagsProvider>
        </AuthGuard>
      </Provider>
    </>
  );
}
