import * as XLSX from 'xlsx';

export const exportOrdersToExcel = (orders, clients, vendors, fileName = 'Ordini_Export') => {
  // Prepare data for Excel
  const excelData = orders.map(order => {
    const client = clients.find(c => c.id === order.clientId);
    const vendor = vendors.find(v => v.id === order.vendorId);
    
    return {
      'Numero Ordine': order.orderNumber,
      'Data Creazione': new Date(order.createdAt).toLocaleDateString('it-IT'),
      'Cliente': client?.name || 'N/A',
      'P.IVA Cliente': client?.vatNumber || 'N/A',
      'Fornitore': vendor?.name || 'N/A',
      'P.IVA Fornitore': vendor?.vatNumber || 'N/A',
      'Prodotto': order.product,
      'Tipologia': order.type,
      'Origine': order.origin,
      'Quantità': order.quantity,
      'Prezzo (€/KG)': order.price,
      'Sconto (%)': order.discount || 0,
      'Data Consegna': new Date(order.deliveryDate).toLocaleDateString('it-IT'),
      'Condizioni Pagamento': order.paymentTerms,
      'Stato': order.status === 'pending' ? 'In Attesa' : 
               order.status === 'completed' ? 'Completato' : 'Fatturato',
      'App Mobile': order.publishToApp ? 'Sì' : 'No'
    };
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 15 }, // Numero Ordine
    { wch: 12 }, // Data Creazione
    { wch: 25 }, // Cliente
    { wch: 15 }, // P.IVA Cliente
    { wch: 25 }, // Fornitore
    { wch: 15 }, // P.IVA Fornitore
    { wch: 30 }, // Prodotto
    { wch: 20 }, // Tipologia
    { wch: 15 }, // Origine
    { wch: 15 }, // Quantità
    { wch: 12 }, // Prezzo
    { wch: 10 }, // Sconto
    { wch: 12 }, // Data Consegna
    { wch: 20 }, // Condizioni Pagamento
    { wch: 12 }, // Stato
    { wch: 10 }  // App Mobile
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Ordini');

  // Generate and download file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
};

export const exportClientsToExcel = (clients, fileName = 'Clienti_Export') => {
  const excelData = clients.map(client => ({
    'Ragione Sociale': client.name,
    'Partita IVA': client.vatNumber,
    'Indirizzo': client.address,
    'Città': client.city,
    'Codice SDI': client.sdi || 'N/A',
    'Telefono': client.phone || 'N/A',
    'Email': client.email || 'N/A'
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  ws['!cols'] = [
    { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, 
    { wch: 15 }, { wch: 15 }, { wch: 25 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Clienti');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
};

export const exportVendorsToExcel = (vendors, fileName = 'Fornitori_Export') => {
  const excelData = vendors.map(vendor => ({
    'Ragione Sociale': vendor.name,
    'Partita IVA': vendor.vatNumber,
    'Indirizzo': vendor.address,
    'Città': vendor.city,
    'Telefono': vendor.phone || 'N/A',
    'Email': vendor.email || 'N/A'
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  ws['!cols'] = [
    { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, 
    { wch: 15 }, { wch: 25 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Fornitori');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
};

export const exportFinancialReport = (orders, clients, vendors, fileName = 'Report_Finanziario') => {
  // Calculate financial metrics
  const financialData = orders.map(order => {
    const client = clients.find(c => c.id === order.clientId);
    const vendor = vendors.find(v => v.id === order.vendorId);
    const finalPrice = order.price * (1 - (order.discount || 0) / 100);
    
    return {
      'Numero Ordine': order.orderNumber,
      'Data': new Date(order.createdAt).toLocaleDateString('it-IT'),
      'Cliente': client?.name || 'N/A',
      'Fornitore': vendor?.name || 'N/A',
      'Prodotto': order.product,
      'Quantità': order.quantity,
      'Prezzo Base (€/KG)': order.price,
      'Sconto (%)': order.discount || 0,
      'Prezzo Finale (€/KG)': finalPrice.toFixed(2),
      'Valore Stimato (€)': 'N/A', // Would need quantity in KG
      'Stato': order.status === 'pending' ? 'In Attesa' : 
               order.status === 'completed' ? 'Completato' : 'Fatturato'
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(financialData);
  
  ws['!cols'] = [
    { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, 
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, 
    { wch: 15 }, { wch: 15 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Report Finanziario');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
};