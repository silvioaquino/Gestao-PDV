import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema PDV - Backend Proxy',
  description: 'Sistema de Ponto de Venda integrado com Cardápio.ai',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
          rel="stylesheet"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
        />
      </head>
      <body className={inter.className}>
        <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor: '#2c3e50'}}>
          <div className="container">
            <Link className="navbar-brand" href="/">
              <i className="bi bi-cash-coin"></i> Sistema PDV - Backend Proxy
            </Link>
            <div className="navbar-nav ms-auto">
              <Link className="nav-link" href="/">
                <i className="bi bi-house"></i> Início
              </Link>
              <Link className="nav-link" href="/teste-webhook">
                <i className="bi bi-plugin"></i> Teste Webhook
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}