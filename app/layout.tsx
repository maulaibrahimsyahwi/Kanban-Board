import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppWrapper from "./AppWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Kanban Board | Project Management",
  description: "Modern Kanban board for project management",
  icons: {
    icon: "/favicon.ico", // ini relatif ke /public
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
