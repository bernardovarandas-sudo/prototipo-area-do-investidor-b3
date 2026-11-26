/* Modelo padrão dos arquivos para baixar (PDF e Excel). Todo download do protótipo passa por aqui, para manter o mesmo
   cabeçalho, cores, ordem das informações e aviso de demonstração. Bibliotecas carregadas só no primeiro download. */

const DOC_LIBS = {
  pdf: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'],
  xlsx: ['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'],
};
const DOC_COR = { fundo: [10, 3, 73], vivo: [24, 24, 183], amarelo: [255, 205, 0], texto: [30, 34, 51], suave: [94, 102, 123], linha: [221, 226, 236], zebra: [244, 246, 250] };
const docCarregado = {};
function carregarScript(src) {
  return docCarregado[src] || (docCarregado[src] = new Promise((ok, erro) => {
    const s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = ok; s.onerror = () => { delete docCarregado[src]; erro(new Error('Falha ao carregar ' + src)); };
    document.head.appendChild(s);
  }));
}
async function carregarLibs(tipo) { for (const src of DOC_LIBS[tipo]) await carregarScript(src); }

/* Logotipo oficial, se o arquivo estiver em docs/b3/assets; senão, a marca em texto (como no resto do protótipo). */
let docLogo;
async function logoDataUrl() {
  if (docLogo !== undefined) return docLogo;
  try {
    const r = await fetch('docs/b3/assets/LOGO_B3-NEGATIVO-CROP.png');
    if (!r.ok) throw new Error('sem logo');
    const b = await r.blob();
    docLogo = await new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); });
  } catch (e) { docLogo = null; }
  return docLogo;
}

/* Fontes padrão do PDF só aceitam o alfabeto latino básico: troca sinais que elas não têm. */
const pdfTxt = (t) => String(t ?? '').replace(/−/g, '-').replace(/→/g, '->').replace(/[–—]/g, '-').replace(/[^\x20-\x7E -ÿ“”‘’•…]/g, '');
const docValor = (v, tipo) => {
  if (v == null || v === '') return tipo === 'brl' ? '-' : '';
  if (tipo === 'brl') return typeof v === 'number' ? fmt.brl(v) : v;
  if (tipo === 'qtd') return typeof v === 'number' ? fmtQtd(v) : v;
  if (tipo === 'pct') return typeof v === 'number' ? nf1.format(v) + '%' : v;
  return String(v);
};
const geradoEm = () => REF.atual;
const nomeArquivo = (base, ext) => `${base.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-')}-demo.${ext}`;

async function baixarDocumento(spec, formato = 'pdf') {
  const tipo = formato === 'xlsx' ? 'xlsx' : 'pdf';
  toast('Preparando o arquivo…');
  try {
    await carregarLibs(tipo);
    if (tipo === 'pdf') await gerarPdf(spec); else gerarXlsx(spec);
  } catch (e) {
    toast('Não foi possível gerar o arquivo agora. Verifique a conexão e tente de novo.');
  }
}

