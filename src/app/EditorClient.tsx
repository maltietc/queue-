'use client';

import { useState } from 'react';
import Editor from '@/components/Editor';
import { createPost } from './actions';
import { Send, Save, AlertCircle, CalendarClock, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EditorClient({ initialPost, channels = [] }: { initialPost?: any, channels?: any[] }) {
  const router = useRouter();
  const [content, setContent] = useState(initialPost?.content || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Channel selection
  const initialSelected = initialPost?.publications?.length 
    ? initialPost.publications.map((p: any) => p.channelId) 
    : channels.map(c => c.id);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(initialSelected);
  
  // Scheduling state
  const isInitiallyScheduled = initialPost?.status === 'SCHEDULED' && initialPost?.publishAt;
  const initialDate = isInitiallyScheduled ? new Date(initialPost.publishAt).toISOString().split('T')[0] : '';
  const initialTime = isInitiallyScheduled ? new Date(initialPost.publishAt).toTimeString().substring(0, 5) : '';

  const [isScheduling, setIsScheduling] = useState(!!isInitiallyScheduled);
  const [publishDate, setPublishDate] = useState<string>(initialDate);
  const [publishTime, setPublishTime] = useState<string>(initialTime);

  const handlePublish = async (sendNow: boolean) => {
    if (!content || content === '<p></p>') {
      setError('Пост не может быть пустым');
      return;
    }
    
    if (selectedChannels.length === 0) {
      setError('Выберите хотя бы один канал для публикации');
      return;
    }

    let scheduleDate: Date | null = null;
    if (!sendNow && isScheduling) {
      if (!publishDate || !publishTime) {
        setError('Укажите дату и время для отложки');
        return;
      }
      scheduleDate = new Date(`${publishDate}T${publishTime}`);
      if (scheduleDate < new Date()) {
        setError('Время публикации должно быть в будущем');
        return;
      }
    }

    setLoading(true);
    setError(null);

    const result = await createPost(content, sendNow, scheduleDate, initialPost?.id, selectedChannels);
    
    if (result.success) {
      router.push('/history');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-xl flex flex-col gap-4">
      
      {/* Channels Selector */}
      {channels.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 flex items-center gap-2">
            <Network size={16} /> Выберите каналы для публикации:
          </label>
          <div className="flex flex-wrap gap-2">
            {channels.map(channel => (
              <label 
                key={channel.id} 
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  selectedChannels.includes(channel.id) 
                    ? 'bg-blue-900/30 border-blue-500/50 text-white' 
                    : 'bg-[#111] border-[#333] text-gray-400 hover:bg-[#222]'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={selectedChannels.includes(channel.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedChannels([...selectedChannels, channel.id]);
                    } else {
                      setSelectedChannels(selectedChannels.filter(id => id !== channel.id));
                    }
                  }}
                  className="hidden"
                />
                <span className="font-medium text-sm">{channel.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {channels.length === 0 && (
        <div className="p-4 bg-orange-900/30 border border-orange-500/50 rounded-lg text-orange-200 text-sm">
          У вас не добавлено ни одного канала. Посты будут сохраняться только в черновики. Перейдите в раздел "Каналы" чтобы добавить интеграцию.
        </div>
      )}

      <Editor content={content} onChange={setContent} />
      
      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded flex items-center gap-2 text-red-200">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isScheduling && (
        <div className="mt-4 p-4 bg-[#222] border border-[#333] rounded-lg flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Дата</label>
            <input 
              type="date" 
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500" 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Время</label>
            <input 
              type="time" 
              value={publishTime}
              onChange={(e) => setPublishTime(e.target.value)}
              className="bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500" 
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => handlePublish(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Send size={18} />
          Опубликовать сейчас
        </button>
        
        {isScheduling ? (
          <button
            onClick={() => handlePublish(false)}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <CalendarClock size={18} />
            Запланировать публикацию
          </button>
        ) : (
          <button
            onClick={() => setIsScheduling(true)}
            type="button"
            className="flex items-center gap-2 bg-[#222] hover:bg-[#333] border border-[#444] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <CalendarClock size={18} />
            Запланировать...
          </button>
        )}

        <button
          onClick={() => handlePublish(false)}
          disabled={loading}
          className="flex items-center gap-2 bg-transparent hover:bg-[#222] border border-[var(--border)] disabled:opacity-50 text-gray-300 px-6 py-2.5 rounded-lg font-medium transition-colors ml-auto"
        >
          <Save size={18} />
          Сохранить черновик
        </button>
      </div>
    </div>
  );
}
