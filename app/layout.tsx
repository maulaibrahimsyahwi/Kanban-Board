import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { headers } from "next/headers";
import "./styles/globals.css";
import AppWrapper from "./AppWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Kanban Board | Project Management",
  description: "Modern Kanban board for project management",
  icons: {
    icon: "/favicon.ico", // ini relatif ke /public
  },
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <AppWrapper nonce={nonce}>{children}</AppWrapper>
      </body>
    </html>
  );
}
