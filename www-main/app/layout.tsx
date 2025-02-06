import { datadogRum } from '@datadog/browser-rum';
import { Analytics } from '@vercel/analytics/react';
import Auth0UserProvider from 'components/appRouter/Auth0UserProvider';
import QCProvider from 'components/appRouter/QCProvider';
import Footer from 'components/Footer';
import Navbar from 'components/Navbar';
import CartProvider from 'context/cart';
import Script from 'next/script';
import { ReactNode } from 'react';
import 'styles/globals.css';
import 'tailwindcss/tailwind.css';
import { BT_CONSOLE_COLORS } from 'utils/constants';

const isProduction = process.env.NEXT_PUBLIC_APPLICATION_ENV === 'production';

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
      <Auth0UserProvider>
        <QCProvider>
          <CartProvider>
            <body>
              <header>
                <Navbar />
              </header>
              {children}
              <Footer />
            </body>
          </CartProvider>
        </QCProvider>
      </Auth0UserProvider>
      <Analytics />
    </html>
  );
}
