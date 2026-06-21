'use client';

import { useState } from 'react';
import Editor from '@/components/Editor';
import { createPost, sendPreview } from './actions';
import { Send, Save, AlertCircle, CalendarClock, Eye, LayoutGrid, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPlatformById } from '@/lib/socialPlatforms';

export default function EditorClient({ initialPost, channels = [] }: { initialPost?: any, channels?: any[] }) {
  const router = useRouter();
  const [content, setContent] = useState(initialPost?.content || '');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
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
    if (!content || content === '<p></p>') { setError('Пост не может быть пустым'); return; }
    if (selectedChannels.length === 0) { setError('Выберите хотя бы один канал'); return; }

    let scheduleDate: Date | null = null;
    if (!sendNow && isScheduling) {
      if (!publishDate || !publishTime) { setError('Укажите дату и время'); return; }
      scheduleDate = new Date(`${publishDate}T${publishTime}`);
      if (scheduleDate < new Date()) { setError('Время публикации должно быть в будущем'); return; }
    }

    setLoading(true);
    setError(null);
    const result = await createPost(content, sendNow, scheduleDate, initialPost?.id, selectedChannels);
    if (result.success) {
      router.push('/history');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!content || content === '<p></p>') { setError('Пост не может быть пустым'); return; }
    setPreviewLoading(true);
    setError(null);
    const result = await sendPreview(content);
    if (!result.success) {
      setError(result.error || 'Ошибка отправки превью');
    } else {
      // Subtle success feedback without alert
      const btn = document.getElementById('preview-btn');
      if (btn) {
        btn.textContent = '✓ Отправлено!';
        setTimeout(() => { btn.textContent = 'Превью'; }, 2000);
      }
    }
    setPreviewLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* No channels warning */}
      {channels.length === 0 && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-sm text-sm"
          style={{ background: 'var(--warning-bg)', border: '1px solid rgba(223,171,1,0.25)', color: 'var(--text-primary)' }}
        >
          <AlertCircle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '1px' }} />
          <span>
            Нет активных каналов. Посты сохранятся в черновик.{' '}
            <a href="/channels" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
              Добавить канал
            </a>
          </span>
        </div>
      )}

      {/* Channel selector */}
      {channels.length > 0 && (
        <div
          className="flex flex-col gap-2 px-4 py-3 rounded-sm"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
        >
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            <LayoutGrid size={12} />
            Каналы для публикации
          </label>
          <div className="flex flex-wrap gap-2">
            {channels.map(channel => {
              const platform = getPlatformById(channel.platform);
              const isChecked = selectedChannels.includes(channel.id);
              return (
                <label
                  key={channel.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-sm cursor-pointer transition-all text-sm"
                  style={{
                    border: isChecked ? `1.5px solid ${platform?.color || 'var(--accent)'}` : '1.5px solid var(--border-medium)',
                    background: isChecked ? (platform?.bgColor || 'var(--accent-bg)') : 'var(--bg-primary)',
                    color: isChecked ? (platform?.color || 'var(--accent)') : 'var(--text-secondary)',
                    fontWeight: isChecked ? '500' : '400',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedChannels([...selectedChannels, channel.id]);
                      else setSelectedChannels(selectedChannels.filter(id => id !== channel.id));
                    }}
                    className="hidden"
                  />
                  <span style={{ color: platform?.color }}>{/* platform icon placeholder */}●</span>
                  {channel.name}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Editor area */}
      <Editor content={content} onChange={setContent} />

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm"
          style={{ background: 'var(--danger-bg)', border: '1px solid rgba(235,87,87,0.2)', color: 'var(--danger)' }}
        >
          <AlertCircle size={15} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} style={{ color: 'var(--danger)', opacity: 0.6 }}><X size={14} /></button>
        </div>
      )}

      {/* Schedule panel */}
      {isScheduling && (
        <div
          className="flex flex-wrap gap-4 items-end px-4 py-3 rounded-sm"
          style={{ background: 'var(--accent-bg)', border: '1px solid rgba(35,131,226,0.2)' }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Дата</label>
            <input
              type="date"
              value={publishDate}
              onChange={e => setPublishDate(e.target.value)}
              className="notion-input"
              style={{ width: 'auto' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Время</label>
            <input
              type="time"
              value={publishTime}
              onChange={e => setPublishTime(e.target.value)}
              className="notion-input"
              style={{ width: 'auto' }}
            />
          </div>
          <button
            onClick={() => setIsScheduling(false)}
            className="notion-btn notion-btn-ghost"
            style={{ fontSize: '12px', gap: '4px' }}
          >
            <X size={13} />
            Отмена
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {/* Primary: Publish now */}
        <button
          onClick={() => handlePublish(true)}
          disabled={loading || previewLoading}
          className="notion-btn notion-btn-primary"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          <Send size={15} />
          {loading ? 'Публикация…' : 'Опубликовать'}
        </button>

        {/* Preview */}
        <button
          id="preview-btn"
          onClick={handlePreview}
          disabled={previewLoading || loading}
          className="notion-btn notion-btn-default"
        >
          <Eye size={15} />
          Превью
        </button>

        {/* Schedule */}
        {isScheduling ? (
          <button
            onClick={() => handlePublish(false)}
            disabled={loading}
            className="notion-btn"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid rgba(35,131,226,0.3)' }}
          >
            <CalendarClock size={15} />
            Запланировать
          </button>
        ) : (
          <button
            onClick={() => setIsScheduling(true)}
            className="notion-btn notion-btn-ghost"
          >
            <CalendarClock size={15} />
            Запланировать…
          </button>
        )}

        {/* Draft — right-aligned */}
        <button
          onClick={() => handlePublish(false)}
          disabled={loading}
          className="notion-btn notion-btn-ghost"
          style={{ marginLeft: 'auto' }}
        >
          <Save size={15} />
          Сохранить черновик
        </button>
      </div>
    </div>
  );
}
