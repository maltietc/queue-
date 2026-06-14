import { parse, HTMLElement } from 'node-html-parser';
import fs from 'fs';
import path from 'path';

export async function htmlToRichMessage(html: string) {
  const root = parse(html);

  const imgElements = root.querySelectorAll('img');
  
  for (const el of imgElements) {
    const src = el.getAttribute('src');
    // If the image is locally uploaded via our editor
    if (src && src.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', src);
        const buffer = fs.readFileSync(filePath);
        const fileName = path.basename(src);
        const mimeType = 'image/' + (path.extname(src).slice(1) || 'png');
        
        // We will use tmpfiles.org's free API. Telegram will cache the image natively.
        const formData = new FormData();
        const blob = new Blob([buffer], { type: mimeType });
        formData.append('file', blob, fileName);

        console.log(`Uploading ${fileName} to tmpfiles...`);
        const response = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (result && result.status === 'success' && result.data && result.data.url) {
          const publicUrl = result.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          console.log(`Successfully uploaded to ${publicUrl}`);
          el.setAttribute('src', publicUrl);
        } else {
          console.error('tmpfiles upload failed:', result);
        }
      } catch(e) {
        console.error('Failed to upload local image to Telegraph', e);
      }
    }
  }

  return { html: root.toString() };
}
