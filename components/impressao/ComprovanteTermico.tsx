'use client'

import { CaixaAbertura, Venda, Retirada, VendaManual } from '@/types'
import { formatarMoeda, formatarTipoPagamento } from '@/lib/utils'

interface ComprovanteTermicoProps {
  tipo: 'fechamento' | 'parcial'
  caixaAtual: CaixaAbertura
  vendas: Venda[]
  retiradas: Retirada[]
  vendasManuais: { [key: string]: VendaManual[] }
  onImprimir?: () => void
}

export default function ComprovanteTermico({ 
  tipo, 
  caixaAtual, 
  vendas, 
  retiradas, 
  vendasManuais,
  onImprimir 
}: ComprovanteTermicoProps) {
  
  // Cálculos
  const valorAbertura = caixaAtual?.valorInicial || 0
  const vendasDinheiro = vendas
    .filter(v => v.tipoPagamento === 'DINHEIRO')
    .reduce((total, v) => total + v.valorTotal, 0)
  const todasVendas = vendas.reduce((total, v) => total + v.valorTotal, 0)
  const totalRetiradas = retiradas.reduce((total, r) => total + r.valor, 0)
  const saldoFinal = valorAbertura + vendasDinheiro - totalRetiradas
  const faturamentoFinal = todasVendas - totalRetiradas

  const tiposPagamento = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'VR', 'OUTRO']
  
  // Calcular totais por tipo de pagamento
  const totaisPorTipo: { [key: string]: number } = {}
  tiposPagamento.forEach(tipo => {
    totaisPorTipo[tipo] = vendas
      .filter(venda => venda.tipoPagamento === tipo)
      .reduce((total, venda) => total + venda.valorTotal, 0)
  })

  const dataAtual = new Date().toLocaleString('pt-BR')

  const gerarConteudoImpressao = () => {
    return `
      <div class="impressao-termica">
        <br>
        <div class="text-center">
          <div class="fw-bold">RESTAURANTE EMPORIO DO SABOR</div>
          <div>CNPJ: 30.569.448/0001-91</div>
        </div>
        <br>
        <div class="text-center">
          <div class="fw-bold">${tipo === 'fechamento' ? 'FECHAMENTO DE CAIXA' : 'COMPROVANTE DE CAIXA'}</div>
          <div>${tipo === 'fechamento' ? 'RELATÓRIO FINAL' : 'RELATÓRIO PARCIAL'}</div>
        </div>
        <div class="text-center">
          <div>Data: ${dataAtual}</div>
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
            <td class="text-right">${formatarMoeda(todasVendas)}</td>
          </tr>
          <tr>
            <td class="text-left">Total de Retiradas:</td>
            <td class="text-right">${formatarMoeda(totalRetiradas)}</td>
          </tr>
        </table>
        
        <br>
        <div class="linha-divisoria"></div>
        <br>
        
        <div class="fw-bold text-center">VENDAS POR FORMA PAGTO</div>
        <br>
        
        <table>
          ${tiposPagamento.map(tipo => {
            if (totaisPorTipo[tipo] > 0) {
              return `
                <tr>
                  <td class="text-left">${formatarTipoPagamento(tipo)}:</td>
                  <td class="text-right">${formatarMoeda(totaisPorTipo[tipo])}</td>
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
        
        ${retiradas.length > 0 ? retiradas.map((retirada, index) => {
          const valor = retirada.valor
          const obs = retirada.observacao || 'Sem observação'
          
          return `
            <table>
              <tr>
                <td class="text-right" style="width: 40%;">${formatarMoeda(valor)}</td>
                <td class="text-left" style="width: 60%;">
                  <small>${obs.substring(0, 35)}${obs.length > 35 ? '...' : ''}</small>
                </td>
              </tr>
            </table>
            ${index < retiradas.length - 1 ? '<div style="margin-bottom: 2px;"></div>' : ''}
          `
        }).join('') : `
          <div class="text-center">Nenhuma retirada</div>
        `}
        
        <br>
        <div class="linha-divisoria"></div>
        <br>
        
        <table>
          <tr>
            <td class="text-left fw-bold">Saldo em Dinheiro:</td>
            <td class="text-right fw-bold">${formatarMoeda(saldoFinal)}</td>
          </tr>
          <tr>
            <td class="text-left fw-bold">Faturamento Final:</td>
            <td class="text-right fw-bold">${formatarMoeda(faturamentoFinal)}</td>
          </tr>
        </table>
        
        <br>
        <div class="linha-divisoria"></div>
        <br>
        
        <div class="text-center">
          <div>*** ${tipo === 'fechamento' ? 'CAIXA FECHADO' : 'CAIXA ABERTO'} ***</div>
          <div>Restaurante Emporio do Sabor</div>
          <div>www.emporiodosabor.com.br</div>
        </div>
        
        <div style="margin-top: 20px;"></div>
        <div class="text-center">--- CORTE AQUI ---</div>
        <div style="margin-top: 10px;"></div>
      </div>
    `
  }

  const handleImprimir = () => {
    const conteudo = gerarConteudoImpressao()
    
    const janelaImpressao = window.open('', '_blank')
    if (!janelaImpressao) return
    
    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Impressão Térmica</title>
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
    
    setTimeout(() => {
      janelaImpressao.print()
      setTimeout(() => {
        janelaImpressao.close()
        onImprimir?.()
      }, 500)
    }, 500)
  }

  return (
    <div className="preview-termica">
      <div dangerouslySetInnerHTML={{ __html: gerarConteudoImpressao() }} />
      
      <div className="text-center mt-3 no-print">
        <button 
          className="btn btn-primary btn-sm"
          onClick={handleImprimir}
        >
          <i className="bi bi-printer"></i> Imprimir Comprovante
        </button>
      </div>
    </div>
  )
}