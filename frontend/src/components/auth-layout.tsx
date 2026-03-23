"use client";

import Link from "next/link";
import { Plane } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <section
        aria-hidden="true"
        className="relative hidden lg:flex lg:w-1/2 overflow-hidden items-center justify-center p-12 bg-indigo-600"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-500" />
        <div className="relative z-10 text-center space-y-6 text-indigo-50">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100/20 flex items-center justify-center">
              <Plane className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <span className="font-display text-3xl font-bold">TripGenie</span>
          </div>
          <p className="text-indigo-100/90 text-lg max-w-md mx-auto leading-relaxed">
            Your AI-powered travel companion. Plan smarter trips with personalized itineraries, budget optimization,
            and local insights.
          </p>
          <div className="flex gap-8 justify-center pt-8">
            {[
              { label: "Trips Planned", value: "12K+" },
              { label: "Countries", value: "180+" },
              { label: "Happy Travelers", value: "8K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-indigo-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-100/5" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-100/5" />
      </section>

      <main id="main-content" className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6" role="region" aria-label="Authentication form">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <Link href="/login" className="font-display text-xl font-bold text-slate-900">
              TripGenie
            </Link>
          </div>
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="font-display text-3xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
