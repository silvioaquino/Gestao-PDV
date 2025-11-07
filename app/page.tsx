'use client'

import { useState, useEffect } from 'react'
import TelaInicial from '@/components/TelaInicial'
import DashboardCaixa from '@/components/DashboardCaixa'
import ModalAbrirCaixa from '@/components/modais/ModalAbrirCaixa'
import ModalFecharCaixa from '@/components/modais/ModalFecharCaixa'
import ModalDetalhesVenda from '@/components/modais/ModalDetalhesVenda'
import ModalDetalhesRetirada from '@/components/modais/ModalDetalhesRetirada'
import ModalPreviewImpressao from '@/components/modais/ModalPreviewImpressao'
import { CaixaAbertura, Venda, Retirada, VendaManual } from '@/types'
import Link from 'next/link'

export default function Home() {
  // Estados principais
  const [caixaAberto, setCaixaAberto] = useState(false)
  const [caixaAtual, setCaixaAtual] = useState<CaixaAbertura | null>(null)
  const [vendas, setVendas] = useState<Venda[]>([])
  const [retiradas, setRetiradas] = useState<Retirada[]>([])
  const [vendasManuais, setVendasManuais] = useState<{[key: string]: VendaManual[]}>({
    DINHEIRO: [],
    CARTAO_CREDITO: [],
    CARTAO_DEBITO: [],
    PIX: [],
    OUTRO: []
  })

  // Estados dos modais
  const [showAbrirCaixa, setShowAbrirCaixa] = useState(false)
  const [showFecharCaixa, setShowFecharCaixa] = useState(false)
  const [showDetalhesVenda, setShowDetalhesVenda] = useState(false)
  const [showDetalhesRetirada, setShowDetalhesRetirada] = useState(false)
  const [showPreviewImpressao, setShowPreviewImpressao] = useState(false)
  
  // Estados para dados dos modais
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null)
  const [retiradaSelecionada, setRetiradaSelecionada] = useState<Retirada | null>(null)
  const [tipoImpressao, setTipoImpressao] = useState<'fechamento' | 'parcial'>('parcial')

  // Verificar estado do caixa
  const verificarEstadoCaixa = async () => {
    try {
      const response = await fetch('/api/caixa')
      const data = await response.json()
      
      setCaixaAberto(data.caixaAberto)
      setCaixaAtual(data.caixaAtual)

      if (data.caixaAberto) {
        await carregarDadosCaixa(data.caixaAtual.id)
      }
    } catch (error) {
      console.error('Erro ao verificar estado do caixa:', error)
    }
  }

  // Carregar dados do caixa
  const carregarDadosCaixa = async (caixaId: string) => {
    try {
      const [vendasRes, retiradasRes, vendasManuaisRes] = await Promise.all([
        fetch(`/api/vendas?caixaId=${caixaId}`),
        fetch(`/api/retiradas?caixaId=${caixaId}`),
        fetch(`/api/vendas/manuais?caixaId=${caixaId}`)
      ])

      const vendasData = await vendasRes.json()
      const retiradasData = await retiradasRes.json()
      const vendasManuaisData = await vendasManuaisRes.json()

      setVendas(vendasData.data || [])
      setRetiradas(retiradasData.data || [])
      
      // Agrupar vendas manuais por tipo
      const manuaisAgrupados: {[key: string]: VendaManual[]} = {}
      const tipos = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'OUTRO']
      tipos.forEach(tipo => {
        manuaisAgrupados[tipo] = (vendasManuaisData.data || [])
          .filter((v: VendaManual) => v.tipoPagamento === tipo)
      })
      setVendasManuais(manuaisAgrupados)
    } catch (error) {
      console.error('Erro ao carregar dados do caixa:', error)
    }
  }

  useEffect(() => {
    verificarEstadoCaixa()
  }, [])

  // Handlers para modais
  const handleAbrirCaixa = () => setShowAbrirCaixa(true)
  
  const handleFecharCaixa = () => setShowFecharCaixa(true)
  
  const handleAbrirDetalhesVenda = (venda: Venda) => {
    setVendaSelecionada(venda)
    setShowDetalhesVenda(true)
  }
  
  const handleAbrirDetalhesRetirada = (retirada: Retirada) => {
    setRetiradaSelecionada(retirada)
    setShowDetalhesRetirada(true)
  }
  
  const handlePreviewImpressao = (tipo: 'fechamento' | 'parcial') => {
    setTipoImpressao(tipo)
    setShowPreviewImpressao(true)
  }

  // Handlers para ações
  const handleConfirmarAbrirCaixa = async (valorInicial: number, observacao: string) => {
    try {
      const response = await fetch('/api/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor_inicial: valorInicial,
          observacao: observacao
        })
      })

      if (!response.ok) throw new Error('Erro ao abrir caixa')
      
      await verificarEstadoCaixa()
    } catch (error) {
      console.error('Erro:', error)
      throw error
    }
  }

  const handleConfirmarFecharCaixa = async (caixaId: string, observacoes: string, valorRetiradaFinal?: number) => {
    try {
      // Registrar retirada final se houver
      if (valorRetiradaFinal && valorRetiradaFinal > 0) {
        await fetch('/api/retiradas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            valor: valorRetiradaFinal,
            observacao: `Retirada final - ${observacoes}`,
            caixa_abertura_id: caixaId
          })
        })
      }

      // Fechar caixa
      const response = await fetch('/api/caixa/fechar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caixa_abertura_id: caixaId,
          observacoes: observacoes
        })
      })

      if (!response.ok) throw new Error('Erro ao fechar caixa')
      
      await verificarEstadoCaixa()
    } catch (error) {
      console.error('Erro:', error)
      throw error
    }
  }

  const handleAtualizarVenda = async (vendaId: string, tipoPagamento: string) => {
    try {
      const response = await fetch(`/api/vendas/${vendaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_pagamento: tipoPagamento })
      })

      if (!response.ok) throw new Error('Erro ao atualizar venda')
      
      if (caixaAtual) {
        await carregarDadosCaixa(caixaAtual.id)
      }
    } catch (error) {
      console.error('Erro:', error)
      throw error
    }
  }

  const handleExcluirRetirada = async (retiradaId: string) => {
    try {
      const response = await fetch(`/api/retiradas/${retiradaId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir retirada')
      
      if (caixaAtual) {
        await carregarDadosCaixa(caixaAtual.id)
      }
    } catch (error) {
      console.error('Erro:', error)
      throw error
    }
  }

  const handleConsultarCaixa = (data: string) => {
    // Implementar consulta de caixa por data
    console.log('Consultar caixa para data:', data)
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor: '#2c3e50'}}>
        <div className="container">
          <a className="navbar-brand" href="#">
            <i className="bi bi-cash-coin"></i> Sistema PDV - Backend Proxy
          </a>
          <div className="navbar-nav ms-auto">
            <span className={`navbar-text status-caixa ${caixaAberto ? 'caixa-aberto' : 'caixa-fechado'}`}>
              <i className={`bi bi-circle-fill ${caixaAberto ? 'text-success' : 'text-danger'}`}></i>
              {caixaAberto ? ' Caixa Aberto' : ' Caixa Fechado'}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {caixaAberto && caixaAtual ? (
          <DashboardCaixa 
            caixaAtual={caixaAtual}
            vendas={vendas}
            retiradas={retiradas}
            vendasManuais={vendasManuais}
            onFecharCaixa={handleFecharCaixa}
            onAbrirDetalhesVenda={handleAbrirDetalhesVenda}
            onAbrirDetalhesRetirada={handleAbrirDetalhesRetirada}
            onPreviewImpressao={handlePreviewImpressao}
            onAtualizarDados={() => caixaAtual && carregarDadosCaixa(caixaAtual.id)}
          />
        ) : (
          <TelaInicial 
            onAbrirCaixa={handleAbrirCaixa}
            onConsultarCaixa={handleConsultarCaixa}
          />
        )}
      </div>

      {/* Modais */}
      <ModalAbrirCaixa
        show={showAbrirCaixa}
        onClose={() => setShowAbrirCaixa(false)}
        onAbrirCaixa={handleConfirmarAbrirCaixa}
      />

      <ModalFecharCaixa
        show={showFecharCaixa}
        onClose={() => setShowFecharCaixa(false)}
        onFecharCaixa={handleConfirmarFecharCaixa}
        caixaAtual={caixaAtual!}
        vendas={vendas}
        retiradas={retiradas} vendasManuais={{}}      />

      <ModalDetalhesVenda
        show={showDetalhesVenda}
        onClose={() => setShowDetalhesVenda(false)}
        venda={vendaSelecionada}
        onAtualizarVenda={handleAtualizarVenda}
      />

      <ModalDetalhesRetirada
        show={showDetalhesRetirada}
        onClose={() => setShowDetalhesRetirada(false)}
        retirada={retiradaSelecionada}
        onExcluirRetirada={handleExcluirRetirada}
      />

      <ModalPreviewImpressao
        show={showPreviewImpressao}
        onClose={() => setShowPreviewImpressao(false)}
        tipo={tipoImpressao}
        caixaAtual={caixaAtual!}
        vendas={vendas}
        retiradas={retiradas}
        vendasManuais={vendasManuais}
      />


    <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor: '#2c3e50'}}>
      <div className="container">
        <Link className="navbar-brand" href="/">
          <i className="bi bi-cash-coin"></i> Sistema PDV - Backend Proxy
        </Link>
        <div className="navbar-nav ms-auto">
          <span className={`navbar-text status-caixa ${caixaAberto ? 'caixa-aberto' : 'caixa-fechado'}`}>
            <i className={`bi bi-circle-fill ${caixaAberto ? 'text-success' : 'text-danger'}`}></i>
            {caixaAberto ? ' Caixa Aberto' : ' Caixa Fechado'}
          </span>
          <Link className="nav-link" href="/teste-webhook" style={{ marginLeft: '15px' }}>
            <i className="bi bi-plugin"></i> Testar Webhook
          </Link>
        </div>
      </div>
    </nav>

    {/* ... resto do código ... */}
  

    </>
  )
}