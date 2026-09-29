import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOUZ PLANER · Планировщик пространства",
  description: "План офиса продаж с размерами, мебелью, 3D и экспликацией.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
