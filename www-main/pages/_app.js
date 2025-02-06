import 'tailwindcss/tailwind.css'; // Import Tailwind CSS
import '../styles/globals.css'; // Any custom global styles you have

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
