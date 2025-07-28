import jsPDF from 'jspdf';
import { useCompanyStore } from '@/store/companyStore';

export const generateOrderContract = (order, client, vendor) => {
  const doc = new jsPDF();
  const { companyInfo } = useCompanyStore.getState();
  
  // Page dimensions and margins
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const leftMargin = 20;
  const rightMargin = 20;
  const topMargin = 15;
  const bottomMargin = 25;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  const headerHeight = 50;
  const footerHeight = 20;
  const contentStartY = topMargin + headerHeight;
  const contentEndY = pageHeight - bottomMargin - footerHeight;
  const availableHeight = contentEndY - contentStartY;
  
  let currentY = contentStartY;
  
  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight = 10) => {
    if (currentY + requiredHeight > contentEndY) {
      doc.addPage();
      addHeader();
      addFooter();
      currentY = contentStartY;
      return true;
    }
    return false;
  };
  
  // Helper function to add text with automatic line wrapping
  const addWrappedText = (text, x, fontSize = 11, fontStyle = 'normal', color = [0, 0, 0], maxWidth = null) => {
    if (!text) return currentY;
    
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', fontStyle);
    
    const textWidth = maxWidth || contentWidth - (x - leftMargin);
    const lines = doc.splitTextToSize(text, textWidth);
    const lineHeight = fontSize * 0.5;
    
    // Check if we need a new page for all lines
    const totalHeight = lines.length * lineHeight;
    checkNewPage(totalHeight);
    
    lines.forEach((line, index) => {
      // Check if this single line needs a new page
      if (currentY + lineHeight > contentEndY) {
        doc.addPage();
        addHeader();
        addFooter();
        currentY = contentStartY;
      }
      
      doc.text(line, x, currentY);
      currentY += lineHeight;
    });
    
    return currentY;
  };
  
  // Helper function to add a section with title and content
  const addSection = (title, content, titleColor = [60, 122, 95]) => {
    // Add some spacing before section
    currentY += 8;
    checkNewPage(15);
    
    // Add section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    doc.text(title, leftMargin, currentY);
    currentY += 10;
    
    // Add section content
    if (typeof content === 'function') {
      content();
    } else if (content) {
      addWrappedText(content, leftMargin);
    }
  };
  
  // Header function
  const addHeader = () => {
    const savedY = currentY;
    
    // Add logo if available
    if (companyInfo.logo) {
      try {
        doc.addImage(companyInfo.logo, 'JPEG', leftMargin, topMargin, 30, 30);
      } catch (error) {
        console.log('Error adding logo to PDF:', error);
      }
    }
    
    // Company header
    doc.setFontSize(16);
    doc.setTextColor(60, 122, 95);
    doc.setFont('helvetica', 'bold');
    const companyName = companyInfo.name || 'Trade Management System';
    doc.text(companyName, companyInfo.logo ? 55 : leftMargin, topMargin + 15);
    
    if (companyInfo.address) {
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      let yPos = topMargin + 20;
      
      doc.text(`${companyInfo.address}`, companyInfo.logo ? 55 : leftMargin, yPos);
      yPos += 4;
      
      if (companyInfo.city && companyInfo.postalCode) {
        doc.text(`${companyInfo.postalCode} ${companyInfo.city} ${companyInfo.province || ''}`, 
                 companyInfo.logo ? 55 : leftMargin, yPos);
        yPos += 4;
      }
      
      if (companyInfo.phone) {
        doc.text(`Tel: ${companyInfo.phone}`, companyInfo.logo ? 55 : leftMargin, yPos);
        yPos += 4;
      }
      
      if (companyInfo.email) {
        doc.text(`Email: ${companyInfo.email}`, companyInfo.logo ? 55 : leftMargin, yPos);
        yPos += 4;
      }
      
      if (companyInfo.vatNumber) {
        doc.text(`P.IVA: ${companyInfo.vatNumber}`, companyInfo.logo ? 55 : leftMargin, yPos);
      }
    }
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, topMargin + headerHeight - 5, pageWidth - rightMargin, topMargin + headerHeight - 5);
    
    currentY = savedY;
  };
  
  // Footer function
  const addFooter = () => {
    const footerY = pageHeight - bottomMargin;
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    
    // Page number
    const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
    const totalPages = doc.internal.getNumberOfPages();
    doc.text(`Pagina ${pageNumber}`, pageWidth - rightMargin - 20, footerY);
    
    // Footer text
    doc.text('Documento generato automaticamente dal Trade Management System', 
             leftMargin, footerY - 8);
    
    if (companyInfo.website) {
      doc.text(companyInfo.website, leftMargin, footerY - 4);
    }
    
    // Line separator
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, footerY - 12, pageWidth - rightMargin, footerY - 12);
  };
  
  // Start creating the document
  addHeader();
  addFooter();
  
  // Contract title
  checkNewPage(20);
  doc.setFontSize(18);
  doc.setTextColor(60, 122, 95);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRATTO DI COMPRAVENDITA', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;
  
  // Order number and date
  checkNewPage(15);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ordine N.: ${order.orderNumber}`, leftMargin, currentY);
  doc.text(`Data: ${new Date(order.createdAt).toLocaleDateString('it-IT')}`, 
           pageWidth - rightMargin - 60, currentY);
  currentY += 10;
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.setDrawColor(150, 150, 150);
  doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
  currentY += 10;
  
  // Buyer section
  addSection('COMPRATORE:', () => {
    const clientInfo = [
      `Ragione Sociale: ${client?.name || 'N/A'}`,
      `Indirizzo: ${client?.address || 'N/A'}`,
      `Città: ${client?.city || 'N/A'}`,
      `P.IVA: ${client?.vatNumber || 'N/A'}`
    ];
    
    if (client?.sdi) {
      clientInfo.push(`Codice SDI: ${client.sdi}`);
    }
    if (client?.phone) {
      clientInfo.push(`Telefono: ${client.phone}`);
    }
    if (client?.email) {
      clientInfo.push(`Email: ${client.email}`);
    }
    
    clientInfo.forEach(info => {
      checkNewPage(8);
      addWrappedText(info, leftMargin, 11);
    });
  });
  
  // Seller section
  addSection('VENDITORE:', () => {
    const vendorInfo = [
      `Ragione Sociale: ${vendor?.name || 'N/A'}`,
      `Indirizzo: ${vendor?.address || 'N/A'}`,
      `Città: ${vendor?.city || 'N/A'}`,
      `P.IVA: ${vendor?.vatNumber || 'N/A'}`
    ];
    
    if (vendor?.phone) {
      vendorInfo.push(`Telefono: ${vendor.phone}`);
    }
    if (vendor?.email) {
      vendorInfo.push(`Email: ${vendor.email}`);
    }
    
    vendorInfo.forEach(info => {
      checkNewPage(8);
      addWrappedText(info, leftMargin, 11);
    });
  });
  
  // Product details section
  addSection('OGGETTO DELLA VENDITA:', () => {
    const productInfo = [];
    
    if (order.product) {
      productInfo.push(`Prodotto: ${order.product}`);
    }
    if (order.type) {
      productInfo.push(`Tipologia: ${order.type}`);
    }
    if (order.origin) {
      productInfo.push(`Origine: ${order.origin}`);
    }
    if (order.packaging) {
      productInfo.push(`Imballaggio: ${order.packaging}`);
    }
    if (order.quantity) {
      productInfo.push(`Quantità: ${order.quantity}`);
    }
    
    productInfo.forEach(info => {
      checkNewPage(8);
      addWrappedText(info, leftMargin, 11);
    });
  });
  
  // Commercial terms section
  addSection('CONDIZIONI COMMERCIALI:', () => {
    const commercialInfo = [];
    
    if (order.price) {
      commercialInfo.push(`Prezzo: €${parseFloat(order.price).toFixed(2)}/KG`);
    }
    
    if (order.discount && parseFloat(order.discount) > 0) {
      commercialInfo.push(`Sconto: ${order.discount}%`);
      
      // Calculate final price
      const basePrice = parseFloat(order.price);
      const discount = parseFloat(order.discount);
      const finalPrice = basePrice * (1 - discount / 100);
      commercialInfo.push(`Prezzo Finale: €${finalPrice.toFixed(2)}/KG`);
    }
    
    if (order.deliveryDate) {
      commercialInfo.push(`Data Consegna: ${new Date(order.deliveryDate).toLocaleDateString('it-IT')}`);
    }
    
    commercialInfo.forEach(info => {
      checkNewPage(8);
      addWrappedText(info, leftMargin, 11);
    });
    
    // Payment terms (special handling for long text)
    if (order.paymentTerms) {
      checkNewPage(15);
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Condizioni di Pagamento:', leftMargin, currentY);
      currentY += 8;
      
      doc.setFont('helvetica', 'normal');
      addWrappedText(order.paymentTerms, leftMargin, 11, 'normal', [0, 0, 0], contentWidth);
    }
  });
  
  // Additional terms section (if needed)
  checkNewPage(25);
  currentY += 10;
  
  addSection('TERMINI E CONDIZIONI:', () => {
    const terms = [
      '• Il presente contratto è regolato dalla legge italiana.',
      '• La merce viaggia a rischio e pericolo del compratore.',
      '• Eventuali reclami devono essere comunicati entro 24 ore dalla consegna.',
      '• Il pagamento deve essere effettuato secondo i termini concordati.',
      '• Per controversie è competente il Tribunale di competenza territoriale.'
    ];
    
    terms.forEach(term => {
      checkNewPage(8);
      addWrappedText(term, leftMargin, 10);
    });
  });
  
  // Signatures section
  checkNewPage(60);
  currentY += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 122, 95);
  doc.text('FIRME:', leftMargin, currentY);
  currentY += 20;
  
  // Signature boxes
  const signatureBoxWidth = (contentWidth - 20) / 2;
  const signatureBoxHeight = 40;
  
  // Buyer signature
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  doc.rect(leftMargin, currentY, signatureBoxWidth, signatureBoxHeight);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Firma Compratore', leftMargin + 5, currentY + 10);
  doc.text('Data: _______________', leftMargin + 5, currentY + 35);
  
  // Seller signature
  const rightBoxX = leftMargin + signatureBoxWidth + 20;
  doc.rect(rightBoxX, currentY, signatureBoxWidth, signatureBoxHeight);
  doc.text('Firma Venditore', rightBoxX + 5, currentY + 10);
  doc.text('Data: _______________', rightBoxX + 5, currentY + 35);
  
  currentY += signatureBoxHeight + 10;
  
  // Update page numbers for all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }
  
  return doc;
};

export const downloadPDF = (doc, fileName) => {
  doc.save(fileName);
};

export const getPDFBlob = (doc) => {
  return doc.output('blob');
};