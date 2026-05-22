import PDFDocument from 'pdfkit';

const formatBRL = (val: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

export class PDFService {
  static async generateReceiptPDF(receipt: any): Promise<Buffer> {
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
      doc.text(`a importância de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(receipt.valorLiquido))}.`);
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Detalhamento dos Valores:');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Aluguel: ${formatBRL(receipt.valorBruto)}`);
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
      doc.text(`Vencimento: ${new Date(receipt.dataVencimento).toLocaleDateString('pt-BR')}`);
      if (receipt.formaPagamento) {
        doc.text(`Forma de Pagamento: ${receipt.formaPagamento}`);
      }
      if (receipt.dataPagamento) {
        doc.text(`Data do Pagamento: ${new Date(receipt.dataPagamento).toLocaleDateString('pt-BR')}`);
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
}
