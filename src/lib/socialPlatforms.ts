export type SocialPlatform = {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  icon: string; // SVG path or emoji-based identifier
  connected: boolean; // true = real integration, false = coming soon
  placeholder: string; // hint for platformId field
  description: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'TELEGRAM',
    name: 'Telegram',
    color: '#0088cc',
    bgColor: '#e8f4fd',
    icon: 'telegram',
    connected: true,
    placeholder: '@mychannel или -100123456789',
    description: 'Каналы и чаты',
  },

  {
    id: 'YOUTUBE',
    name: 'YouTube',
    color: '#FF0000',
    bgColor: '#fde8e8',
    icon: 'youtube',
    connected: true,
    placeholder: 'ID канала',
    description: 'YouTube каналы',
  },
  {
    id: 'INSTAGRAM',
    name: 'Instagram',
    color: '#E1306C',
    bgColor: '#fde8f1',
    icon: 'instagram',
    connected: true,
    placeholder: '@username',
    description: 'Аккаунты и бизнес-страницы',
  },
  {
    id: 'TWITTER',
    name: 'X (Twitter)',
    color: '#000000',
    bgColor: '#f0f0f0',
    icon: 'twitter',
    connected: true,
    placeholder: '@username',
    description: 'Аккаунты',
  },
  {
    id: 'TIKTOK',
    name: 'TikTok',
    color: '#010101',
    bgColor: '#f0f0f0',
    icon: 'tiktok',
    connected: true,
    placeholder: '@username',
    description: 'Аккаунты',
  },
  {
    id: 'TELETYPE',
    name: 'Teletype',
    color: '#5B41F5',
    bgColor: '#efeefd',
    icon: 'teletype',
    connected: true,
    placeholder: 'Имя блога или токен API',
    description: 'Блоги teletype.in',
  },
];

export function getPlatformById(id: string): SocialPlatform | undefined {
  return SOCIAL_PLATFORMS.find(p => p.id === id);
}
