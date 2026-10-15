import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFExportData {
  titulo: string;
  clienteNome?: string;
  clienteTelefone?: string;
  empresaNome: string;
  empresaTelefone?: string;
  cnpjCpf?: string;
  itens: { nome: string; quantidade: number; valorUnitario: number; subtotal: number }[];
  valorTotal: number;
  observacoes?: string;
  dataValidade?: string;
}

export const exportPDFDocument = (data: PDFExportData) => {
  const doc = new jsPDF();

  // Header Background Gradient
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  // Title & Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(data.empresaNome.toUpperCase(), 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`${data.titulo} • Sistema EMPREDESC PRO`, 14, 28);

  // Document Metadata Box
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Cliente:', 14, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Cliente: ${data.clienteNome || 'Consumidor Final'}`, 14, 60);
  if (data.clienteTelefone) doc.text(`Contato: ${data.clienteTelefone}`, 14, 66);
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 130, 60);
  if (data.dataValidade) doc.text(`Validade: ${new Date(data.dataValidade).toLocaleDateString('pt-BR')}`, 130, 66);

  // Table of Items
  const tableData = data.itens.map(item => [
    item.nome,
    item.quantidade.toString(),
    `R$ ${item.valorUnitario.toFixed(2)}`,
    `R$ ${item.subtotal.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Item / Produto', 'Qtd', 'Preço Unitário', 'Subtotal']],
    body: tableData,
    headStyles: {
      fillColor: [79, 70, 229], // indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Total Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(120, finalY, 76, 20, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text(`VALOR TOTAL: R$ ${data.valorTotal.toFixed(2)}`, 125, finalY + 13);

  // Footer / Observacoes
  if (data.observacoes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('Observações / Condições de Pagamento:', 14, finalY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(data.observacoes, 14, finalY + 18);
  }

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Documento gerado automaticamente por empredesc.com.br • Sistema de Gestão MEI', 14, 285);

  doc.save(`${data.titulo.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};
