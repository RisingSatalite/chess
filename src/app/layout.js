import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: "Chess",
  description: "A focused chess board game.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={``}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
