import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "跨境电商分销系统",
  description: "全自动化的跨境电商分销平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

