import axios from 'axios';
import { htmlToRichMessage } from './parser';

export async function sendRichMessage(botToken: string, chatId: string | number, htmlContent: string) {
  // 1. Parse the HTML and extract images using our parser
  const parsedMessage = await htmlToRichMessage(htmlContent);

  // 2. Prepare the multipart/form-data payload
  const formData = new FormData();
  formData.append('chat_id', chatId.toString());
  
  const richMessage = { html: parsedMessage.html };
  formData.append('rich_message', JSON.stringify(richMessage));

  // 3. Send using Bot API 10.1 sendRichMessage endpoint
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendRichMessage`;
    
    // Convert FormData to standard fetch request or use axios
    // Next.js has native fetch which supports FormData nicely
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Telegram API Error: ${data.description}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error sending Telegram Rich Message:', error);
    throw error;
  }
}
