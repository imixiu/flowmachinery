import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "FlowMachinery — Precision Industrial Machinery & Automation Solutions",
  description: "FlowMachinery delivers high-performance CNC machines, hydraulic systems, industrial automation, and manufacturing equipment. Trusted by 2,000+ manufacturers worldwide since 1998.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-95PY8PSZ0Y"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-95PY8PSZ0Y');
          `}
        </Script>
        {children}<Analytics /></body>
    </html>
  );
}
