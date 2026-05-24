import PDFDocument from 'pdfkit';

const formatBRL = (val: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

function valorPorExtenso(valor: number) {
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const dezena_1 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  if (valor === 0) return "zero reais";
  if (valor === 100) return "cem reais";

  const centavos = Math.round((valor % 1) * 100);
  let inteiro = Math.floor(valor);

  const formatarMilhar = (n: number) => {
    if (n === 0) return "";
    let res = "";
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) res += centenas[c];
    if (c > 0 && (d > 0 || u > 0)) res += " e ";

    if (d === 1) {
      res += dezena_1[u];
    } else {
      if (d > 1) res += dezenas[d];
      if (d > 1 && u > 0) res += " e ";
      if (u > 0) res += unidades[u];
    }
    return res;
  };

  const milhar = Math.floor(inteiro / 1000);
  const resto = inteiro % 1000;

  let resultado = "";
  if (milhar > 0) {
    resultado += milhar === 1 ? "mil" : formatarMilhar(milhar) + " mil";
    if (resto > 0) resultado += (resto < 100 || resto % 100 === 0) ? " e " : ", ";
  }
  resultado += formatarMilhar(resto);
  resultado += (inteiro === 1) ? " real" : " reais";

  if (centavos > 0) {
    resultado += " e " + formatarMilhar(centavos) + (centavos === 1 ? " centavo" : " centavos");
  }

  return resultado.charAt(0).toUpperCase() + resultado.slice(1);
}

