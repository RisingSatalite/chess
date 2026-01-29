import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: "Chess App",
  description: "Chess app made with Next",
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
