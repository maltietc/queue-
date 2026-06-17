import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);

    let buffer: Buffer;
    let ext: string;

    // Check if the file is a GIF
    if (file.type === 'image/gif') {
      // Save GIF as is to preserve animation
      buffer = originalBuffer;
      ext = '.gif';
    } else {
      // Resize other images to optimal 1200px width, keeping aspect ratio, and convert to JPEG for optimal size
      buffer = await sharp(originalBuffer)
        .resize({
          width: 1200,
          fit: 'inside',      // maintain aspect ratio
          withoutEnlargement: false, // will enlarge if smaller than 1200px as requested
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      ext = '.jpg';
    }

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Return the URL that can be used in the src attribute
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
