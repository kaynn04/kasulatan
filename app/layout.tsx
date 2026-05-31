import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./navbar";

export const metadata: Metadata = {
  title: "Kasulatan",
  description: "A digital agreement and transaction record platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = localStorage.getItem("kasulatan-theme");
                var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                var theme = storedTheme || systemTheme;
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
