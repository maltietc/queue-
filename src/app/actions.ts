'use server';

import { PrismaClient } from '@prisma/client';
import { sendRichMessage } from '@/lib/telegram/provider';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function createPost(content: string, sendNow: boolean, publishAt?: Date | null, id?: string, channelIds: string[] = []) {
  try {
    const status = sendNow ? 'PUBLISHED' : (publishAt ? 'SCHEDULED' : 'DRAFT');
    
    let post;
    if (id) {
      post = await prisma.post.update({
        where: { id },
        data: { content, status, publishAt: publishAt || null },
      });
      // Clear old publications to recreate them
      await prisma.postPublication.deleteMany({ where: { postId: id } });
    } else {
      post = await prisma.post.create({
        data: { content, status, publishAt: publishAt || null },
      });
    }

    // Create publications
    for (const channelId of channelIds) {
      let pubStatus = 'DRAFT';
      if (sendNow) pubStatus = 'PENDING';
      else if (publishAt) pubStatus = 'SCHEDULED';
      
      await prisma.postPublication.create({
        data: {
          postId: post.id,
          channelId,
          status: pubStatus,
        },
      });
    }

    if (sendNow) {
      // Background execution for immediate sending will be handled by the next tick or directly here.
      // For simplicity, we can just let instrumentation pick it up if it runs every minute,
      // or we can invoke a send function directly. 
      // Let's invoke it directly for fast response:
      // (Implementation requires calling provider.ts directly for each channel, but for now we just rely on cron or direct send)
      // Actually we'll need a helper to send immediately. Let's do a basic loop:
      const publications = await prisma.postPublication.findMany({
        where: { postId: post.id },
        include: { channel: true }
      });
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) throw new Error("BOT TOKEN IS MISSING");
      
      const { sendRichMessage } = require('@/lib/telegram/provider');
      
      for (const pub of publications) {
        if (pub.channel.platform === 'TELEGRAM') {
          try {
            const data = await sendRichMessage(botToken, pub.channel.platformId, content);
            await prisma.postPublication.update({
              where: { id: pub.id },
              data: { status: 'SUCCESS', externalId: data.result.message_id.toString() }
            });
          } catch (e: any) {
            await prisma.postPublication.update({
              where: { id: pub.id },
              data: { status: 'ERROR', errorMsg: e.message }
            });
          }
        }
      }
    }

    return { success: true, post };
  } catch (error: any) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
  }
}

// Channels API
export async function getChannels() {
  return await prisma.channel.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createChannel(name: string, platform: string, platformId: string, isTestChannel: boolean = false, category?: string) {
  return await prisma.channel.create({
    data: { name, platform, platformId, isTestChannel, category: category || null }
  });
}

export async function deleteChannel(id: string) {
  return await prisma.channel.delete({ where: { id } });
}

export async function toggleChannel(id: string, isActive: boolean) {
  const channel = await prisma.channel.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath('/channels');
  return channel;
}

export async function updateChannel(
  id: string, 
  name: string, 
  platform: string, 
  platformId: string, 
  isTestChannel: boolean = false, 
  category?: string, 
  credentials?: string
) {
  const channel = await prisma.channel.update({
    where: { id },
    data: { 
      name, 
      platform, 
      platformId, 
      isTestChannel, 
      category: category || null, 
      credentials: credentials || null 
    }
  });
  revalidatePath('/channels');
  return channel;
}

export async function getPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      publications: {
        include: { channel: true }
      }
    }
  });
  return posts;
}

export async function getPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      publications: {
        include: { channel: true }
      }
    }
  });
  return post;
}

export async function sendPreview(content: string) {
  try {
    const testChannel = await prisma.channel.findFirst({
      where: { isTestChannel: true, platform: 'TELEGRAM', isActive: true }
    });
    
    if (!testChannel) {
      return { success: false, error: 'Тестовый канал не найден. Пожалуйста, добавьте или отметьте его в разделе Каналы.' };
    }
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error("BOT TOKEN IS MISSING");
    
    const { sendRichMessage } = require('@/lib/telegram/provider');
    await sendRichMessage(botToken, testChannel.platformId, content);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending preview:', error);
    return { success: false, error: error.message || 'Ошибка отправки превью' };
  }
}
