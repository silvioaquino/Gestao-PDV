'use client'

import { useState, useEffect } from 'react'
import { CaixaAbertura, Venda, Retirada, VendaManual } from '@/types'
import { formatarMoeda, formatarTipoPagamento } from '@/lib/utils'

interface ModalFecharCaixaProps {
  show: boolean
  onClose: () => void
  onFecharCaixa: (caixaId: string, observacoes: string, valorRetiradaFinal?: number) => Promise<void>
  caixaAtual: CaixaAbertura
  vendas: Venda[]
  retiradas: Retirada[]
  vendasManuais: { [key: string]: VendaManual[] }
  onSucesso?: () => void
}

export default function ModalFecharCaixa({ 
  show, 
  onClose, 
  onFecharCaixa, 
  caixaAtual, 
  vendas, 
  retiradas,
  vendasManuais,
  onSucesso
}: ModalFecharCaixaProps) {
  const [valorRetiradaFinal, setValorRetiradaFinal] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Garantir que estamos no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cálculos para o resumo
  const valorAbertura = caixaAtual?.valorInicial || 0
  const vendasDinheiro = vendas
    .filter(v => v.tipoPagamento === 'DINHEIRO')
    .reduce((total, v) => total + (v.valorTotal || 0), 0)
  const todasVendas = vendas.reduce((total, v) => total + (v.valorTotal || 0), 0)
  const totalRetiradas = retiradas.reduce((total, r) => total + (r.valor || 0), 0)
  const saldoFinal = valorAbertura + vendasDinheiro - totalRetiradas

  const tiposPagamento = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'OUTRO']

  // Calcular totais por tipo de pagamento (sistema + manual) - COM TRATAMENTO DE ERRO
  const totaisPorTipo = tiposPagamento.reduce((acc, tipo) => {
    const vendasSistema = vendas
      .filter(v => v.tipoPagamento === tipo)
      .reduce((total, v) => total + (v.valorTotal || 0), 0)
    
    // TRATAMENTO: Verificar se vendasManuais existe e tem a propriedade do tipo
    const vendasManuaisTipo = (vendasManuais && vendasManuais[tipo] ? vendasManuais[tipo] : [])
      .reduce((total: number, v: VendaManual) => total + (v.valor || 0), 0)
    
    acc[tipo] = vendasSistema + vendasManuaisTipo
    return acc
  }, {} as {[key: string]: number})

  // Calcular totais gerais - COM TRATAMENTO DE ERRO
  const totalVendasSistema = vendas.reduce((total, v) => total + (v.valorTotal || 0), 0)
  
  // TRATAMENTO: Verificar se vendasManuais existe antes de usar Object.values
  const totalVendasManuais = vendasManuais 
    ? Object.values(vendasManuais).flat().reduce((total: number, v: any) => total + (v.valor || 0), 0)
    : 0
  
  const totalGeralVendas = totalVendasSistema + totalVendasManuais

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const valorRetirada = valorRetiradaFinal ? parseFloat(valorRetiradaFinal) : 0
      
      // Fechar o caixa
      await onFecharCaixa(caixaAtual.id, observacoes, valorRetirada)
      
      // Imprimir comprovante térmico automaticamente
      await imprimirComprovanteTermico()
      
      // Limpar campos
      setValorRetiradaFinal('')
      setObservacoes('')
      
      // Fechar modal
      onClose()
      
      // Redirecionar para tela inicial após um pequeno delay
      setTimeout(() => {
        if (onSucesso) {
          // Se foi passado um callback de sucesso, use-o
          onSucesso()
        } else {
          // Caso contrário, redirecione para a página inicial usando window.location
          if (isClient) {
            window.location.href = '/' // Redirecionamento seguro
          }
        }
      }, 1000)
      
    } catch (error) {
      console.error('Erro ao fechar caixa:', error)
    } finally {
      setLoading(false)
    }
  }

  const imprimirComprovanteTermico = async () => {
    return new Promise<void>((resolve) => {
      const conteudo = gerarConteudoImpressaoTermica()
      
      const janelaImpressao = window.open('', '_blank')
      if (!janelaImpressao) {
        resolve()
        return
      }
      
      janelaImpressao.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Comprovante de Fechamento</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1;
              margin: 0;
              padding: 5px;
              width: 80mm;
              background: white;
              color: black;
            }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .fw-bold { font-weight: bold; }
            .linha-divisoria { 
              border-top: 1px dashed black; 
              margin: 3px 0; 
            }
            .linha-dupla { 
              border-top: 2px solid black; 
              margin: 4px 0; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            th, td { 
              padding: 2px 1px; 
              border: none; 
            }
            .small { font-size: 10px; }
            .text-muted { color: #666; }
            @media print {
              body { 
                margin: 0; 
                padding: 5px; 
                width: 80mm;
              }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${conteudo}
        </body>
        </html>
      `)
      
      janelaImpressao.document.close()
      
      // Focar na janela e imprimir
      janelaImpressao.focus()
      
      const imprimir = () => {
        janelaImpressao.print()
        
        // Fechar a janela após a impressão (ou após um timeout como fallback)
        const fecharJanela = () => {
          janelaImpressao.close()
          resolve()
        }
        
        // Tentar detectar se a impressão foi concluída
        janelaImpressao.onafterprint = fecharJanela
        
        // Fallback: fechar após 3 segundos
        setTimeout(fecharJanela, 3000)
      }
      
      // Dar tempo para o conteúdo carregar
      setTimeout(imprimir, 500)
    })
  }

  const previsualizarImpressao = () => {
    setShowPreview(true)
  }

  const fecharPreview = () => {
    setShowPreview(false)
  }

  const imprimirDoPreview = async () => {
    await imprimirComprovanteTermico()
    setShowPreview(false)
  }

  const gerarConteudoImpressaoTermica = () => {
    const dataAtual = new Date().toLocaleString('pt-BR')
    const valorRetirada = valorRetiradaFinal ? parseFloat(valorRetiradaFinal) : 0

    return `
      <div class="impressao-termica">
        <br>
        <div class="text-center">
          <div class="fw-bold">RESTAURANTE EMPORIO DO SABOR</div>
          <div>CNPJ: 12.345.678/0001-90</div>
        </div>
        <br>
        <div class="text-center">
          <div class="fw-bold">FECHAMENTO DE CAIXA</div>
          <div>RELATÓRIO FINAL</div>
        </div>
        <div class="text-center">
          <div>Data: ${dataAtual}</div>
          <div>Caixa: ${caixaAtual?.id?.substring(0, 8).toUpperCase() || 'N/A'}</div>
        </div>
        
        <div class="linha-divisoria"></div>
        
        <table>
          <tr>
            <td class="text-left">Valor de Abertura:</td>
            <td class="text-right">${formatarMoeda(valorAbertura)}</td>
          </tr>
          <tr>
            <td class="text-left">Vendas em Dinheiro:</td>
            <td class="text-right">${formatarMoeda(vendasDinheiro)}</td>
          </tr>
          <tr>
            <td class="text-left">Total de Vendas:</td>
            <td class="text-right">${formatarMoeda(totalGeralVendas)}</td>
          </tr>
          <tr>
            <td class="text-left">Total de Retiradas:</td>
            <td class="text-right">${formatarMoeda(totalRetiradas)}</td>
          </tr>
          ${valorRetirada > 0 ? `
            <tr>
              <td class="text-left">Retirada Final:</td>
              <td class="text-right">${formatarMoeda(valorRetirada)}</td>
            </tr>
          ` : ''}
        </table>
        
        <br>
        <div class="linha-divisoria"></div>
        <br>
        
        <div class="fw-bold text-center">VENDAS POR FORMA PAGTO</div>
        <br>
        
        <table>
          ${tiposPagamento.map(tipo => {
            const totalTipo = totaisPorTipo[tipo] || 0
            if (totalTipo > 0) {
              return `
                <tr>
                  <td class="text-left">${formatarTipoPagamento(tipo)}:</td>
                  <td class="text-right">${formatarMoeda(totalTipo)}</td>
                </tr>
              `
            }
            return ''
          }).join('')}
        </table>
        
        <br>
        <div class="linha-divisoria"></div>
        <br>
        
        <div class="fw-bold text-center">DETALHES DAS RETIRADAS</div>
        <br>
        
        ${retiradas && retiradas.length > 0 ? retiradas.map((retirada, index) => {
          const dataRetirada = new Date(retirada.dataRetirada).toLocaleTimeString('pt-BR')
          const valor = retirada.valor || 0
          const obs = retirada.observacao || 'Sem observação'
          
          return `
            <table>
              <tr>
                <td class="text-right" style="width: 40%;">${formatarMoeda(valor)}</td>
                <td class="text-left" style="width: 60%;">
                  <small>${obs.substring(0, 35)}${obs.length > 35 ? '...' : ''}</small>
                </td>
              </tr>
              <tr>
                <td colspan="2" class="text-left small text-muted">${dataRetirada}</td>
              </tr>
            </table>
            ${index < retiradas.length - 1 ? '<div style="margin-bottom: 2px;"></div>' : ''}
          `
        }).join('') : `
          <div class="text-center">Nenhuma retirada</div>
        `}
        
        ${valorRetirada > 0 ? `
          <br>
          <table>
            <tr>
              <td class="text-right" style="width: 40%;">${formatarMoeda(valorRetirada)}</td>
              <td class="text-left" style="width: 60%;">
                <small>Retirada final - ${(observacoes || '').substring(0, 35)}${observacoes && observacoes.length > 35 ? '...' : ''}</small>
              </td>
            </tr>
            <tr>
              <td colspan="2" class="text-left small text-muted">${new Date().toLocaleTimeString('pt-BR')}</td>
            </tr>
          </table>
        ` : ''}
        
        <br>
        <div class="linha-divisoria"></div>
        <br>
        
        <table>
          <tr>
            <td class="text-left fw-bold">Saldo em Dinheiro:</td>
            <td class="text-right fw-bold">${formatarMoeda(saldoFinal - valorRetirada)}</td>
          </tr>
          <tr>
            <td class="text-left fw-bold">Faturamento Final:</td>
            <td class="text-right fw-bold">${formatarMoeda(totalGeralVendas - totalRetiradas - valorRetirada)}</td>
          </tr>
        </table>
        
        <br>
        <div class="linha-divisoria"></div>
        <br>
        
        <div class="text-center">
          <div>*** CAIXA FECHADO ***</div>
          <div>Restaurante Emporio do Sabor</div>
          <div>www.emporiodosabor.com.br</div>
        </div>
        
        <div style="margin-top: 20px;"></div>
        <div class="text-center">--- CORTE AQUI ---</div>
        <div style="margin-top: 10px;"></div>
      </div>
    `
  }

  if (!show) return null

  return (
    <>
      {/* Modal Principal de Fechar Caixa */}
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-lock-fill me-2"></i>
                Fechar Caixa
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                disabled={loading}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="valorRetiradaFechamento" className="form-label">
                      Valor de Retirada Final (Opcional)
                    </label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="valorRetiradaFechamento" 
                      step="0.01" 
                      min="0"
                      value={valorRetiradaFinal}
                      onChange={(e) => setValorRetiradaFinal(e.target.value)}
                      disabled={loading}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="obsRetiradaFechamento" className="form-label">
                      Observação do Fechamento
                    </label>
                    <textarea 
                      className="form-control" 
                      id="obsRetiradaFechamento" 
                      rows={3}
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      disabled={loading}
                      placeholder="Observações sobre o fechamento..."
                    ></textarea>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header bg-primary text-white">
                      <h6 className="card-title mb-0">Resumo do Fechamento</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-2">
                        <strong>Valor de Abertura:</strong> {formatarMoeda(valorAbertura)}
                      </div>
                      <div className="mb-2">
                        <strong>Vendas em Dinheiro:</strong> {formatarMoeda(vendasDinheiro)}
                      </div>
                      <div className="mb-2">
                        <strong>Total Faturado:</strong> {formatarMoeda(totalGeralVendas)}
                      </div>
                      <div className="mb-2">
                        <strong>Total de Retiradas:</strong> {formatarMoeda(totalRetiradas)}
                      </div>
                      <div className="mb-2">
                        <strong>Saldo Final (Dinheiro):</strong> 
                        <span className={`fw-bold ${saldoFinal < 0 ? 'text-danger' : 'text-success'}`}>
                          {formatarMoeda(saldoFinal)}
                        </span>
                      </div>
                      {valorRetiradaFinal && parseFloat(valorRetiradaFinal) > 0 && (
                        <div className="mb-2">
                          <strong>Retirada Final:</strong> 
                          <span className="fw-bold text-warning">
                            {formatarMoeda(parseFloat(valorRetiradaFinal))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h6>
                  <i className="bi bi-credit-card me-2"></i>
                  Vendas por Tipo de Pagamento
                </h6>
                <div className="row">
                  {tiposPagamento.map(tipo => {
                    const totalTipo = totaisPorTipo[tipo] || 0
                    
                    if (totalTipo === 0) return null
                    
                    return (
                      <div key={tipo} className="col-md-6">
                        <div className="d-flex justify-content-between mb-1">
                          <span>{formatarTipoPagamento(tipo)}:</span>
                          <span className="fw-bold">{formatarMoeda(totalTipo)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Informação sobre impressão automática */}
              <div className="alert alert-info mt-3">
                <i className="bi bi-info-circle me-2"></i>
                Ao fechar o caixa, um comprovante térmico será impresso automaticamente com todos os dados do fechamento.
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                <i className="bi bi-x-lg me-1"></i>
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-outline-primary"
                onClick={previsualizarImpressao}
                disabled={loading}
              >
                <i className="bi bi-eye me-1"></i>
                Pré-visualizar
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Fechando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-1"></i> 
                    Fechar Caixa & Imprimir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pré-visualização */}
      {showPreview && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-printer me-2"></i>
                  Pré-visualização do Comprovante
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={fecharPreview}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Esta é uma pré-visualização do comprovante que será impresso na impressora térmica.
                </div>
                
                <div 
                  className="border p-3 bg-white"
                  style={{ 
                    fontFamily: 'Courier New, monospace',
                    fontSize: '12px',
                    lineHeight: '1',
                    maxWidth: '80mm',
                    margin: '0 auto'
                  }}
                  dangerouslySetInnerHTML={{ __html: gerarConteudoImpressaoTermica() }}
                />
                
                <div className="alert alert-info mt-3 small">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Largura:</strong> 80mm (impressora térmica) | <strong>Fonte:</strong> Courier New
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={fecharPreview}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Fechar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={imprimirDoPreview}
                >
                  <i className="bi bi-printer me-1"></i>
                  Imprimir Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}