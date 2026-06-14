import { getChannels } from '../actions';
import ChannelsClient from './ChannelsClient';

export default async function ChannelsPage() {
  const channels = await getChannels();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Каналы и Интеграции
        </h1>
        <p className="text-gray-400 mt-2">Управляйте вашими Telegram-каналами и чатами</p>
      </header>

      <ChannelsClient initialChannels={channels} />
    </div>
  );
}
