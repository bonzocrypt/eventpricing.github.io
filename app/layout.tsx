import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./content.css";
import { site } from "@/src/config/site";

export const metadata: Metadata = {
  title: `${site.tagline} | ${site.name}`,
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${site.ga4MeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${site.ga4MeasurementId}', {
              anonymize_ip: true,
            });
          `}
        </Script>
      </head>
      <body>
        <header className="siteHeader">
          <div className="container">
            <div className="brand">{site.name}</div>
            <nav className="nav" aria-label="Primary">
              {site.nav.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <main className="pageMain">
          <div className="container">
            <div className="content">{children}</div>
          </div>
        </main>

        <footer className="siteFooter">
          <div className="container">
            <small>
              © {new Date().getFullYear()} {site.name}
            </small>
          </div>
        </footer>
      </body>
    </html>
  );
}
