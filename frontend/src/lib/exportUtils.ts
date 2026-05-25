import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], fileName: string, columns: string[]) => {
  const doc = new jsPDF();
  doc.text(fileName, 14, 15);
  autoTable(doc, {
    head: [columns],
    body: data.map(item => columns.map(col => item[col] || '—')),
    startY: 20
  });
  doc.save(`${fileName}.pdf`);
};
