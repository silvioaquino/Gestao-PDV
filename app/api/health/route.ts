import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'online',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'online',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}