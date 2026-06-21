'use client';

import { useState } from 'react';
import Editor from '@/components/Editor';
import { createPost, sendPreview } from './actions';
import { Send, Save, AlertCircle, CalendarClock, Eye, LayoutGrid, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPlatformById } from '@/lib/socialPlatforms';

export default function EditorClient({ initialPost, channels = [] }: { initialPost?: any, channels?: any[] }) {
  const router = useRouter();
  const [content, setContent] = useState(initialPost?.content || '');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Channel selection: default to empty array [] on new posts, or load existing post publications
  const initialSelected = initialPost?.publications?.length
    ? initialPost.publications.map((p: any) => p.channelId)
    : [];
  const [selectedChannels, setSelectedChannels] = useState<string[]>(initialSelected);

  // Scheduling state
  const isInitiallyScheduled = initialPost?.status === 'SCHEDULED' && initialPost?.publishAt;
  const initialDate = isInitiallyScheduled ? new Date(initialPost.publishAt).toISOString().split('T')[0] : '';
  const initialTime = isInitiallyScheduled ? new Date(initialPost.publishAt).toTimeString().substring(0, 5) : '';
  const [publishDate, setPublishDate] = useState<string>(initialDate);
  const [publishTime, setPublishTime] = useState<string>(initialTime);

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMode, setModalMode] = useState<'PUBLISH' | 'SCHEDULE' | 'DRAFT'>('PUBLISH');

  const handleConfirmAction = async () => {
    if (!content || content === '<p></p>') {
      setError('Пост не может быть пустым');
      setShowConfirmModal(false);
      return;
    }

    if (modalMode !== 'DRAFT' && selectedChannels.length === 0) {
      setError('Выберите хотя бы один канал для публикации');
      setShowConfirmModal(false);
      return;
    }

    let scheduleDate: Date | null = null;
    if (modalMode === 'SCHEDULE') {
      if (!publishDate || !publishTime) {
        setError('Укажите дату и время для планирования');
        return;
      }
      scheduleDate = new Date(`${publishDate}T${publishTime}`);
      if (isNaN(scheduleDate.getTime())) {
        setError('Неверный формат даты или времени');
        return;
      }
      if (scheduleDate < new Date()) {
        setError('Время публикации должно быть в будущем');
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    const sendNow = modalMode === 'PUBLISH';
    // If we're saving as draft (and not scheduling), scheduleDate is null.
    // If it's a scheduled publication, sendNow is false and scheduleDate is set.
    const result = await createPost(content, sendNow, scheduleDate, initialPost?.id, selectedChannels);
    
    if (result.success) {
      setShowConfirmModal(false);
      if (modalMode === 'DRAFT') {
        router.push('/drafts');
      } else {
        router.push('/history');
      }
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

      {/* Editor area */}
      <Editor content={content} onChange={setContent} />

      {/* Error display on main screen (only if confirm modal is NOT open) */}
      {!showConfirmModal && error && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm"
          style={{ background: 'var(--danger-bg)', border: '1px solid rgba(235,87,87,0.2)', color: 'var(--danger)' }}
        >
          <AlertCircle size={15} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} style={{ color: 'var(--danger)', opacity: 0.6 }}><X size={14} /></button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {/* Primary: Publish now */}
        <button
          onClick={() => {
            if (!content || content === '<p></p>') { setError('Пост не может быть пустым'); return; }
            setError(null);
            setModalMode('PUBLISH');
            setShowConfirmModal(true);
          }}
          disabled={loading || previewLoading}
          className="notion-btn notion-btn-primary"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          <Send size={15} />
          Опубликовать
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
        <button
          onClick={() => {
            if (!content || content === '<p></p>') { setError('Пост не может быть пустым'); return; }
            setError(null);
            setModalMode('SCHEDULE');
            setShowConfirmModal(true);
          }}
          disabled={loading}
          className="notion-btn notion-btn-ghost"
        >
          <CalendarClock size={15} />
          Запланировать…
        </button>

        {/* Draft — right-aligned */}
        <button
          onClick={() => {
            if (!content || content === '<p></p>') { setError('Пост не может быть пустым'); return; }
            setError(null);
            setModalMode('DRAFT');
            setShowConfirmModal(true);
          }}
          disabled={loading}
          className="notion-btn notion-btn-ghost"
          style={{ marginLeft: 'auto' }}
        >
          <Save size={15} />
          Сохранить черновик
        </button>
      </div>

      {/* Safety Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-lg rounded-md overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]">
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {modalMode === 'PUBLISH' && 'Подтверждение публикации'}
                {modalMode === 'SCHEDULE' && 'Планирование публикации'}
                {modalMode === 'DRAFT' && 'Сохранение черновика'}
              </span>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[60vh]">
              
              {/* Local Error inside Modal */}
              {error && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm"
                  style={{ background: 'var(--danger-bg)', border: '1px solid rgba(235,87,87,0.2)', color: 'var(--danger)' }}
                >
                  <AlertCircle size={15} />
                  <span className="flex-1 text-xs">{error}</span>
                  <button onClick={() => setError(null)} style={{ color: 'var(--danger)', opacity: 0.6 }}><X size={14} /></button>
                </div>
              )}

              {/* Channel Selector */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  <LayoutGrid size={12} />
                  Выберите каналы для отправки
                </label>
                {channels.length === 0 ? (
                  <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
                    Нет доступных каналов. Пост сохранится как черновик без направлений.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {channels.map(channel => {
                      const platform = getPlatformById(channel.platform);
                      const isChecked = selectedChannels.includes(channel.id);
                      return (
                        <label
                          key={channel.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all border text-sm select-none"
                          style={{
                            borderColor: isChecked ? (platform?.color || 'var(--accent)') : 'var(--border-default)',
                            background: isChecked ? (platform?.bgColor || 'var(--accent-bg)') : 'var(--bg-primary)',
                            color: isChecked ? (platform?.color || 'var(--accent)') : 'var(--text-primary)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedChannels([...selectedChannels, channel.id]);
                              else setSelectedChannels(selectedChannels.filter(id => id !== channel.id));
                            }}
                            className="notion-checkbox"
                          />
                          <span style={{ color: platform?.color }}>●</span>
                          <span className="flex-1 truncate font-medium">{channel.name}</span>
                          {channel.category && (
                            <span className="text-[10px] opacity-70 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-normal">
                              {channel.category}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Warnings and Info Badges */}
              {modalMode !== 'DRAFT' && selectedChannels.length === 0 && (
                <div
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-sm text-xs"
                  style={{ background: 'var(--warning-bg)', border: '1px solid rgba(223,171,1,0.25)', color: 'var(--text-primary)' }}
                >
                  <AlertCircle size={15} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '1px' }} />
                  <span>Для публикации или планирования необходимо выбрать как минимум один канал.</span>
                </div>
              )}

              {modalMode === 'DRAFT' && selectedChannels.length === 0 && (
                <div
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-sm text-xs"
                  style={{ background: 'var(--accent-bg)', border: '1px solid rgba(35,131,226,0.2)', color: 'var(--text-primary)' }}
                >
                  <AlertCircle size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }} />
                  <span>Черновик сохранится без привязки к направлениям. Вы сможете выбрать каналы при финальной публикации.</span>
                </div>
              )}

              {/* Schedule Panel options */}
              {modalMode === 'SCHEDULE' && (
                <div className="flex flex-col gap-3 p-3 border border-[var(--border-default)] rounded bg-[var(--bg-secondary)]">
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    Настройки планирования
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Дата</label>
                      <input
                        type="date"
                        value={publishDate}
                        onChange={e => setPublishDate(e.target.value)}
                        className="notion-input bg-[var(--bg-primary)]"
                        style={{ height: '32px', fontSize: '13px' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Время</label>
                      <input
                        type="time"
                        value={publishTime}
                        onChange={e => setPublishTime(e.target.value)}
                        className="notion-input bg-[var(--bg-primary)]"
                        style={{ height: '32px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="notion-btn notion-btn-ghost text-xs"
                disabled={loading}
              >
                Отмена
              </button>
              
              <button
                onClick={handleConfirmAction}
                disabled={loading || (modalMode !== 'DRAFT' && selectedChannels.length === 0)}
                className="notion-btn notion-btn-primary text-xs"
                style={{
                  opacity: loading || (modalMode !== 'DRAFT' && selectedChannels.length === 0) ? 0.6 : 1,
                  background: modalMode === 'DRAFT' ? 'var(--success)' : 'var(--accent)'
                }}
              >
                {modalMode === 'PUBLISH' && (
                  <>
                    <Send size={13} />
                    {loading ? 'Публикация…' : 'Опубликовать сейчас'}
                  </>
                )}
                {modalMode === 'SCHEDULE' && (
                  <>
                    <CalendarClock size={13} />
                    {loading ? 'Планирование…' : 'Запланировать'}
                  </>
                )}
                {modalMode === 'DRAFT' && (
                  <>
                    <Check size={13} />
                    {loading ? 'Сохранение…' : 'Сохранить как черновик'}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

