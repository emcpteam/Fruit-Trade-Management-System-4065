import { useApiKeyStore } from '@/store/apiKeyStore';

export const extractTextFromImage = async (imageFile) => {
  const { getApiKey } = useApiKeyStore.getState();
  const apiKey = getApiKey('openai');

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Convert image to base64
    const base64Image = await convertToBase64(imageFile);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Estrai tutto il testo visibile in questa immagine. Se ci sono informazioni commerciali, prezzi, date, nomi di prodotti o aziende, evidenziali. Rispondi solo con il testo estratto, senza commenti aggiuntivi.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
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
      throw new Error(error.error?.message || 'Errore API OpenAI');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';

  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
};

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const uploadToCloudinary = async (imageFile) => {
  const { getApiKey } = useApiKeyStore.getState();
  const cloudinaryConfig = getApiKey('cloudinary');

  if (!cloudinaryConfig?.cloudName) {
    throw new Error('Cloudinary not configured');
  }

  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', 'unsigned_preset'); // You need to create this in Cloudinary
  formData.append('folder', 'trade-management');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes
    };

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};