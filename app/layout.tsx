import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今晚吃什么",
  description: "我们家的点菜、买菜与做饭小助手。",
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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
