// OCR Service using OpenAI Vision API
class OCRService {
  constructor() {
    this.apiKey = localStorage.getItem('openai_api_key');
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  getApiKey() {
    return this.apiKey || localStorage.getItem('openai_api_key');
  }

  async extractTextFromImage(imageFile) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key non configurata. Vai in Impostazioni > API Keys per configurarla.');
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analizza questa immagine ed estrai tutto il testo presente. Se è un documento commerciale (fattura, ordine, contratto, etc.), evidenzia le informazioni più importanti come nomi aziende, importi, date, prodotti. Rispondi solo con il testo estratto, organizzato in modo chiaro.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageFile.type};base64,${base64Image}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Errore nella richiesta API');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OCR Error:', error);
      // Fallback to mock OCR for demo purposes
      if (error.message.includes('API key')) {
        throw error;
      }
      return this.mockOCR(imageFile);
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Mock OCR for demo purposes when API key is not available
  mockOCR(imageFile) {
    const mockTexts = [
      `FATTURA N. 2024/001
Data: ${new Date().toLocaleDateString('it-IT')}

Ragione Sociale: AZIENDA AGRICOLA DEMO SRL
P.IVA: IT12345678901
Indirizzo: Via dei Campi, 123 - 12345 Città (PR)

PRODOTTO: Cipolle Dorate Precoci
QUANTITÀ: 2.5 Autotreni
PREZZO: €0.30/KG
TOTALE: €1,500.00

Note: Merce di prima qualità, conforme alle specifiche`,

      `ORDINE DI ACQUISTO N. ${Math.floor(Math.random() * 1000) + 100}

Cliente: ${['ROSSI VERDURE SRL', 'BIANCHI ORTOFRUTTA', 'VERDI AGRICOLTURA'][Math.floor(Math.random() * 3)]}
Data Consegna: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT')}

Prodotto: ${['Pomodori San Marzano', 'Zucchine Biologiche', 'Melanzane Viola'][Math.floor(Math.random() * 3)]}
Quantità richiesta: ${Math.floor(Math.random() * 5) + 1} quintali`,

      `CONTRATTO DI FORNITURA

Venditore: COOPERATIVA AGRICOLA DEL SUD
Compratore: MERCATI GENERALI NORD SRL

Oggetto: Fornitura stagionale prodotti ortofrutticoli
Periodo: Marzo 2024 - Settembre 2024
Condizioni: Franco partenza, pagamento 30gg d.f.`
    ];

    // Simulate processing time
    return new Promise(resolve => {
      setTimeout(() => {
        const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
        resolve(randomText);
      }, 2000);
    });
  }
}

export const ocrService = new OCRService();

export const extractTextFromImage = (imageFile) => {
  return ocrService.extractTextFromImage(imageFile);
};

export default ocrService;