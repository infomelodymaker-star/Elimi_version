import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import { Suspense } from "react";
import "./globals.css"; // Global styles
import AIChatAssistant from "@/components/AIChatAssistant";
import TopProgressBar from "@/components/TopProgressBar";
import Footer from "@/components/Footer";
import { SettingsProvider } from "@/components/SettingsProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ELIMI Platform | Luxury Services & Ecosystem",
  description:
    "ELIMI integrated platform offering VIP Protocol & Mobility, E-Commerce Boutique, Rental & Allocation catalog for fashion and event staff, Elimi Média video broadcast, and PrintBe custom solutions in Burundi.",
  icons: [{ rel: "icon", url: "/assets/icons/ELIMI_LOGO.svg" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${syne.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-[#F8F9FA] text-[#0F172A] selection:bg-[#E0EBFF] selection:text-[#0B57FF]"
      >
        <SettingsProvider>
          <Suspense fallback={null}>
            <TopProgressBar />
          </Suspense>
          {children}
          <Footer />
          <AIChatAssistant />
        </SettingsProvider>
      </body>
    </html>
  );
}
