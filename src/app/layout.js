import './globals.css';

export const metadata = {
  title: 'RYDEBLK',
  description: 'RYDEBLK - Ride booking with Jamie',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
