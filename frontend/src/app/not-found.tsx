"use client";

import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

export default function GlobalNotFoundPage() {
  return (
    <main id="main-content" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f6fb] px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-10 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl"
      />

      <section className="shadow-card relative w-full max-w-2xl rounded-3xl border border-indigo-100/80 bg-white/95 p-8 text-center backdrop-blur sm:p-10">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Oops, wrong route
        </div>

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/70">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>

        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Error 404</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 sm:text-base">
          The page you are trying to open does not exist anymore, may be private, or the URL is incorrect.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-500"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to Login
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Need help? Start from dashboard or sign in again to continue planning your trip.
        </p>
      </section>
    </main>
  );
}
