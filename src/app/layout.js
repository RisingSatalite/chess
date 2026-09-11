import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: "Boardgames",
  description: "Multiple boardgames.",
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
