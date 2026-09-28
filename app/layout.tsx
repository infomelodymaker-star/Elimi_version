import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css"; // Global styles
import TopProgressBar from "@/components/TopProgressBar";
import Footer from "@/components/Footer";
import { SettingsProvider } from "@/components/SettingsProvider";
import AIChatAssistantWrapper from "@/components/AIChatAssistantWrapper";

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
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@500;600;700;800&display=swap"
          rel="stylesheet"
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
          <AIChatAssistantWrapper />
        </SettingsProvider>
      </body>
    </html>
  );
}

