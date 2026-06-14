export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron');
    const { PrismaClient } = await import('@prisma/client');
    const { sendRichMessage } = await import('@/lib/telegram/provider');
    
    const prisma = new PrismaClient();

    // Check every minute for scheduled publications
    cron.default.schedule('* * * * *', async () => {
      console.log('Cron tick: Checking for scheduled publications...');
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        console.warn('Telegram bot token not configured. Cron skip.');
        return;
      }

      try {
        const pubsToPublish = await prisma.postPublication.findMany({
          where: {
            status: { in: ['SCHEDULED', 'PENDING'] },
            post: {
              publishAt: { lte: new Date() }
            },
            channel: {
              isActive: true
            }
          },
          include: {
            post: true,
            channel: true,
          }
        });

        for (const pub of pubsToPublish) {
          console.log(`Publishing post ${pub.postId} to channel ${pub.channel.name}`);
          
          if (pub.channel.platform === 'TELEGRAM') {
            try {
              const data = await sendRichMessage(botToken, pub.channel.platformId, pub.post.content);
              
              await prisma.postPublication.update({
                where: { id: pub.id },
                data: { status: 'SUCCESS', externalId: data.result?.message_id?.toString() },
              });
              
              // If all publications for this post are SUCCESS, mark Post as PUBLISHED
              const otherPubs = await prisma.postPublication.findMany({ where: { postId: pub.postId } });
              const allDone = otherPubs.every(p => p.status === 'SUCCESS' || p.id === pub.id);
              if (allDone) {
                await prisma.post.update({ where: { id: pub.postId }, data: { status: 'PUBLISHED' }});
              }
              
              console.log(`Successfully published to ${pub.channel.name}`);
            } catch (e: any) {
              console.error(`Failed to publish to ${pub.channel.name}`, e);
              await prisma.postPublication.update({
                where: { id: pub.id },
                data: { status: 'ERROR', errorMsg: e.message },
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking scheduled posts:', error);
      }
    });
  }
}
