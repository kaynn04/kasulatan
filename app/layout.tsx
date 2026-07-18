import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import Navbar from "./navbar";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kasulatan — Clear agreements for everyday transactions",
    template: "%s | Kasulatan",
  },
  description: "Create, review, electronically sign, and keep a clear record of everyday agreements between two parties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = localStorage.getItem("kasulatan-theme");
                var preference = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
                var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                var theme = preference === "system" ? systemTheme : preference;
                document.documentElement.dataset.themePreference = preference;
                document.documentElement.dataset.theme = theme;
                document.documentElement.style.colorScheme = theme;
              } catch (_) {}
            `,
          }}
        />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
