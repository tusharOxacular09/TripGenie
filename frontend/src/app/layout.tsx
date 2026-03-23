import type { Metadata } from "next";
import { AuthBootstrapper } from "../features/auth/auth-bootstrapper";
import { StoreProvider } from "../store/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripGenie",
  description: "AI-powered trip planning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <StoreProvider>
          <AuthBootstrapper />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
