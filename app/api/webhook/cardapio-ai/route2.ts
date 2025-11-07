import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔵 Webhook endpoint chamado')
  
  try {
    // Tentar parsear o JSON
    let data;
    try {
      data = await request.json()
      console.log('📥 Dados recebidos:', JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError)
      return NextResponse.json(
        { 
          success: false,
          error: 'JSON inválido',
          message: 'O corpo da requisição não é um JSON válido'
        },
        { status: 400 }
      )
    }

    // Resposta simples para teste
    return NextResponse.json({ 
      success: true,
      message: 'Webhook recebido com sucesso (modo debug)',
      data_received: data,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Erro geral no webhook:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}