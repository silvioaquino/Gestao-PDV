'use client'

import { useState, useEffect, useRef } from 'react'
import { CaixaAbertura, Venda, Retirada, VendaManual } from '@/types'
import { formatarMoeda, formatarTipoPagamento, getBadgeColorTipoPagamento, getIconTipoPagamento } from '@/lib/utils'
import ModalFecharCaixa from './modais/ModalFecharCaixa'
import ModalDetalhesVenda from './modais/ModalDetalhesVenda'
import ModalDetalhesRetirada from './modais/ModalDetalhesRetirada'
import ModalPreviewImpressao from './modais/ModalPreviewImpressao'

interface DashboardCaixaProps {
  caixaAtual: CaixaAbertura
  onFecharCaixa: () => void
  onAbrirDetalhesVenda: (venda: Venda) => void
  onAbrirDetalhesRetirada: (retirada: Retirada) => void
  onPreviewImpressao: (tipo: 'fechamento' | 'parcial') => void
}

export default function DashboardCaixa({ 
  caixaAtual, 
  onFecharCaixa,
  onAbrirDetalhesVenda,
  onAbrirDetalhesRetirada,
  onPreviewImpressao
}: DashboardCaixaProps) {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [retiradas, setRetiradas] = useState<Retirada[]>([])
  const [vendasManuais, setVendasManuais] = useState<{[key: string]: VendaManual[]}>({
    DINHEIRO: [],
    CARTAO_CREDITO: [],
    CARTAO_DEBITO: [],
    PIX: [],
    VR: [],
    OUTRO: []
  })
  const [valorRetirada, setValorRetirada] = useState('')
  const [obsRetirada, setObsRetirada] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingRetirada, setLoadingRetirada] = useState(false)
  const [valoresManuais, setValoresManuais] = useState<{[key: string]: string}>({})
  const [descricoesManuais, setDescricoesManuais] = useState<{[key: string]: string}>({})

  // Estados para modais
  const [showFecharCaixa, setShowFecharCaixa] = useState(false)
  const [showDetalhesVenda, setShowDetalhesVenda] = useState(false)
  const [showDetalhesRetirada, setShowDetalhesRetirada] = useState(false)
  const [showPreviewImpressao, setShowPreviewImpressao] = useState(false)
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null)
  const [retiradaSelecionada, setRetiradaSelecionada] = useState<Retirada | null>(null)
  const [tipoImpressao, setTipoImpressao] = useState<'fechamento' | 'parcial'>('parcial')

  const inputRefs = useRef<{[key: string]: HTMLInputElement | null}>({})
  const listaSistemaRefs = useRef<{[key: string]: HTMLDivElement | null}>({})
  const listaManualRefs = useRef<{[key: string]: HTMLDivElement | null}>({})

  const tiposPagamento = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'VR', 'OUTRO']

  // Carregar dados do caixa apenas uma vez
  useEffect(() => {
    if (caixaAtual?.id) {
      carregarDadosCaixa()
    }
  }, [caixaAtual])

  // Efeito para ajustar alturas após carregar dados
  useEffect(() => {
    if (!loading) {
      setTimeout(ajustarAlturasListas, 100)
    }
  }, [loading, vendas, vendasManuais])

  const ajustarAlturasListas = () => {
    tiposPagamento.forEach(tipo => {
      const listaSistema = listaSistemaRefs.current[tipo]
      const listaManual = listaManualRefs.current[tipo]

      if (listaSistema && listaManual) {
        const alturaSistema = listaSistema.scrollHeight
        const alturaManual = listaManual.scrollHeight
        const alturaMaxima = Math.max(alturaSistema, alturaManual, 120) // Mínimo de 120px

        // Aplicar a mesma altura para ambas as listas
        listaSistema.style.height = `${alturaMaxima}px`
        listaManual.style.height = `${alturaMaxima}px`
      }
    })
  }

  const carregarDadosCaixa = async () => {
    if (!caixaAtual?.id) return
    
    setLoading(true)
    try {
      const [vendasRes, retiradasRes, vendasManuaisRes] = await Promise.all([
        fetch(`/api/vendas?caixaId=${caixaAtual.id}`),
        fetch(`/api/retiradas?caixaId=${caixaAtual.id}`),
        fetch(`/api/vendas/manuais?caixaId=${caixaAtual.id}`)
      ])

      const vendasData = await vendasRes.json()
      const retiradasData = await retiradasRes.json()
      const vendasManuaisData = await vendasManuaisRes.json()

      setVendas(vendasData.data || [])
      setRetiradas(retiradasData.data || [])
      
      // Agrupar vendas manuais por tipo
      const manuaisAgrupados: {[key: string]: VendaManual[]} = {}
      tiposPagamento.forEach(tipo => {
        manuaisAgrupados[tipo] = (vendasManuaisData.data || [])
          .filter((v: VendaManual) => v.tipoPagamento === tipo)
      })
      setVendasManuais(manuaisAgrupados)

    } catch (error) {
      console.error('❌ Erro ao carregar dados do caixa:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cálculos
  const vendasDinheiro = vendas
    .filter(v => v.tipoPagamento === 'DINHEIRO')
    .reduce((total, v) => total + (v.valorTotal || 0), 0)

  const todasVendas = vendas.reduce((total, v) => total + (v.valorTotal || 0), 0)
  const totalRetiradas = retiradas.reduce((total, r) => total + (r.valor || 0), 0)
  const saldoAtual = (caixaAtual?.valorInicial || 0) + vendasDinheiro - totalRetiradas

  // Calcular totais por tipo de pagamento
  const totaisPorTipo = tiposPagamento.reduce((acc, tipo) => {
    acc[tipo] = vendas
      .filter(v => v.tipoPagamento === tipo)
      .reduce((total, v) => total + (v.valorTotal || 0), 0)
    return acc
  }, {} as {[key: string]: number})

  // Calcular totais manuais por tipo
  const totaisManuaisPorTipo = tiposPagamento.reduce((acc, tipo) => {
    acc[tipo] = (vendasManuais[tipo] || [])
      .reduce((total, v) => total + (v.valor || 0), 0)
    return acc
  }, {} as {[key: string]: number})

  // Calcular diferenças (Manual - Sistema)
  const diferencasPorTipo = tiposPagamento.reduce((acc, tipo) => {
    acc[tipo] = totaisManuaisPorTipo[tipo] - totaisPorTipo[tipo]
    return acc
  }, {} as {[key: string]: number})

  // Handlers para retiradas
  const handleRegistrarRetirada = async () => {
    const valor = parseFloat(valorRetirada)
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, insira um valor válido para retirada')
      return
    }

    setLoadingRetirada(true)
    try {
      const response = await fetch('/api/retiradas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: valor,
          observacao: obsRetirada,
          caixa_abertura_id: caixaAtual.id
        })
      })

      if (!response.ok) throw new Error('Erro ao registrar retirada')

      setValorRetirada('')
      setObsRetirada('')
      await carregarDadosCaixa()

    } catch (error) {
      console.error('❌ Erro ao registrar retirada:', error)
      alert('Erro ao registrar retirada')
    } finally {
      setLoadingRetirada(false)
    }
  }

  // Handlers para vendas manuais
  const handleAdicionarVendaManual = async (tipo: string) => {
    const valor = parseFloat(valoresManuais[tipo] || '0')
    const descricao = tipo === 'DINHEIRO' 
      ? (descricoesManuais[tipo] || `Venda manual - ${formatarTipoPagamento(tipo)}`)
      : `Venda manual - ${formatarTipoPagamento(tipo)}`
    
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, insira um valor válido')
      return
    }

    try {
      const response = await fetch('/api/vendas/manuais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_pagamento: tipo,
          valor: valor,
          descricao: descricao,
          caixa_abertura_id: caixaAtual.id
        })
      })

      if (!response.ok) throw new Error('Erro ao adicionar venda manual')

      const novaVenda = await response.json()

      // Atualizar estado LOCALMENTE sem recarregar a página
      setVendasManuais(prev => ({
        ...prev,
        [tipo]: [...(prev[tipo] || []), novaVenda.data]
      }))

      // Limpar inputs mas manter foco
      setValoresManuais(prev => ({ ...prev, [tipo]: '' }))
      if (tipo === 'DINHEIRO') {
        setDescricoesManuais(prev => ({ ...prev, [tipo]: '' }))
      }
      
      // Manter foco no input e ajustar alturas após atualização
      setTimeout(() => {
        inputRefs.current[`${tipo}-valor`]?.focus()
        ajustarAlturasListas()
      }, 100)

    } catch (error) {
      console.error('❌ Erro ao adicionar venda manual:', error)
      alert('Erro ao adicionar venda manual')
    }
  }

  const handleRemoverVendaManual = async (vendaManualId: string) => {
    if (!confirm('Tem certeza que deseja remover esta venda manual?')) return

    try {
      const response = await fetch(`/api/vendas/manuais/${vendaManualId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao remover venda manual')

      // Atualizar estado LOCALMENTE sem recarregar a página
      setVendasManuais(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(tipo => {
          updated[tipo] = updated[tipo].filter(v => v.id !== vendaManualId)
        })
        return updated
      })

      // Ajustar alturas após remoção
      setTimeout(ajustarAlturasListas, 100)

    } catch (error) {
      console.error('❌ Erro ao remover venda manual:', error)
      alert('Erro ao remover venda manual')
    }
  }

  const handleInputChange = (tipo: string, campo: 'valor' | 'descricao', valor: string) => {
    if (campo === 'valor') {
      setValoresManuais(prev => ({ ...prev, [tipo]: valor }))
    } else {
      setDescricoesManuais(prev => ({ ...prev, [tipo]: valor }))
    }
  }

  const handleKeyPress = (tipo: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdicionarVendaManual(tipo)
    }
  }

  // Handlers para modais
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

  const handleAtualizarVenda = async (vendaId: string, tipoPagamento: string) => {
    try {
      const response = await fetch(`/api/vendas/${vendaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_pagamento: tipoPagamento })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar venda')
      }

      // Atualizar a lista de vendas localmente
      setVendas(prevVendas => 
        prevVendas.map(v => 
          v.id === vendaId 
            ? { ...v, tipoPagamento: tipoPagamento }
            : v
        )
      )

      // Ajustar alturas após atualização
      setTimeout(ajustarAlturasListas, 100)

    } catch (error: any) {
      console.error('❌ Erro ao atualizar venda:', error)
      throw error
    }
  }

  const handleExcluirRetirada = async (retiradaId: string) => {
    try {
      const response = await fetch(`/api/retiradas/${retiradaId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir retirada')

      await carregarDadosCaixa()

    } catch (error: any) {
      console.error('❌ Erro ao excluir retirada:', error)
      throw error
    }
  }

  // Handler para fechar caixa
  const handleFecharCaixaCompleto = async (caixaId: string, observacoes: string, valorRetiradaFinal?: number) => {
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
      
      // Chamar a função original para atualizar o estado
      onFecharCaixa()
      
    } catch (error) {
      console.error('❌ Erro ao fechar caixa:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2">Carregando dados do caixa...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="row">
      <div className="col-md-4">
        {/* Resumo do Caixa */}
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">Resumo do Caixa</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <strong>Valor Inicial:</strong> {formatarMoeda(caixaAtual?.valorInicial || 0)}
            </div>
            <div className="mb-3">
              <strong>Vendas em Dinheiro:</strong> {formatarMoeda(vendasDinheiro)}
            </div>
            <div className="mb-3">
              <strong>Total de Vendas:</strong> {formatarMoeda(todasVendas)}
            </div>
            <div className="mb-3">
              <strong>Total de Retiradas:</strong> {formatarMoeda(totalRetiradas)}
            </div>
            <div className="mb-3">
              <strong>Saldo Atual (Dinheiro):</strong> 
              <span className={`fw-bold ${saldoAtual < 0 ? 'text-danger' : 'text-success'}`}>
                {formatarMoeda(saldoAtual)}
              </span>
            </div>
          </div>
        </div>

        {/* Nova Retirada */}
        <div className="card mt-4">
          <div className="card-header bg-success text-white">
            <h5 className="card-title mb-0">Nova Retirada</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="valorRetirada" className="form-label">Valor</label>
              <input 
                type="number" 
                className="form-control" 
                id="valorRetirada" 
                step="0.01" 
                min="0.01"
                value={valorRetirada}
                onChange={(e) => setValorRetirada(e.target.value)}
                disabled={loadingRetirada}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="obsRetirada" className="form-label">Observação</label>
              <textarea 
                className="form-control" 
                id="obsRetirada" 
                rows={2}
                value={obsRetirada}
                onChange={(e) => setObsRetirada(e.target.value)}
                disabled={loadingRetirada}
              ></textarea>
            </div>
            <button 
              className="btn btn-success w-100"
              onClick={handleRegistrarRetirada}
              disabled={loadingRetirada}
            >
              {loadingRetirada ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Registrando...
                </>
              ) : (
                <>
                  <i className="bi bi-cash"></i> Registrar Retirada
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lista de Retiradas */}
        <div className="card mt-4">
          <div className="card-header bg-info text-white">
            <h5 className="card-title mb-0">Detalhes das Retiradas</h5>
          </div>
          <div className="card-body">
            {retiradas.length > 0 ? (
              retiradas.map(retirada => (
                <div 
                  key={retirada.id} 
                  className="retirada-item border-bottom pb-2 mb-2"
                  onClick={() => handleAbrirDetalhesRetirada(retirada)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="fw-bold text-danger">{formatarMoeda(retirada.valor)}</div>
                      <div className="small text-muted">{retirada.observacao || 'Sem observação'}</div>
                    </div>
                    <div className="ms-2">
                      <i className="bi bi-chevron-right text-muted"></i>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-3">
                <i className="bi bi-cash-stack"></i><br />
                Nenhuma retirada registrada
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Relatório de Vendas</h5>
            <div>
              <button 
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => handlePreviewImpressao('parcial')}
              >
                <i className="bi bi-printer"></i> Imprimir Parcial
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => setShowFecharCaixa(true)}
              >
                <i className="bi bi-lock-fill"></i> Fechar Caixa
              </button>
            </div>
          </div>
          <div className="card-body">
            {/* Tabela de Vendas por Tipo de Pagamento - LAYOUT LADO A LADO */}
            <div className="row">
              {tiposPagamento.map(tipo => {
                const vendasTipo = vendas.filter(venda => venda.tipoPagamento === tipo)
                const vendasManuaisTipo = vendasManuais[tipo] || []
                const totalSistema = totaisPorTipo[tipo]
                const totalManual = totaisManuaisPorTipo[tipo]
                const diferenca = diferencasPorTipo[tipo]
                const valorManual = valoresManuais[tipo] || ''
                const descricaoManual = descricoesManuais[tipo] || ''

                return (
                  <div key={tipo} className="col-md-6 payment-column mb-4">
                    {/* MUDANÇA: alterado para col-md-6 para 2 cards por linha */}
                    <div className="card h-100">
                      <div className="card-header text-white py-2" style={{ 
                        backgroundColor: tipo === 'DINHEIRO' ? '#28a745' : 
                                        tipo === 'CARTAO_CREDITO' ? '#007bff' :
                                        tipo === 'CARTAO_DEBITO' ? '#17a2b8' :
                                        tipo === 'PIX' ? '#6f42c1' :
                                        tipo === 'VR' ? '#fd7e14' :
                                        '#343a40'
                      }}>
                        <h6 className="card-title mb-0 text-center">
                          <i className={`${getIconTipoPagamento(tipo)} me-1`}></i>
                          {formatarTipoPagamento(tipo)}
                        </h6>
                      </div>
                      <div className="card-body p-2">
                        {/* LINHA: Cabeçalho com contadores */}
                        <div className="row mb-2">
                          <div className="col-6">
                            <small className="text-muted">
                              Sistema <span className="badge bg-primary">{vendasTipo.length}</span>
                            </small>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">
                              Manual <span className="badge bg-success">{vendasManuaisTipo.length}</span>
                            </small>
                          </div>
                        </div>

                        {/* LINHA: Inputs ocupando LARGURA TOTAL da coluna manual */}
                        <div className="row mb-2">
                          <div className="col-12">
                            <div className="manual-input-section">
                              {tipo === 'DINHEIRO' ? (
                                // Para Dinheiro: valor + descrição (largura total)
                                <>
                                  <div className="d-flex gap-1 mb-1">
                                    <div className="flex-grow-1">
                                      <div className="input-group input-group-sm">
                                        <span className="input-group-text">R$</span>
                                        <input
                                          ref={el => inputRefs.current[`${tipo}-valor`] = el}
                                          type="number"
                                          className="form-control"
                                          placeholder="0,00"
                                          step="0.01"
                                          min="0.01"
                                          value={valorManual}
                                          onChange={(e) => handleInputChange(tipo, 'valor', e.target.value)}
                                          onKeyPress={(e) => handleKeyPress(tipo, e)}
                                        />
                                      </div>
                                    </div>
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleAdicionarVendaManual(tipo)}
                                      disabled={!valorManual || parseFloat(valorManual) <= 0}
                                    >
                                      <i className="bi bi-plus"></i>
                                    </button>
                                  </div>
                                  <div className="input-group input-group-sm">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Descrição (moedas, troco...)"
                                      value={descricaoManual}
                                      onChange={(e) => handleInputChange(tipo, 'descricao', e.target.value)}
                                      onKeyPress={(e) => handleKeyPress(tipo, e)}
                                      maxLength={50}
                                    />
                                  </div>
                                </>
                              ) : (
                                // Para outros tipos: input com largura total
                                <div className="d-flex gap-1">
                                  <div className="flex-grow-1">
                                    <div className="input-group input-group-sm">
                                      <span className="input-group-text">R$</span>
                                      <input
                                        ref={el => inputRefs.current[`${tipo}-valor`] = el}
                                        type="number"
                                        className="form-control"
                                        placeholder="0,00"
                                        step="0.01"
                                        min="0.01"
                                        value={valorManual}
                                        onChange={(e) => handleInputChange(tipo, 'valor', e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(tipo, e)}
                                      />
                                    </div>
                                  </div>
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleAdicionarVendaManual(tipo)}
                                    disabled={!valorManual || parseFloat(valorManual) <= 0}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* LINHA: Listas de vendas LADO A LADO com altura dinâmica */}
                        <div className="row mb-3">
                          {/* Coluna Esquerda - Vendas do Sistema */}
                          <div className="col-6">
                            <div 
                              ref={el => listaSistemaRefs.current[tipo] = el}
                              className="vendas-lista"
                              style={{ overflowY: 'auto' }}
                            >
                              {vendasTipo.map(venda => (
                                <div 
                                  key={venda.id} 
                                  className="sale-item sistema p-1 border-bottom"
                                  onClick={() => handleAbrirDetalhesVenda(venda)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">{formatarMoeda(venda.valorTotal)}</span>
                                    <small className="text-muted">
                                      {new Date(venda.dataVenda).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </small>
                                  </div>
                                  {venda.dadosPedido?.cliente?.nome && (
                                    <small className="text-muted d-block">
                                      {venda.dadosPedido.cliente.nome}
                                    </small>
                                  )}
                                </div>
                              ))}
                              {vendasTipo.length === 0 && (
                                <div className="text-center text-muted py-2">
                                  <small>Nenhuma venda</small>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Coluna Direita - Vendas Manuais */}
                          <div className="col-6">
                            <div 
                              ref={el => listaManualRefs.current[tipo] = el}
                              className="vendas-lista"
                              style={{ overflowY: 'auto' }}
                            >
                              {vendasManuaisTipo.map((venda, index) => (
                                <div key={venda.id || index} className="sale-item manual p-1 border-bottom">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                      <div className="fw-bold text-success">{formatarMoeda(venda.valor)}</div>
                                      {venda.descricao && venda.descricao !== `Venda manual - ${formatarTipoPagamento(tipo)}` && (
                                        <small className="text-muted">{venda.descricao}</small>
                                      )}
                                    </div>
                                    <button
                                      className="btn btn-sm btn-outline-danger p-0"
                                      style={{ width: '20px', height: '20px', fontSize: '10px' }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoverVendaManual(venda.id)
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {vendasManuaisTipo.length === 0 && (
                                <div className="text-center text-muted py-2">
                                  <small>Nenhuma manual</small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* LINHA: Totais LADO A LADO */}
                        <div className="row mb-2">
                          <div className="col-6">
                            <div className="payment-total text-center p-1 bg-light rounded">
                              <small>
                                <strong>Sistema:</strong><br />
                                {formatarMoeda(totalSistema)}
                              </small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="payment-total text-center p-1 bg-light rounded">
                              <small>
                                <strong>Manual:</strong><br />
                                {formatarMoeda(totalManual)}
                              </small>
                            </div>
                          </div>
                        </div>

                        {/* LINHA: Diferença (Manual - Sistema) */}
                        <div className={`total-combinado text-center p-2 rounded ${
                          diferenca >= 0 ? 'bg-success text-white' : 'bg-danger text-white'
                        }`}>
                          <strong>
                            {diferenca >= 0 ? '✅' : '❌'} Diferença: {formatarMoeda(diferenca)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Resumo Geral */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body py-3">
                    <div className="row">
                      <div className="col-md-6">
                        <h6 className="mb-3">Resumo de Vendas</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Vendas do Sistema:</span>
                          <span className="badge bg-primary fs-6">{formatarMoeda(todasVendas)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Vendas Manuais:</span>
                          <span className="badge bg-success fs-6">
                            {formatarMoeda(Object.values(totaisManuaisPorTipo).reduce((a, b) => a + b, 0))}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between border-top pt-2">
                          <span className="fs-5 fw-bold">Diferença Geral:</span>
                          <span className={`fs-4 fw-bold ${
                            Object.values(diferencasPorTipo).reduce((a, b) => a + b, 0) >= 0 
                              ? 'text-success' 
                              : 'text-danger'
                          }`}>
                            {formatarMoeda(Object.values(diferencasPorTipo).reduce((a, b) => a + b, 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      <ModalFecharCaixa
        show={showFecharCaixa}
        onClose={() => setShowFecharCaixa(false)}
        onFecharCaixa={handleFecharCaixaCompleto}
        caixaAtual={caixaAtual}
        vendas={vendas}
        retiradas={retiradas}
        vendasManuais={vendasManuais}
      />

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
        caixaAtual={caixaAtual}
        vendas={vendas}
        retiradas={retiradas}
        vendasManuais={vendasManuais}
      />
    </div>
  )
}