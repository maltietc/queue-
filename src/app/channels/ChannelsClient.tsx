'use client';

import { useState } from 'react';
import { createChannel, deleteChannel, toggleChannel } from '../actions';
import { Send, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChannelsClient({ initialChannels }: { initialChannels: any[] }) {
  const router = useRouter();
  const [channels, setChannels] = useState(initialChannels);
  const [loading, setLoading] = useState(false);
  
  // New channel form
  const [name, setName] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [error, setError] = useState('');

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !platformId) {
      setError('Заполните все поля');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const newChannel = await createChannel(name, 'TELEGRAM', platformId);
      setChannels([newChannel, ...channels]);
      setName('');
      setPlatformId('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении канала');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот канал?')) return;
    try {
      await deleteChannel(id);
      setChannels(channels.filter(c => c.id !== id));
      router.refresh();
    } catch (e) {
      alert('Ошибка при удалении');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleChannel(id, !currentStatus);
      setChannels(channels.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      router.refresh();
    } catch (e) {
      alert('Ошибка при обновлении статуса');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Add New Channel */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Добавить Telegram Канал / Чат</h2>
        <form onSubmit={handleAddChannel} className="flex flex-col gap-4 max-w-md">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Название (для себя)</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Мой блог"
              className="bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500" 
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Chat ID или @username</label>
            <input 
              type="text" 
              value={platformId}
              onChange={e => setPlatformId(e.target.value)}
              placeholder="Например: @mychannel или -100123456"
              className="bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500" 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors mt-2"
          >
            <Send size={18} />
            Добавить
          </button>
        </form>
      </div>

      {/* List Channels */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold mb-2">Ваши каналы</h2>
        {channels.length === 0 ? (
          <p className="text-gray-500">У вас пока нет добавленных каналов.</p>
        ) : (
          channels.map(channel => (
            <div key={channel.id} className="flex items-center justify-between bg-[#1a1a1a] border border-[#333] p-4 rounded-lg">
              <div className="flex flex-col">
                <span className="font-medium text-lg">{channel.name}</span>
                <span className="text-sm text-gray-500 font-mono">{channel.platformId}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleToggle(channel.id, channel.isActive)}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    channel.isActive 
                      ? 'bg-green-900/30 text-green-400 border-green-800/50 hover:bg-green-900/50' 
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {channel.isActive ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  {channel.isActive ? 'Активен' : 'Отключен'}
                </button>

                <button 
                  onClick={() => handleDelete(channel.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
                  title="Удалить"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
