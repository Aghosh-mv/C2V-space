import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "C2V space — code that becomes video",
    template: "%s · C2V space",
  },
  description:
    "Write plain-word code, get a real video. Two languages (SceneLang + StyleKit), a learn library and a marketplace of styles and templates — free, global, premium.",
  applicationName: "C2V space",
  keywords: ["SceneLang", "code to video", "StyleKit", "animation", "slideshow", "marketplace", "C2V space"],
  openGraph: {
    title: "C2V space — code that becomes video",
    description: "Write code. The compiler films it — frame by frame, into a real video file.",
    type: "website",
    siteName: "C2V space",
  },
  twitter: {
    card: "summary_large_image",
    title: "C2V space — code that becomes video",
    description: "Write code. The compiler films it — frame by frame, into a real video file.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6fa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <noscript>
          <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-lg font-semibold text-zinc-900">C2V space needs JavaScript</p>
            <p className="max-w-md text-sm text-zinc-500">
              The compiler runs entirely inside your browser — every frame is computed on your machine. Enable
              JavaScript and reload.
            </p>
          </div>
        </noscript>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
