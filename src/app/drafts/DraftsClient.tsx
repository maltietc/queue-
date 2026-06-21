'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Edit2, FileEdit, Search } from 'lucide-react';
import { getPlatformById } from '@/lib/socialPlatforms';

export default function DraftsClient({ drafts }: { drafts: any[] }) {
  const router = useRouter();

  // Search, filter and sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrid, setSelectedGrid] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, title

  // Extract unique grid categories from drafts publications
  const allGrids = useMemo(() => {
    const grids = new Set<string>();
    drafts.forEach(post => {
      post.publications?.forEach((p: any) => {
        if (p.channel?.category) {
          grids.add(p.channel.category);
        }
      });
    });
    return Array.from(grids);
  }, [drafts]);

  // Extract unique channels from drafts publications
  const allChannels = useMemo(() => {
    const channelsMap = new Map<string, any>();
    drafts.forEach(post => {
      post.publications?.forEach((p: any) => {
        if (p.channel) {
          channelsMap.set(p.channel.id, p.channel);
        }
      });
    });
    return Array.from(channelsMap.values());
  }, [drafts]);

  // Filtered and sorted drafts
  const filteredDrafts = useMemo(() => {
    return drafts
      .filter(post => {
        const plainText = post.content
          .replace(/<[^>]*>?/gm, '')
          .replace(/&nbsp;/g, ' ')
          .toLowerCase();

        // Search text filter
        const matchesSearch = plainText.includes(searchQuery.toLowerCase());

        // Grid network filter
        const postGrids = post.publications?.map((p: any) => p.channel?.category).filter(Boolean) || [];
        const matchesGrid = !selectedGrid || postGrids.includes(selectedGrid);

        // Specific channel filter
        const postChannelIds = post.publications?.map((p: any) => p.channelId) || [];
        const matchesChannel = !selectedChannelId || postChannelIds.includes(selectedChannelId);

        return matchesSearch && matchesGrid && matchesChannel;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime();
        }
        if (sortBy === 'title') {
          const titleA = a.content.replace(/<[^>]*>?/gm, '').trim().toLowerCase();
          const titleB = b.content.replace(/<[^>]*>?/gm, '').trim().toLowerCase();
          return titleA.localeCompare(titleB);
        }
        return 0;
      });
  }, [drafts, searchQuery, selectedGrid, selectedChannelId, sortBy]);

  // Empty state (no drafts created at all)
  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <FileEdit size={40} style={{ color: 'var(--text-tertiary)' }} />
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Черновиков пока нет</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Создайте пост и сохраните как черновик
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters and Sorting Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] select-none">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
          <input
            className="notion-input"
            style={{ paddingLeft: '30px', height: '32px', fontSize: '13px' }}
            placeholder="Поиск по тексту черновика..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Grid selector */}
        {allGrids.length > 0 && (
          <select
            className="notion-select"
            style={{ width: 'auto', minWidth: '140px', height: '32px', padding: '0 28px 0 10px', fontSize: '13px' }}
            value={selectedGrid}
            onChange={e => setSelectedGrid(e.target.value)}
          >
            <option value="">Все сетки</option>
            {allGrids.map(grid => (
              <option key={grid} value={grid}>{grid}</option>
            ))}
          </select>
        )}

        {/* Channel selector */}
        {allChannels.length > 0 && (
          <select
            className="notion-select"
            style={{ width: 'auto', minWidth: '140px', height: '32px', padding: '0 28px 0 10px', fontSize: '13px' }}
            value={selectedChannelId}
            onChange={e => setSelectedChannelId(e.target.value)}
          >
            <option value="">Все каналы</option>
            {allChannels.map(channel => (
              <option key={channel.id} value={channel.id}>{channel.name}</option>
            ))}
          </select>
        )}

        {/* Sort order */}
        <select
          className="notion-select"
          style={{ width: 'auto', minWidth: '140px', height: '32px', padding: '0 28px 0 10px', fontSize: '13px' }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
          <option value="title">По алфавиту</option>
        </select>
      </div>

      {/* Drafts List */}
      {filteredDrafts.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2 text-center border border-dashed border-[var(--border-default)] rounded-md">
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Черновики с выбранными фильтрами не найдены</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedGrid(''); setSelectedChannelId(''); }}
            className="notion-btn notion-btn-ghost text-xs"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {filteredDrafts.map((post) => {
            const plainText = post.content
              .replace(/<[^>]*>?/gm, '')
              .replace(/&nbsp;/g, ' ')
              .trim();
            const title = plainText.length > 90 ? plainText.substring(0, 90) + '…' : plainText;
            const date = format(new Date(post.updatedAt || post.createdAt), 'd MMMM, HH:mm', { locale: ru });

            const postChannels = post.publications?.map((p: any) => p.channel).filter(Boolean) || [];

            return (
              <div
                key={post.id}
                onClick={() => router.push(`/?id=${post.id}`)}
                className="group flex flex-col px-4 py-3 rounded-md cursor-pointer transition-all hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-default)] bg-[var(--bg-primary)]"
                style={{ borderRadius: 'var(--radius-md)', paddingBottom: '12px' }}
              >
                {/* Main Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Doc icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center bg-[var(--bg-secondary)]">
                      <FileEdit size={14} style={{ color: 'var(--text-tertiary)' }} />
                    </div>

                    {/* Title */}
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {title || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Пост без текста</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {/* Date */}
                    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>{date}</span>

                    {/* Edit button on hover */}
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--accent)' }}
                    >
                      <Edit2 size={13} />
                      Открыть
                    </div>
                  </div>
                </div>

                {/* Channels & Grids Row */}
                <div className="flex flex-wrap gap-1.5 mt-2 pl-11">
                  {postChannels.map((channel: any) => {
                    const platform = getPlatformById(channel.platform);
                    return (
                      <span 
                        key={channel.id} 
                        className="notion-tag flex items-center gap-1 text-[10px] font-medium py-0.5 px-1.5 rounded-sm"
                        style={{
                          background: platform?.bgColor || 'var(--bg-secondary)',
                          color: platform?.color || 'var(--text-secondary)',
                          border: `1px solid ${platform?.color || 'var(--border-default)'}20`
                        }}
                      >
                        <span className="text-[7px]">●</span>
                        {channel.name}
                        {channel.category && (
                          <span className="opacity-60 font-normal">({channel.category})</span>
                        )}
                      </span>
                    );
                  })}
                  {postChannels.length === 0 && (
                    <span className="text-[10px] italic" style={{ color: 'var(--text-tertiary)' }}>
                      Направления публикации не выбраны (сохранено как черновик)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
