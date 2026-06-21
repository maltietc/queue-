'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, History, CheckCircle2, Clock, FileText, AlertCircle, Trash2, Search } from 'lucide-react';
import { getPlatformById } from '@/lib/socialPlatforms';
import { deletePost } from '@/app/actions';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    PUBLISHED: { label: 'Опубликован', color: 'var(--success)', bg: 'var(--success-bg)', icon: <CheckCircle2 size={12} /> },
    SCHEDULED: { label: 'Запланирован', color: 'var(--accent)', bg: 'var(--accent-bg)', icon: <Clock size={12} /> },
    DRAFT: { label: 'Черновик', color: 'var(--text-tertiary)', bg: 'var(--bg-secondary)', icon: <FileText size={12} /> },
    DELETED: { label: 'Удален', color: 'var(--danger)', bg: 'var(--danger-bg)', icon: <Trash2 size={12} /> },
    ERROR: { label: 'Ошибка', color: 'var(--danger)', bg: 'var(--danger-bg)', icon: <AlertCircle size={12} /> },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span className="notion-tag flex items-center gap-1" style={{ color: s.color, background: s.bg }}>
      {s.icon}
      {s.label}
    </span>
  );
}

export default function HistoryClient({ posts }: { posts: any[] }) {
  const router = useRouter();

  // Filter and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGrid, setSelectedGrid] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, title

  // Extract unique grid categories from publications
  const allGrids = useMemo(() => {
    const grids = new Set<string>();
    posts.forEach(post => {
      post.publications?.forEach((p: any) => {
        if (p.channel?.category) {
          grids.add(p.channel.category);
        }
      });
    });
    return Array.from(grids);
  }, [posts]);

  // Extract unique channels from publications
  const allChannels = useMemo(() => {
    const channelsMap = new Map<string, any>();
    posts.forEach(post => {
      post.publications?.forEach((p: any) => {
        if (p.channel) {
          channelsMap.set(p.channel.id, p.channel);
        }
      });
    });
    return Array.from(channelsMap.values());
  }, [posts]);

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter(post => {
        const plainText = post.content
          .replace(/<[^>]*>?/gm, '')
          .replace(/&nbsp;/g, ' ')
          .toLowerCase();

        // 1. Text Search Filter
        const matchesSearch = plainText.includes(searchQuery.toLowerCase());

        // 2. Status Filter
        const matchesStatus = !selectedStatus || post.status === selectedStatus;

        // 3. Grid Network Filter
        const postGrids = post.publications?.map((p: any) => p.channel?.category).filter(Boolean) || [];
        const matchesGrid = !selectedGrid || postGrids.includes(selectedGrid);

        // 4. Specific Channel Filter
        const postChannelIds = post.publications?.map((p: any) => p.channelId) || [];
        const matchesChannel = !selectedChannelId || postChannelIds.includes(selectedChannelId);

        return matchesSearch && matchesStatus && matchesGrid && matchesChannel;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'title') {
          const titleA = a.content.replace(/<[^>]*>?/gm, '').trim().toLowerCase();
          const titleB = b.content.replace(/<[^>]*>?/gm, '').trim().toLowerCase();
          return titleA.localeCompare(titleB);
        }
        return 0;
      });
  }, [posts, searchQuery, selectedStatus, selectedGrid, selectedChannelId, sortBy]);

  const handleDelete = async (postId: string, currentStatus: string) => {
    const confirmMsg = currentStatus === 'DELETED'
      ? 'Вы уверены, что хотите окончательно удалить этот пост из базы данных? Это действие необратимо.'
      : 'Перенести этот пост в архив/удаленные?';

    if (confirm(confirmMsg)) {
      const res = await deletePost(postId);
      if (res.success) {
        router.refresh();
      } else {
        alert('Не удалось удалить пост: ' + res.error);
      }
    }
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <History size={40} style={{ color: 'var(--text-tertiary)' }} />
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>История пуста</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Опубликованные и запланированные посты появятся здесь</p>
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
            placeholder="Поиск по тексту поста..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="notion-select"
          style={{ width: 'auto', minWidth: '130px', height: '32px', padding: '0 28px 0 10px', fontSize: '13px' }}
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="PUBLISHED">Опубликовано</option>
          <option value="SCHEDULED">Запланировано</option>
          <option value="DRAFT">Черновики</option>
          <option value="DELETED">Удаленные</option>
          <option value="ERROR">С ошибками</option>
        </select>

        {/* Grid selector */}
        {allGrids.length > 0 && (
          <select
            className="notion-select"
            style={{ width: 'auto', minWidth: '130px', height: '32px', padding: '0 28px 0 10px', fontSize: '13px' }}
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

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2 text-center border border-dashed border-[var(--border-default)] rounded-md">
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Посты с выбранными фильтрами не найдены</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedStatus(''); setSelectedGrid(''); setSelectedChannelId(''); }}
            className="notion-btn notion-btn-ghost text-xs"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPosts.map((post) => {
            const plainText = post.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
            const title = plainText.length > 100 ? plainText.substring(0, 100) + '…' : plainText;
            const date = format(new Date(post.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru });

            return (
              <div
                key={post.id}
                className="notion-card"
                style={{ padding: '16px 20px' }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={post.status} />
                    {post.publishAt && post.status === 'SCHEDULED' && (
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        → {format(new Date(post.publishAt), 'd MMM, HH:mm', { locale: ru })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{date}</span>
                    <Link
                      href={`/?id=${post.id}`}
                      className="notion-btn notion-btn-ghost"
                      style={{ padding: '4px 8px', fontSize: '12px', gap: '4px' }}
                    >
                      <Edit size={12} />
                      Редактировать
                    </Link>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(post.id, post.status)}
                      className="notion-btn notion-btn-ghost text-[var(--danger)] hover:bg-[var(--danger-bg)] cursor-pointer"
                      style={{ padding: '4px 8px', fontSize: '12px', gap: '4px' }}
                      title={post.status === 'DELETED' ? 'Удалить окончательно' : 'Удалить в архив'}
                    >
                      <Trash2 size={12} />
                      Удалить
                    </button>
                  </div>
                </div>

                {/* Content preview */}
                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {title || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Пост без текста</span>}
                </p>

                {/* Publications */}
                {post.publications?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.publications.map((pub: any) => {
                      const platform = getPlatformById(pub.channel?.platform);
                      const isOk = pub.status === 'SUCCESS';
                      const isErr = pub.status === 'ERROR';
                      return (
                        <span
                          key={pub.id}
                          className="notion-tag"
                          style={{
                            color: isOk ? 'var(--success)' : isErr ? 'var(--danger)' : 'var(--text-secondary)',
                            background: isOk ? 'var(--success-bg)' : isErr ? 'var(--danger-bg)' : 'var(--bg-secondary)',
                            fontSize: '11px',
                          }}
                        >
                          {pub.channel?.name || '?'}
                          {platform && <span style={{ color: platform.color, marginLeft: '2px' }}>· {platform.name}</span>}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
