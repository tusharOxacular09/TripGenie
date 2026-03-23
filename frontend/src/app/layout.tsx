import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AuthBootstrapper } from "../features/auth/auth-bootstrapper";
import { StoreProvider } from "../store/provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "TripGenie - AI Travel Planner",
    template: "%s | TripGenie",
  },
  description:
    "Plan smarter trips with AI-generated itineraries, budget estimates, and hotel suggestions tailored to your destination and interests.",
  applicationName: "TripGenie",
  keywords: ["TripGenie", "AI travel planner", "trip itinerary", "travel budget planner", "hotel suggestions"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TripGenie - AI Travel Planner",
    description:
      "Generate personalized travel itineraries with AI, estimate trip costs, and edit plans day by day.",
    type: "website",
    siteName: "TripGenie",
  },
  twitter: {
    card: "summary_large_image",
    title: "TripGenie - AI Travel Planner",
    description:
      "Generate personalized travel itineraries with AI, estimate trip costs, and edit plans day by day.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} ${plusJakarta.variable} min-h-screen antialiased`}>
        <StoreProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 focus:shadow-card"
          >
            Skip to main content
          </a>
          <AuthBootstrapper />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