export class PDFService {
  static async generateSimpleReceiptPDF(receipt: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: any[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // ─── Header ────────────────────────────────────────────────────────
      doc.fontSize(20).text('RECIBO DE ALUGUEL', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Número do Recibo: ${receipt.numeroRecibo}`, { align: 'right' });
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'right' });
      doc.moveDown();

      doc.rect(50, doc.y, 500, 2).fill('#333');
      doc.moveDown();

      // ─── Body ──────────────────────────────────────────────────────────
      doc.fontSize(14).text(`Recebemos de ${receipt.contrato.inquilino.nome},`, { lineGap: 5 });
      doc.text(`a importância de ${formatBRL(receipt.valorLiquido)}.`);
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Detalhamento dos Valores:');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Aluguel: ${formatBRL(receipt.contrato.valorAluguel)}`);
      if (Number(receipt.valorIptu) > 0) doc.text(`IPTU: ${formatBRL(receipt.valorIptu)}`);
      if (Number(receipt.valorCondominio) > 0) doc.text(`Condomínio: ${formatBRL(receipt.valorCondominio)}`);
      if (Number(receipt.valorAgua) > 0) doc.text(`Água: ${formatBRL(receipt.valorAgua)}`);
      if (Number(receipt.valorLuz) > 0) doc.text(`Luz: ${formatBRL(receipt.valorLuz)}`);
      if (Number(receipt.outrosDebitos) > 0) doc.text(`Outros Débitos: ${formatBRL(receipt.outrosDebitos)}`);
      if (Number(receipt.descontos) > 0) doc.text(`Descontos: - ${formatBRL(receipt.descontos)}`);
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Referente ao imóvel:');
      doc.font('Helvetica').text(receipt.contrato.imovel.endereco);
      doc.moveDown();

      doc.text(`Mês de Referência: ${receipt.referenciaMes.toString().padStart(2, '0')}/${receipt.referenciaAno}`);
      doc.text(`Vencimento: ${new Date(receipt.dataVencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`);
      if (receipt.formaPagamento) {
        doc.text(`Forma de Pagamento: ${receipt.formaPagamento}`);
      }
      doc.moveDown();

      // ─── Footer ────────────────────────────────────────────────────────
      doc.moveDown(4);
      doc.text('____________________________________________________', { align: 'center' });
      doc.text('SmartImob - Gestão Imobiliária', { align: 'center' });
      doc.fontSize(10).fillColor('gray').text('Este recibo é um documento digital gerado pelo sistema.', { align: 'center' });

      doc.end();
    });
  }

  static async generateReceiptPDF(receipt: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 0,
        size: 'A4',
        layout: 'portrait'
      });
      const chunks: any[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const renderPage = (startY: number) => {
        const mainX = 50;
        const rightColX = 380;
        const rowHeight = 15;

        // ─── CABEÇALHO ──────────────────────────────────────────────────────
        doc.font('Helvetica-Bold').fontSize(14).text('TIANA IMÓVEIS & NEG IMOBILIARIOS', mainX, startY + 50);
        doc.fontSize(8).font('Helvetica').text('CRECI 25.129 SP', mainX, startY + 65);
        doc.text('Av. Mal. Fiúza de Castro, 822 - São Domingos - SP', mainX, startY + 75);
        doc.text('Fone/Fax: (11) 3731-3276 - 3735-1466', mainX, startY + 85);

        doc.font('Helvetica-Bold').fontSize(11).text('RECIBO DE PAGAMENTO DE ALUGUEL', 350, startY + 60, { align: 'right', width: 200 });

        // ─── QUADRO DE VALORES (DIREITA) ────────────────────────────────────
        let vY = startY + 110;
        doc.fontSize(9);
        const drawValueRow = (label: string, value: any, y: number, isTotal = false) => {
          doc.font(isTotal ? 'Helvetica-Bold' : 'Helvetica').text(`${label}------------------R$`, rightColX, y);
          doc.text(Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), rightColX + 110, y, { align: 'right', width: 60 });
        };

        drawValueRow('Aluguel', receipt.contrato.valorAluguel, vY);
        vY += rowHeight;
        drawValueRow('Desconto', receipt.descontos, vY);
        vY += rowHeight;
        drawValueRow('Condomínio', receipt.valorCondominio, vY);
        vY += rowHeight;
        drawValueRow('I P T U', receipt.valorIptu, vY);
        vY += rowHeight;
        drawValueRow('Água', receipt.valorAgua, vY);
        vY += rowHeight;
        drawValueRow('Luz', receipt.valorLuz, vY);
        vY += rowHeight;
        drawValueRow('Outros Débitos', receipt.outrosDebitos, vY);

        vY += 10;
        doc.moveTo(rightColX, vY).lineTo(rightColX + 175, vY).stroke();
        vY += 10;
        drawValueRow('TOTAL', receipt.valorLiquido, vY, true);
        doc.rect(rightColX - 5, startY + 105, 185, vY - (startY + 90)).stroke();

        // ─── INFOS DO CONTRATO (ESQUERDA) ──────────────────────────────────
        let infoY = startY + 110;
        const dataFim = new Date(receipt.contrato.dataFim);
        const dataInicio = new Date(receipt.contrato.dataInicio);

        doc.font('Helvetica-Bold').fontSize(9).text('Venc. CONTRATO:', mainX, infoY);
        doc.font('Helvetica').text(dataFim.toLocaleDateString('pt-BR'), mainX + 90, infoY);

        infoY += 15;
        doc.font('Helvetica-Bold').text('Próximo Reajuste:', mainX, infoY);
        const hojeReajuste = new Date();
        const proximoReajuste = new Date(dataInicio);
        while (proximoReajuste <= hojeReajuste) {
          proximoReajuste.setFullYear(proximoReajuste.getFullYear() + 1);
        }
        const reajusteStr = proximoReajuste.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
        doc.font('Helvetica').text(reajusteStr, mainX + 90, infoY);

        infoY += 25;
        doc.font('Helvetica-Bold').fontSize(10).text('Código    :-', mainX, infoY);
        doc.font('Helvetica').text(receipt.contrato.numeroContrato || 'N/A', mainX + 60, infoY);

        infoY += 15;
        doc.font('Helvetica-Bold').text('Locatário :-', mainX, infoY);
        doc.font('Helvetica').text(receipt.contrato.inquilino.nome.toUpperCase(), mainX + 70, infoY);

        infoY += 15;
        doc.font('Helvetica-Bold').text('Endereço :-', mainX, infoY);
        const imovel = receipt.contrato.imovel;
        const linha1 = `${imovel.endereco}${imovel.numero ? `, ${imovel.numero}` : ''}`;
        const linha2 = [
          imovel.complemento ? `${imovel.complemento} ` : '',
          imovel.bairro ? ` - ${imovel.bairro}` : '',
          imovel.cep ? ` - CEP: ${imovel.cep}` : ''
        ].join('');

        doc.font('Helvetica').text(linha1, mainX + 70, infoY, { width: 300 });
        doc.text(linha2, mainX + 70, infoY + 12, { width: 300 });

        infoY += 35;
        doc.font('Helvetica-Bold').text('CPF: ', mainX, infoY);
        doc.font('Helvetica').text(receipt.contrato.inquilino.cpfCnpj, mainX + 30, infoY);

        // ─── TEXTO CENTRAL ──────────────────────────────────────────────────
        const midY = startY + 250;
        doc.font('Helvetica').fontSize(10).text('Recebemos a importância acima de aluguel e acrescentamos demais acessórios :-', mainX, midY);
        doc.text(`Correspondente ao vencimento em, ${new Date(receipt.dataVencimento).toLocaleDateString('pt-BR')}`, mainX, midY + 15);

        const extenso = `[${valorPorExtenso(Number(receipt.valorLiquido))}]`;
        doc.font('Helvetica').fontSize(10).text('o valor de R$', mainX, midY + 40);
        doc.font('Helvetica-Bold').text(extenso, mainX + 70, midY + 40, { width: 330 });

        // ─── DATA ──────────────────────────────────────────────────────────
        const hoje = new Date();
        const dataStr = `São Paulo, ${hoje.getDate()} de ${hoje.toLocaleString('pt-BR', { month: 'long' })} de ${hoje.getFullYear()}`;
        doc.font('Helvetica').fontSize(10).text(dataStr, mainX, midY + 70, { align: 'right', width: 500 });

        // ─── ASSINATURAS ──────────────────────────────────────────────────
        const footerY = startY + 350;
        doc.moveTo(mainX, footerY).lineTo(mainX + 220, footerY).stroke();
        doc.font('Helvetica-Bold').fontSize(9).text(receipt.contrato.imovel.owner.nome.toUpperCase(), mainX, footerY + 5, { align: 'center', width: 220 });

        doc.moveTo(330, footerY).lineTo(550, footerY).stroke();
        doc.font('Helvetica-Bold').fontSize(9).text('TIANA IMÓVEIS', 330, footerY + 5, { align: 'center', width: 220 });

        // ─── DADOS BANCÁRIOS (NOVO) ──────────────────────────────────────────
        const bancoY = footerY + 40;
        doc.font('Helvetica-Bold').fontSize(8).text('INFORMAÇÕES DE PAGAMENTO:', mainX, bancoY);
        doc.font('Helvetica').fontSize(8);
        const owner = receipt.contrato.imovel.owner;
        if (receipt.formaPagamento === 'PIX') {
          doc.text(`PIX: ${owner.chavePix || 'Não informada'}`);
        } else {
          doc.text(`Banco: ${owner.banco || '—'} | Agência: ${owner.agencia || '—'} | Conta: ${owner.conta || '—'}`);
        }
      };

      // Desenha as duas vias
      renderPage(0);
      doc.moveDown();
      doc.addPage();
      renderPage(0);

      doc.end();
    });
  }
}
