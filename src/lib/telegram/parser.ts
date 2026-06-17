import { parse, HTMLElement } from 'node-html-parser';
import fs from 'fs';
import path from 'path';

export async function htmlToRichMessage(html: string) {
  const root = parse(html);

  const imgElements = root.querySelectorAll('img');
  const attachments = [];
  
  for (const el of imgElements) {
    const src = el.getAttribute('src');
    let localPath = null;
    if (src && src.startsWith('/uploads/')) {
      localPath = src;
    } else if (src && src.includes('/uploads/')) {
      try {
        const urlObj = new URL(src);
        if (urlObj.pathname.startsWith('/uploads/')) {
          localPath = urlObj.pathname;
        }
      } catch (e) {
        // ignore invalid URL
      }
    }

    // If the image is locally uploaded via our editor
    if (localPath) {
      try {
        const filePath = path.join(process.cwd(), 'public', localPath);
        const buffer = fs.readFileSync(filePath);
        const fileName = path.basename(localPath);
        const mimeType = 'image/' + (path.extname(localPath).slice(1) || 'png');
        
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
        console.error('Failed to upload local image', e);
      }
    }
  }

  return { html: root.toString() };
}
