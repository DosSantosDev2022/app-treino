// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/provider/providers"; // Importe o componente que criamos

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meu Treino App",
  description: "Gerenciador de treinos pessoais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Envolvemos tudo no Providers */}
        <Providers>
          <main className="min-h-screen bg-slate-50 pb-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}