async function gerarPdf(spec) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: spec.colunas.length > 6 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 14;
  const c = conta();
  const logo = await logoDataUrl();

  const cabecalho = () => {
    doc.setFillColor(...DOC_COR.fundo); doc.rect(0, 0, W, 24, 'F');
    doc.setFillColor(...DOC_COR.amarelo); doc.rect(0, 24, W, 1.4, 'F');
    if (logo) doc.addImage(logo, 'PNG', M, 6, 22, 12);
    else { doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('[B3]', M, 15.5); }
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(pdfTxt('Área do Investidor'), M + 26, 12);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(pdfTxt('Documento gerado pela Área do Investidor'), M + 26, 17);
    doc.setTextColor(...DOC_COR.amarelo); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text(pdfTxt('PROTÓTIPO ACADÊMICO · DADOS SIMULADOS'), W - M, 13, { align: 'right' });
  };
  const marcaDagua = () => {
    doc.saveGraphicsState(); doc.setGState(new doc.GState({ opacity: 0.07 }));
    doc.setTextColor(...DOC_COR.fundo); doc.setFont('helvetica', 'bold'); doc.setFontSize(44);
    doc.text(pdfTxt('DEMONSTRAÇÃO · SEM VALOR'), W / 2, H / 2, { align: 'center', angle: 30 });
    doc.restoreGraphicsState();
  };

  cabecalho();
  let y = 36;
  doc.setTextColor(...DOC_COR.fundo); doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(pdfTxt(spec.titulo), M, y);
  y += 6; doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...DOC_COR.suave);
  doc.text(pdfTxt([spec.periodo, spec.filtros].filter(Boolean).join('  ·  ')), M, y);

  // Caixa com os dados da conta (fictícios)
  y += 5; doc.setDrawColor(...DOC_COR.linha); doc.setFillColor(...DOC_COR.zebra); doc.roundedRect(M, y, W - 2 * M, 15, 2, 2, 'FD');
  const campo = (rot, val, x) => { doc.setFontSize(7.5); doc.setTextColor(...DOC_COR.suave); doc.text(pdfTxt(rot), x, y + 5.5); doc.setFontSize(9.5); doc.setTextColor(...DOC_COR.texto); doc.setFont('helvetica', 'bold'); doc.text(pdfTxt(val), x, y + 11); doc.setFont('helvetica', 'normal'); };
  const col = (W - 2 * M) / 3;
  campo('Investidor', c ? c.nome : '-', M + 4); campo('CPF', c ? c.cpf : '-', M + 4 + col); campo('Gerado em', geradoEm(), M + 4 + 2 * col);
  y += 21;

  const numCols = spec.colunas.map((cc, i) => (['brl', 'qtd', 'pct'].includes(cc[1]) ? i : -1)).filter((i) => i >= 0);
  const body = spec.linhas.length ? spec.linhas.map((l) => l.map((v, i) => pdfTxt(docValor(v, spec.colunas[i][1])))) : [[{ content: pdfTxt('Nenhum registro para os filtros escolhidos.'), colSpan: spec.colunas.length, styles: { halign: 'center', textColor: DOC_COR.suave } }]];
  const foot = spec.total ? [spec.total.map((v, i) => pdfTxt(docValor(v, spec.colunas[i][1])))] : undefined;
  doc.autoTable({
    startY: y, head: [spec.colunas.map((cc) => pdfTxt(cc[0]))], body, foot, margin: { left: M, right: M, top: 32, bottom: 20 },
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.4, textColor: DOC_COR.texto, lineColor: DOC_COR.linha, lineWidth: 0.1 },
    headStyles: { fillColor: DOC_COR.vivo, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [230, 233, 245], textColor: DOC_COR.fundo, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: DOC_COR.zebra },
    columnStyles: Object.fromEntries(numCols.map((i) => [i, { halign: 'right', minCellWidth: spec.colunas[i][1] === 'brl' ? 28 : 18 }])),
    didParseCell: (d) => { if ((d.section === 'head' || d.section === 'foot') && numCols.includes(d.column.index)) d.cell.styles.halign = 'right'; },
    didDrawPage: () => { cabecalho(); marcaDagua(); },
    showFoot: 'lastPage',
  });

  let yn = doc.lastAutoTable.finalY + 8;
  const notas = [...(spec.notas || []), 'Documento de demonstração gerado por um protótipo acadêmico. Os dados são fictícios e o arquivo não tem valor como comprovante.'];
  doc.setFontSize(8); doc.setTextColor(...DOC_COR.suave);
  notas.forEach((n) => {
    const linhas = doc.splitTextToSize(pdfTxt('• ' + n), W - 2 * M);
    if (yn + linhas.length * 4 > H - 22) { doc.addPage(); cabecalho(); marcaDagua(); yn = 36; }
    doc.text(linhas, M, yn); yn += linhas.length * 4 + 1.5;
  });

  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...DOC_COR.linha); doc.line(M, H - 14, W - M, H - 14);
    doc.setFontSize(7.5); doc.setTextColor(...DOC_COR.suave);
    doc.text(pdfTxt('Área do Investidor · Protótipo acadêmico · Squad Capital · Dados simulados, sem relação com contas reais'), M, H - 9);
    doc.text(pdfTxt(`Página ${p} de ${total}`), W - M, H - 9, { align: 'right' });
  }
  doc.save(nomeArquivo(spec.arquivo, 'pdf'));
  toast(`PDF baixado: ${nomeArquivo(spec.arquivo, 'pdf')}`);
}

function gerarXlsx(spec) {
  const X = window.XLSX, c = conta();
  const linhas = [
    ['Área do Investidor · Protótipo acadêmico · Dados simulados (documento de demonstração, sem valor)'],
    [spec.titulo],
    [[spec.periodo, spec.filtros].filter(Boolean).join(' · ')],
    ['Investidor', c ? c.nome : '-', 'CPF', c ? c.cpf : '-', 'Gerado em', geradoEm()],
    [],
    spec.colunas.map((cc) => cc[0]),
    ...spec.linhas.map((l) => l.map((v) => (v == null ? '' : v))),
  ];
  if (!spec.linhas.length) linhas.push(['Nenhum registro para os filtros escolhidos.']);
  if (spec.total) linhas.push(spec.total.map((v) => (v == null ? '' : v)));
  linhas.push([], ...(spec.notas || []).map((n) => [n]), ['Documento de demonstração gerado por um protótipo acadêmico. Os dados são fictícios.']);
  const ws = X.utils.aoa_to_sheet(linhas);
  // Formato numérico brasileiro nas colunas de valor e quantidade
  const ini = 6, fim = ini + spec.linhas.length + (spec.total ? 1 : 0);
  spec.colunas.forEach(([, tipo], ci) => {
    if (!['brl', 'qtd', 'pct'].includes(tipo)) return;
    for (let r = ini; r < fim; r++) {
      const ref = X.utils.encode_cell({ r, c: ci }); const cel = ws[ref];
      if (cel && typeof cel.v === 'number') cel.z = tipo === 'brl' ? '"R$" #,##0.00' : tipo === 'pct' ? '0.0"%"' : '#,##0.####';
    }
  });
  ws['!cols'] = spec.colunas.map(([n, t]) => ({ wch: Math.max(12, n.length + 2, t === 'txt' ? 22 : 14) }));
  ws['!merges'] = [0, 1, 2].map((r) => ({ s: { r, c: 0 }, e: { r, c: Math.max(5, spec.colunas.length - 1) } }));
  const wb = X.utils.book_new();
  X.utils.book_append_sheet(wb, ws, spec.titulo.slice(0, 28).replace(/[\\/?*[\]:]/g, ''));
  X.writeFile(wb, nomeArquivo(spec.arquivo, 'xlsx'));
  toast(`Excel baixado: ${nomeArquivo(spec.arquivo, 'xlsx')}`);
}
