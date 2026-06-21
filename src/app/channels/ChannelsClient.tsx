'use client';

import React, { useState, useMemo } from 'react';
import { createChannel, deleteChannel, toggleChannel } from '../actions';
import { useRouter } from 'next/navigation';
import { SOCIAL_PLATFORMS, getPlatformById } from '@/lib/socialPlatforms';
import {
  LayoutList, LayoutGrid, Plus, Trash2, CheckCircle2, Circle, X,
  ChevronDown, Send, Search, Tag
} from 'lucide-react';

// ── Platform icon SVGs (inline) ──────────────────────────────────────────────
function PlatformIcon({ platformId, size = 16 }: { platformId: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    TELEGRAM: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.01 9.47c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.873.751z" />
      </svg>
    ),
    VK: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.271.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.491-.085.745-.576.745z" />
      </svg>
    ),
    YOUTUBE: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
    INSTAGRAM: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    TWITTER: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    TIKTOK: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.11 8.11 0 0 0 4.76 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
      </svg>
    ),
  };
  return icons[platformId] || <span style={{ fontSize: size * 0.7 }}>●</span>;
}

// (no preset networks — user defines their own)

type ViewMode = 'list' | 'grid';

export default function ChannelsClient({ initialChannels }: { initialChannels: any[] }) {
  const router = useRouter();
  const [channels, setChannels] = useState(initialChannels);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('TELEGRAM');
  const [platformId, setPlatformId] = useState('');
  const [category, setCategory] = useState('');
  const [isTestChannel, setIsTestChannel] = useState(false);
  const [error, setError] = useState('');

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');

  const currentPlatform = getPlatformById(selectedPlatform);

  // Filtered + grouped channels
  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.platformId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = !filterCategory || c.category === filterCategory;
      const matchPlatform = !filterPlatform || c.platform === filterPlatform;
      return matchSearch && matchCategory && matchPlatform;
    });
  }, [channels, searchQuery, filterCategory, filterPlatform]);

  // All unique networks (user-defined)
  const allNetworks = useMemo(() => {
    const nets = new Set(channels.map(c => c.category).filter(Boolean));
    return Array.from(nets) as string[];
  }, [channels]);

  // Grouped by network for list view
  const groupedChannels = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredChannels.forEach(c => {
      const key = c.category || 'Без сетки';
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [filteredChannels]);

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !platformId) { setError('Заполните все поля'); return; }

    const platform = getPlatformById(selectedPlatform);
    if (platform && !platform.connected) {
      setError(`Интеграция с ${platform.name} ещё не реализована. Сейчас доступен только Telegram.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const newChannel = await createChannel(name, selectedPlatform, platformId, isTestChannel, category || undefined);
      setChannels([newChannel, ...channels]);
      setName(''); setPlatformId(''); setCategory(''); setIsTestChannel(false);
      setShowForm(false);
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
    } catch { alert('Ошибка при удалении'); }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleChannel(id, !current);
      setChannels(channels.map(c => c.id === id ? { ...c, isActive: !current } : c));
      router.refresh();
    } catch { alert('Ошибка при обновлении статуса'); }
  };

  // ── Channel Card (shared) ──────────────────────────────────────────────────
  const ChannelCard = ({ channel, grid = false }: { channel: any; grid?: boolean }) => {
    const platform = getPlatformById(channel.platform);
    return (
      <div
        className="group transition-all"
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: grid ? '16px' : '12px 16px',
          display: grid ? 'flex' : 'flex',
          flexDirection: grid ? 'column' : 'row',
          alignItems: grid ? 'flex-start' : 'center',
          gap: grid ? '12px' : '12px',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
      >
        {/* Platform icon */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: platform?.bgColor || 'var(--bg-secondary)', color: platform?.color || 'var(--text-secondary)' }}
        >
          <PlatformIcon platformId={channel.platform} size={18} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0" style={{ flexDirection: 'column' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{channel.name}</span>
            {channel.isTestChannel && (
              <span className="notion-tag" style={{ background: '#eee8ff', color: '#6e56cf', fontSize: '11px' }}>Тест</span>
            )}
            {channel.category && (
              <span className="notion-tag" style={{ fontSize: '11px', background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                <Tag size={10} />
                {channel.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{channel.platformId}</span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>·</span>
            <span className="text-xs" style={{ color: platform?.color || 'var(--text-tertiary)' }}>{platform?.name || channel.platform}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => handleToggle(channel.id, channel.isActive)}
            className="notion-btn notion-btn-ghost"
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              gap: '4px',
              color: channel.isActive ? 'var(--success)' : 'var(--text-tertiary)',
              background: channel.isActive ? 'var(--success-bg)' : 'var(--bg-hover)',
            }}
          >
            {channel.isActive ? <CheckCircle2 size={13} /> : <Circle size={13} />}
            {channel.isActive ? 'Активен' : 'Отключён'}
          </button>
          <button
            onClick={() => handleDelete(channel.id)}
            className="notion-btn notion-btn-danger opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ padding: '4px 6px' }}
            title="Удалить"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Каналы
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {channels.length} {channels.length === 1 ? 'канал' : channels.length < 5 ? 'канала' : 'каналов'} · {channels.filter(c => c.isActive).length} активных
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="notion-btn notion-btn-primary"
          style={{ gap: '6px' }}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Отмена' : 'Добавить канал'}
        </button>
      </div>

      {/* ── Add Channel Form ── */}
      {showForm && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
          }}
        >
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Новый канал</h2>

          {error && (
            <div className="mb-4 px-3 py-2 text-sm rounded-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(235,87,87,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAddChannel} className="flex flex-col gap-4">
            {/* Platform selector */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Платформа</label>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlatform(p.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all"
                    style={{
                      border: selectedPlatform === p.id ? `2px solid ${p.color}` : '1px solid var(--border-medium)',
                      background: selectedPlatform === p.id ? p.bgColor : 'var(--bg-primary)',
                      color: selectedPlatform === p.id ? p.color : 'var(--text-secondary)',
                      opacity: p.connected ? 1 : 0.55,
                      position: 'relative',
                    }}
                  >
                    <span style={{ color: p.color }}><PlatformIcon platformId={p.id} size={15} /></span>
                    {p.name}
                    {!p.connected && (
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: '2px' }}>скоро</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name + platformId row */}
            <div className="grid grid-cols-1 gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Название</label>
                <input
                  className="notion-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Мой блог"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {currentPlatform?.placeholder ? 'ID / Username' : 'ID канала'}
                </label>
                <input
                  className="notion-input"
                  type="text"
                  value={platformId}
                  onChange={e => setPlatformId(e.target.value)}
                  placeholder={currentPlatform?.placeholder || 'ID'}
                />
              </div>
            </div>

            {/* Network (Сетка) */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Сетка каналов
                <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '6px' }}>
                  (необязательно) — группирует каналы разных платформ
                </span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  className="notion-input"
                  style={{ maxWidth: '240px' }}
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Например: ПитуПи"
                  list="network-suggestions"
                />
                {/* Autocomplete from existing user-created networks */}
                <datalist id="network-suggestions">
                  {allNetworks.map(n => <option key={n} value={n} />)}
                </datalist>
                {/* Quick-pick chips from existing networks */}
                {allNetworks.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCategory(category === n ? '' : n)}
                    className="notion-tag"
                    style={{
                      cursor: 'pointer',
                      background: category === n ? 'var(--accent-bg)' : 'var(--bg-secondary)',
                      color: category === n ? 'var(--accent)' : 'var(--text-secondary)',
                      border: category === n ? '1px solid var(--accent)' : '1px solid var(--border-medium)',
                      transition: 'all 0.12s',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {category && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  Канал будет добавлен в сетку «{category}»
                </p>
              )}
            </div>

            {/* Test channel */}
            <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              <input
                type="checkbox"
                className="notion-checkbox"
                checked={isTestChannel}
                onChange={e => setIsTestChannel(e.target.checked)}
              />
              Тестовый канал (для предпросмотра постов)
            </label>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={loading} className="notion-btn notion-btn-primary" style={{ opacity: loading ? 0.6 : 1 }}>
                <Send size={14} />
                {loading ? 'Добавление...' : 'Добавить'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="notion-btn notion-btn-default">
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Toolbar: search + filters + view toggle ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1" style={{ minWidth: '180px', maxWidth: '280px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input
            className="notion-input"
            style={{ paddingLeft: '30px' }}
            placeholder="Поиск каналов..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Network filter */}
        {allNetworks.length > 0 && (
          <select
            className="notion-select"
            style={{ width: 'auto', minWidth: '140px' }}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">Все сетки</option>
            {allNetworks.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}

        {/* Platform filter */}
        <select
          className="notion-select"
          style={{ width: 'auto', minWidth: '130px' }}
          value={filterPlatform}
          onChange={e => setFilterPlatform(e.target.value)}
        >
          <option value="">Все платформы</option>
          {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {/* View toggle */}
        <div className="flex rounded-sm overflow-hidden ml-auto" style={{ border: '1px solid var(--border-medium)' }}>
          {(['list', 'grid'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: viewMode === mode ? 'var(--bg-active)' : 'var(--bg-primary)',
                color: viewMode === mode ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderRight: mode === 'list' ? '1px solid var(--border-medium)' : 'none',
              }}
            >
              {mode === 'list' ? <LayoutList size={14} /> : <LayoutGrid size={14} />}
              {mode === 'list' ? 'Список' : 'Сетка'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty State ── */}
      {channels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="text-4xl">📡</div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Каналов пока нет</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Добавьте первый канал, чтобы начать публикацию</p>
          <button onClick={() => setShowForm(true)} className="notion-btn notion-btn-primary mt-2">
            <Plus size={14} />
            Добавить канал
          </button>
        </div>
      )}

      {/* ── No results ── */}
      {channels.length > 0 && filteredChannels.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-2 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>Ничего не найдено</p>
          <button
            onClick={() => { setSearchQuery(''); setFilterCategory(''); setFilterPlatform(''); }}
            className="notion-btn notion-btn-ghost"
            style={{ fontSize: '13px' }}
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* ── Grid View ── */}
      {viewMode === 'grid' && filteredChannels.length > 0 && (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filteredChannels.map(c => (
            <ChannelCard key={c.id} channel={c} grid />
          ))}
        </div>
      )}

      {/* ── List View (grouped by network / сетка) ── */}
      {viewMode === 'list' && filteredChannels.length > 0 && (
        <div className="flex flex-col gap-6">
          {Object.entries(groupedChannels).map(([net, items]) => (
            <div key={net}>
              {/* Network header */}
              <div className="flex items-center gap-2 mb-2">
                <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: net === 'Без сетки' ? 'var(--text-tertiary)' : 'var(--accent)' }}
                >
                  {net === 'Без сетки' ? net : `Сетка · ${net}`}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({items.length})</span>
                <div className="flex-1" style={{ height: '1px', background: 'var(--border-default)' }} />
              </div>
              <div className="flex flex-col gap-2">
                {items.map(c => (
                  <ChannelCard key={c.id} channel={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
