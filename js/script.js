let provas = [];
let index = 0;
let iframeAtual = null;

async function processarPDF() {
  const fileInput = document.getElementById('pdfFile');
  const pagesPerSplit = parseInt(document.getElementById('pagesPerSplit').value);
  const status = document.getElementById('status');

  if (!fileInput.files.length || !pagesPerSplit) {
    alert("Selecione o PDF e informe páginas por prova");
    return;
  }

  status.innerText = "Processando PDF...";
  provas = [];

  const file = fileInput.files[0];
  const arrayBuffer = await file.arrayBuffer();

  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  for (let i = 0; i < totalPages; i += pagesPerSplit) {
    const newPdf = await PDFLib.PDFDocument.create();

    const pages = await newPdf.copyPages(
      pdfDoc,
      Array.from({ length: pagesPerSplit }, (_, k) => i + k)
        .filter(p => p < totalPages)
    );

    pages.forEach(p => newPdf.addPage(p));

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    provas.push(url);
  }

  status.innerText = "Pronto! Comece a imprimir 👇";
  index = 0;
  atualizarUI();
  imprimirProxima();
}

function imprimirProxima() {
  if (index >= provas.length) return;

  if (iframeAtual) {
    document.body.removeChild(iframeAtual);
  }

  iframeAtual = document.createElement('iframe');
  iframeAtual.style.display = 'none';
  iframeAtual.src = provas[index];
  document.body.appendChild(iframeAtual);

  iframeAtual.onload = () => {
    setTimeout(() => {
      iframeAtual.contentWindow.print();
    }, 500);
  };
}

function proximaManual() {
  if (index >= provas.length) return;

  index++;
  atualizarUI();
  imprimirProxima();
}

function atualizarUI() {
  const progress = document.getElementById('progress');
  const fill = document.getElementById('progressFill');

  progress.innerText = `Prova ${index + 1} de ${provas.length}`;

  const percent = (index / provas.length) * 100;
  fill.style.width = percent + "%";

  if (index >= provas.length) {
    progress.innerText = "✅ Finalizado!";
    fill.style.width = "100%";
  }
}

document.getElementById('pdfFile').addEventListener('change', function() {
  const label = document.getElementById('fileLabel');

  if (this.files.length > 0) {
    label.innerText = "✅ " + this.files[0].name;
    label.classList.add("active");
  } else {
    label.innerText = "📂 Selecionar PDF";
    label.classList.remove("active");
  }
});