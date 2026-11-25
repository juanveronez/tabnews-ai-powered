import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TabNews com IA – em construção",
  description:
    "Um espaço na internet para aprender junto com a IA, inspirado no TabNews. Estamos construindo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
