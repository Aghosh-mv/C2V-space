import type { Metadata } from 'next';
import { Clapperboard, CloudUpload, Lock, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy & terms',
  description: 'What C2V space stores, what it never collects, and the terms of using the Studio and Marketplace.',
};

const card = 'rounded-3xl border bg-white p-6 shadow-sm';
const iconWrap = 'flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#f7f6fa]">
      <header className="border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-2.5 px-4">
          <a href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-teal-400 text-white shadow-md">
              <Clapperboard className="h-5 w-5" />
            </span>
            <span className="text-[15.5px] font-semibold tracking-tight text-zinc-900">C2V space</span>
          </a>
          <a
            href="/"
            className="ml-auto rounded-full border bg-white px-4 py-1.5 text-[12.5px] font-medium text-zinc-600 shadow-sm transition-colors hover:border-violet-300 hover:text-zinc-900"
          >
            Back to the Studio
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Privacy &amp; terms</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-zinc-500">
          C2V space is free, global and anonymous by default. This page says plainly what the service stores, what it
          never collects, and the few rules that keep the Marketplace healthy.
        </p>

        <div className="mt-8 grid gap-4">
          <section className={card}>
            <div className="flex items-center gap-3">
              <span className={iconWrap}>
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="text-[16px] font-semibold text-zinc-900">No accounts, no tracking</h2>
            </div>
            <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-zinc-600">
              <p>
                There are no sign-ups, no emails and no passwords. Your browser generates a random id the first time you
                open the app; that id is the only key your cloud copy, history and library hang off. It contains no
                personal information and we cannot link it to a person.
              </p>
              <p>
                We do not run ads, analytics or third-party trackers. Nothing about your browsing is profiled or sold.
              </p>
            </div>
          </section>

          <section className={card}>
            <div className="flex items-center gap-3">
              <span className={iconWrap}>
                <CloudUpload className="h-5 w-5" />
              </span>
              <h2 className="text-[16px] font-semibold text-zinc-900">What is stored where</h2>
            </div>
            <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-zinc-600">
              <p>
                <strong className="font-medium text-zinc-800">On your device (always):</strong> your current SceneLang and
                StyleKit code, installed styles, imported files and recent history snapshots live in your browser&apos;s
                local storage. Media files you import — images, CSV data, text — never leave your device; only code is
                synced.
              </p>
              <p>
                <strong className="font-medium text-zinc-800">On the server (a durable second copy):</strong> your code
                mirror, your history snapshots and any Marketplace listings you publish are stored in the app&apos;s
                database under your anonymous id, so they survive a cleared browser. You can wipe everything at any time
                by clearing this site&apos;s data and asking the server to forget your id.
              </p>
              <p>
                <strong className="font-medium text-zinc-800">Your code is yours.</strong> We treat everything you write
                as your property, do not reuse it, and only publish what you explicitly publish.
              </p>
            </div>
          </section>

          <section className={card}>
            <div className="flex items-center gap-3">
              <span className={iconWrap}>
                <Lock className="h-5 w-5" />
              </span>
              <h2 className="text-[16px] font-semibold text-zinc-900">Marketplace rules</h2>
            </div>
            <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-zinc-600">
              <p>
                Listings are validated by the server before they go live: the code must actually parse, sizes are capped,
                and metadata is checked. Keep listings yours to share, keep names honest, and do not use the marketplace
                to distribute anything unlawful or malicious. Listings that break these rules can be removed.
              </p>
              <p>
                The premade catalog is free for everyone, forever. Creators may price their own work; payments are not
                wired to a payment processor yet, so priced listings record ownership without moving money.
              </p>
            </div>
          </section>

          <section className={card}>
            <div className="flex items-center gap-3">
              <span className={iconWrap}>
                <Clapperboard className="h-5 w-5" />
              </span>
              <h2 className="text-[16px] font-semibold text-zinc-900">The service itself</h2>
            </div>
            <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-zinc-600">
              <p>
                C2V space is provided as-is, free of charge, with no warranty. Exports are computed in your browser;
                rendering quality and availability can depend on your device and connection. Don&apos;t abuse the service:
                no attempts to overload, probe or break it, for you or for others.
              </p>
              <p className="text-[12.5px] text-zinc-400">
                Questions or takedown requests? Open an issue on the project repository.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-auto border-t bg-white/70 py-4">
        <p className="text-center text-[12px] text-zinc-500">C2V space — free, global, premium.</p>
      </footer>
    </div>
  );
}
