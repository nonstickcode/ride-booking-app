import './globals.css';

export const metadata = {
  title: 'RYDEBLK',
  description: 'RYDEBLK - Ride booking with Jamie',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Add iOS meta tags for Home Screen */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  );
}
