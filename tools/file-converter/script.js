async function convertFile() {
  const fileName = document.getElementById('fileName').value;
  const fileContent = document.getElementById('fileContent').value;
  const format = document.getElementById('format').value;

  if (!fileName || !fileContent) {
    alert("Please fill in all fields!");
    return;
  }

  const convertedFileName = `${fileName}.${format}`;
  let blob;

  if (['txt', 'html', 'css', 'js', 'py', 'json'].includes(format)) {
    // Plain text-based formats
    const mimeType = {
      txt: 'text/plain',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      py: 'text/x-python',
      json: 'application/json',
    }[format];
    blob = new Blob([fileContent], { type: mimeType });

  } else if (format === 'docx') {
    // DOCX file using JSZip
    const zip = new JSZip();
    zip.file(`${fileName}.txt`, fileContent);
    blob = await zip.generateAsync({ type: 'blob' });

  } else if (format === 'pdf') {
    // PDF file using jsPDF
    const { jsPDF } = window.jspdf;
    const pdfDoc = new jsPDF();

    // Set margins for the PDF content
    const margin = 10;
    const pageHeight = pdfDoc.internal.pageSize.height;
    let yOffset = margin;

    // Split the content into multiple lines if necessary
    const lines = pdfDoc.splitTextToSize(fileContent, pdfDoc.internal.pageSize.width - margin * 2);
    
    // Add text to the PDF and handle page breaks
    for (let i = 0; i < lines.length; i++) {
      if (yOffset + 10 > pageHeight - margin) {  // Check if the text goes beyond the page
        pdfDoc.addPage();  // Add a new page if needed
        yOffset = margin;
      }
      pdfDoc.text(lines[i], margin, yOffset);  // Place the line at the current offset
      yOffset += 10;  // Adjust vertical offset for next line
    }

    blob = pdfDoc.output('blob');

  } else if (format === 'zip') {
    // ZIP file using JSZip
    const zip = new JSZip();
    zip.file(`${fileName}.txt`, fileContent); // Add content as a .txt file in the ZIP
    blob = await zip.generateAsync({ type: 'blob' });

  } else {
    alert("Unsupported format selected!");
    return;
  }

  // Display results and enable download
  document.getElementById('convertedFile').textContent = convertedFileName;
  document.getElementById('result').style.display = 'block';

  const link = document.getElementById('downloadLink');
  link.href = URL.createObjectURL(blob);
  link.download = convertedFileName;
}
