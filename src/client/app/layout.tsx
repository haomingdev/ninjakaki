import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PayHack 2024",
  description: "PayHack 2024 Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
