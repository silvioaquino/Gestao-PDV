'use client'

import { CaixaFechamento } from '@/types'
import { formatarMoeda, formatarTipoPagamento } from '@/lib/utils'

interface ModalConsultaCaixaProps {
  show: boolean
  onClose: () => void
  dadosCaixa: CaixaFechamento | null
}

export default function ModalConsultaCaixa({ show, onClose, dadosCaixa }: ModalConsultaCaixaProps) {
  if (!show) return null

  // CORREÇÃO: Função formatarData com tratamento para undefined
  const formatarData = (dataInput: Date | string | undefined | null) => {
    // Se for undefined ou null, retorna string vazia
    if (!dataInput) {
      return 'Não informado'
    }
    
    try {
      const data = dataInput instanceof Date ? dataInput : new Date(dataInput)
      if (isNaN(data.getTime())) {
        return 'Data inválida'
      }
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Data inválida'
    }
  }

  // Função para obter valores com fallback seguro - CORRIGIDA
  const getValor = () => {
    if (!dadosCaixa) return {}
    
    // CORREÇÃO: Garantir que todos os valores numéricos tenham fallback para 0
    return {
      // Valor de abertura
      valorAbertura: dadosCaixa.valorAbertura || dadosCaixa.valor_abertura || dadosCaixa.valor_inicial || 0,
      
      // Total de vendas
      totalVendas: dadosCaixa.totalVendas || dadosCaixa.total_vendas || 0,
      
      // Saldo final
      saldoFinal: dadosCaixa.saldoFinal || dadosCaixa.saldo_final || 0,
      
      // Total de retiradas
      totalRetiradas: dadosCaixa.total_retiradas || 0,
      
      // Vendas em dinheiro
      vendasDinheiro: dadosCaixa.vendas_dinheiro || 0,
      
      // Data de abertura
      dataAbertura: dadosCaixa.dataAbertura || dadosCaixa.data_abertura,
      
      // Data de fechamento (pode ser undefined)
      dataFechamento: dadosCaixa.dataFechamento || dadosCaixa.data_fechamento,
      
      // Observação
      observacao: dadosCaixa.observacao || dadosCaixa.observacoes || 'Nenhuma',
      
      // Status
      status: dadosCaixa.status || 'DESCONHECIDO'
    }
  }

  const valores = getValor()
  const tiposPagamento = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'VR', 'OUTRO']

  // CORREÇÃO: Calcular faturamento líquido com valores seguros
  const faturamentoLiquido = (valores.totalVendas || 0) - (valores.totalRetiradas || 0)

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">
              <i className="bi bi-search me-2"></i>
              Consulta de Caixa - Detalhado
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {dadosCaixa ? (
              <div className="row">
                <div className="col-12">
                  {/* Cabeçalho com informações básicas */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Informações do Caixa
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <p><strong>Data Abertura:</strong> {formatarData(valores.dataAbertura)}</p>
                          {/* CORREÇÃO: dataFechamento pode ser undefined */}
                          <p><strong>Data Fechamento:</strong> {valores.dataFechamento ? formatarData(valores.dataFechamento) : 'Não fechado'}</p>
                          <p><strong>Valor Inicial:</strong> {formatarMoeda(valores.valorAbertura || 0)}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Status:</strong> 
                            <span className={`badge ${
                              valores.status === 'FECHADO' ? 'bg-success' : 
                              valores.status === 'ABERTO' ? 'bg-warning' : 
                              'bg-secondary'
                            } ms-2`}>
                              {valores.status}
                            </span>
                          </p>
                          <p><strong>Observação:</strong> {valores.observacao}</p>
                          <p><strong>ID do Caixa:</strong> <small className="text-muted">{dadosCaixa.id}</small></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="row mb-4">
                    <div className="col-md-3">
                      <div className="card border-success">
                        <div className="card-body text-center">
                          <h6 className="card-title text-success">Valor Abertura</h6>
                          <h4 className="text-success">{formatarMoeda(valores.valorAbertura || 0)}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-primary">
                        <div className="card-body text-center">
                          <h6 className="card-title text-primary">Vendas Dinheiro</h6>
                          <h4 className="text-primary">{formatarMoeda(valores.vendasDinheiro || 0)}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-info">
                        <div className="card-body text-center">
                          <h6 className="card-title text-info">Total Vendas</h6>
                          <h4 className="text-info">{formatarMoeda(valores.totalVendas || 0)}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-warning">
                        <div className="card-body text-center">
                          <h6 className="card-title text-warning">Saldo Final</h6>
                          <h4 className={`${(valores.saldoFinal || 0) < 0 ? 'text-danger' : 'text-warning'}`}>
                            {formatarMoeda(valores.saldoFinal || 0)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Se houver dados do fechamento oficial */}
                  {dadosCaixa.fechamento && (
                    <div className="card mb-4 border-success">
                      <div className="card-header bg-success text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-check-circle me-2"></i>
                          Resumo Oficial do Fechamento
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4">
                            <p><strong>Data do Fechamento:</strong> {formatarData(dadosCaixa.fechamento.data_fechamento)}</p>
                            <p><strong>Valor de Abertura:</strong> {formatarMoeda(dadosCaixa.fechamento.valor_abertura || 0)}</p>
                          </div>
                          <div className="col-md-4">
                            <p><strong>Total de Vendas:</strong> {formatarMoeda(dadosCaixa.fechamento.total_vendas || 0)}</p>
                            <p><strong>Total de Retiradas:</strong> {formatarMoeda(dadosCaixa.fechamento.retiradas || 0)}</p>
                          </div>
                          <div className="col-md-4">
                            <p><strong>Saldo Final:</strong> {formatarMoeda(dadosCaixa.fechamento.saldo_final || 0)}</p>
                            <p><strong>Observações:</strong> {dadosCaixa.fechamento.observacoes || 'Nenhuma'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vendas por Forma de Pagamento */}
                  {dadosCaixa.vendas_por_forma_pagamento && (
                    <div className="card mb-4">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-credit-card me-2"></i>
                          Vendas por Forma de Pagamento
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          {tiposPagamento.map(tipo => {
                            const totalTipo = dadosCaixa.vendas_por_forma_pagamento?.[tipo] || 0
                            
                            if (totalTipo === 0) return null
                            
                            return (
                              <div key={tipo} className="col-md-6 mb-2">
                                <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                                  <span className="text-muted">{formatarTipoPagamento(tipo)}:</span>
                                  <strong className="text-success">{formatarMoeda(totalTipo)}</strong>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* Total Geral */}
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                              <strong className="text-dark">TOTAL GERAL DE VENDAS:</strong>
                              <strong className="text-dark fs-5">{formatarMoeda(valores.totalVendas || 0)}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Detalhamento Sistema vs Manual */}
                        {(dadosCaixa.total_vendas_sistema !== undefined || dadosCaixa.total_vendas_manuais !== undefined) && (
                          <div className="row mt-2">
                            <div className="col-md-6">
                              <small className="text-muted">
                                <i className="bi bi-cart me-1"></i>
                                Vendas Sistema: {formatarMoeda(dadosCaixa.total_vendas_sistema || 0)} ({dadosCaixa.quantidade_vendas || 0} vendas)
                              </small>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">
                                <i className="bi bi-pencil me-1"></i>
                                Vendas Manuais: {formatarMoeda(dadosCaixa.total_vendas_manuais || 0)} ({dadosCaixa.quantidade_vendas_manuais || 0} vendas)
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Retiradas Realizadas */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-cash-coin me-2"></i>
                        Retiradas Realizadas
                      </h6>
                    </div>
                    <div className="card-body">
                      {dadosCaixa.retiradas && dadosCaixa.retiradas.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-striped table-sm">
                            <thead>
                              <tr>
                                <th>Data/Hora</th>
                                <th>Valor</th>
                                <th>Observação</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dadosCaixa.retiradas.map((retirada, index) => (
                                <tr key={index}>
                                  <td>{formatarData(retirada.data)}</td>
                                  <td className="text-danger fw-bold">{formatarMoeda(retirada.valor)}</td>
                                  <td>{retirada.observacao || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="table-warning">
                                <td colSpan={1}><strong>TOTAL DE RETIRADAS:</strong></td>
                                <td colSpan={2} className="text-danger fw-bold">
                                  {formatarMoeda(valores.totalRetiradas || 0)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted">
                          <i className="bi bi-info-circle me-2"></i>
                          Não foram realizadas retiradas neste caixa.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumo Financeiro Final */}
                  <div className="card mt-4 border-primary">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">
                        <i className="bi bi-graph-up me-2"></i>
                        Resumo Financeiro Final
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Valor de Abertura:</span>
                            <strong>{formatarMoeda(valores.valorAbertura || 0)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Total de Vendas:</span>
                            <strong className="text-success">{formatarMoeda(valores.totalVendas || 0)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Total de Retiradas:</span>
                            <strong className="text-danger">{formatarMoeda(valores.totalRetiradas || 0)}</strong>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Vendas em Dinheiro:</span>
                            <strong>{formatarMoeda(valores.vendasDinheiro || 0)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Saldo em Dinheiro:</span>
                            <strong className={`${(valores.saldoFinal || 0) < 0 ? 'text-danger' : 'text-success'}`}>
                              {formatarMoeda(valores.saldoFinal || 0)}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Faturamento Líquido:</span>
                            <strong className="text-primary">
                              {formatarMoeda(faturamentoLiquido)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Nenhum dado encontrado</h5>
                <p className="text-muted">
                  Não foram encontrados dados de caixa para a data selecionada.
                  <br />
                  <small>Verifique se o caixa foi aberto na data especificada.</small>
                </p>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-2"></i>
              Fechar
            </button>
            {dadosCaixa && (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-2"></i>
                Imprimir Relatório
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}