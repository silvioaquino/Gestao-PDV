/* @type {import('next').NextConfig} 
const nextConfig = {
  // Para deploy estático na Netlify
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Remove a configuração experimental desnecessária
  // experimental: {
  //   appDir: true // ← Esta linha causa o erro
  // },
  
  // Configurações opcionais para melhor performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig*/


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Para deploy com funções serverless
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Configurações de compilação
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig