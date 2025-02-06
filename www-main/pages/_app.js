// @ts-check
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { datadogRum } from '@datadog/browser-rum';
import { Analytics } from '@vercel/analytics/react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import { CookiesProvider } from 'react-cookie';
import CartProvider from '../context/cart';
import UserDataProvider from '../context/user';
import * as fbpixel from '../lib/fbpixel';
import * as gtag from '../lib/gtag';
import { BT_CONSOLE_COLORS } from '../utils/constants';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

const isProduction = process.env.NEXT_PUBLIC_APPLICATION_ENV === 'production';
const isPreview = process.env.NEXT_PUBLIC_APPLICATION_ENV === 'preview';
const isDevelopment = process.env.NEXT_PUBLIC_APPLICATION_ENV === 'development';

if (isProduction) {
  datadogRum.init({
    applicationId: '45dbc7ed-dc32-410c-b8c1-cde26bd3f03d',
    clientToken: 'pube14ed6b4863fca2e66e9f5db2e8e1b14',
    site: 'datadoghq.com',
    service: 'bright-trip-website',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'unknown',
    sampleRate: 100,
    trackInteractions: true,
    trackUserInteractions: true,
    trackFrustrations: true,
    defaultPrivacyLevel: 'mask-user-input',
  });

  datadogRum.startSessionReplayRecording();
} else {
  console.info(
    "%cWould've initialized datadog session recordings in production",
    ['background: #5A2AA1', 'color: white', ...BT_CONSOLE_COLORS].join(';')
  );
}

function MyApp({ Component, pageProps }) {
  const [queryClient] = useState(new QueryClient());
  const router = useRouter();

  useEffect(() => {
    // @ts-expect-error this isn't a typescript file so we can't cast this string as Action
    fbpixel.event('track', fbpixel.StandardEvent.PageView);
  }, []);

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
      // @ts-expect-error this isn't a typescript file so we can't cast this string as Action
      fbpixel.event('track', fbpixel.StandardEvent.PageView);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <CookiesProvider>
          <UserProvider>
            <UserDataProvider>
              <CartProvider>
                <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=G-JTPD402CWK`} />
                <Script
                  id="gaScript"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JTPD402CWK', {
              page_path: window.location.pathname,
            });
            gtag('config','AW-734177645');
          `,
                  }}
                />
                <Script strategy="afterInteractive" id="facebook-pixel">
                  {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '920946918733645');
      `}
                </Script>
                <Script
                  strategy="afterInteractive"
                  src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
                />
                <Component {...pageProps} />
                <Analytics />
                {isDevelopment || isPreview ? (
                  <div
                    className={`fixed top-4 left-4 z-50 opacity-80 ${
                      isDevelopment ? 'bg-indigo-700' : 'bg-cyan-500'
                    } rounded-lg px-3 py-2 font-extrabold text-white`}
                  >
                    {(process.env.NEXT_PUBLIC_APPLICATION_ENV ?? '').toUpperCase()}
                  </div>
                ) : null}
              </CartProvider>
            </UserDataProvider>
          </UserProvider>
        </CookiesProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
