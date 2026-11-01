import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sschatbox.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SSchat.box — AI School Learning Assistant (Tamil, English, Hindi)",
    template: "%s | SSchat.box"
  },
  description: "SSchat.box is an educational AI learning assistant for school students from LKG through Class 12. Grounded in authentic Tamil Nadu State Board (Samacheer Kalvi) and NCERT/CBSE textbooks with genuine citations and zero hallucination.",
  keywords: [
    "SSchat.box",
    "SSchat box",
    "Tamil Nadu State Board",
    "Samacheer Kalvi AI",
    "NCERT AI chatbot",
    "CBSE school learning",
    "LKG UKG early learning",
    "Tamil educational AI",
    "Hindi school chatbot",
    "Class 10 Science Samacheer Kalvi",
    "Textbook RAG AI"
  ],
  authors: [{ name: "SSchat.box Educational AI" }],
  creator: "SSchat.box",
  publisher: "SSchat.box",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "SSchat.box — Multilingual School Learning Assistant",
    description: "Textbook-grounded AI answers with genuine citations for Tamil Nadu Samacheer Kalvi, CBSE, and NCERT. Trilingual support in Tamil, English, and Hindi.",
    url: SITE_URL,
    siteName: "SSchat.box",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSchat.box — AI School Learning Assistant",
    description: "Textbook-grounded answers with genuine citations for school students (LKG to Class 12).",
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "SSchat.box",
  "url": SITE_URL,
  "description": "Authentic textbook-grounded educational AI assistant for Tamil Nadu Samacheer Kalvi, CBSE, and NCERT curricula.",
  "sameAs": [
    "https://textbookcorp.in/",
    "https://ncert.nic.in/"
  ]
};

const jsonLdWebApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SSchat.box AI Education Assistant",
  "url": SITE_URL,
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All (Android, iOS, Windows, macOS, Linux)",
  "browserRequirements": "Requires JavaScript and HTML5 support",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  }
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is SSchat.box?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SSchat.box is an AI-powered educational web application for school students from LKG through Class 12, providing textbook-grounded answers with genuine citations from Tamil Nadu State Board (Samacheer Kalvi) and NCERT/CBSE."
      }
    },
    {
      "@type": "Question",
      "name": "Which languages are supported by SSchat.box?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SSchat.box provides native trilingual support in Tamil (தமிழ்), English, and Hindi (हिन्दी), complete with scientific terminologies and early childhood phonics."
      }
    },
    {
      "@type": "Question",
      "name": "How does SSchat.box prevent hallucinated answers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SSchat.box uses strict evidence-grounded Retrieval-Augmented Generation (RAG). Every answer must match verified textbook passages, displaying exact chapter names and page numbers. If evidence is insufficient, it returns an honest curriculum fallback message."
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Anti-flicker inline script for instant theme restoration */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('sschatbox_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (storedTheme === 'dark' || (!storedTheme && prefersDark) || (storedTheme === 'system' && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  var storedLang = localStorage.getItem('sschatbox_ui_lang');
                  if (storedLang) {
                    document.documentElement.lang = storedLang;
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
