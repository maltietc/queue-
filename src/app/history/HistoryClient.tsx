'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { Edit, History, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';
import { getPlatformById } from '@/lib/socialPlatforms';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    PUBLISHED: { label: 'Опубликован', color: 'var(--success)', bg: 'var(--success-bg)', icon: <CheckCircle2 size={12} /> },
    SCHEDULED: { label: 'Запланирован', color: 'var(--accent)', bg: 'var(--accent-bg)', icon: <Clock size={12} /> },
    DRAFT: { label: 'Черновик', color: 'var(--text-tertiary)', bg: 'var(--bg-secondary)', icon: <FileText size={12} /> },
    ERROR: { label: 'Ошибка', color: 'var(--danger)', bg: 'var(--danger-bg)', icon: <AlertCircle size={12} /> },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span className="notion-tag" style={{ color: s.color, background: s.bg, gap: '4px' }}>
      {s.icon}{s.label}
    </span>
  );
}

export default function HistoryClient({ posts }: { posts: any[] }) {
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
    <div className="flex flex-col gap-3">
      {posts.map((post) => {
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
              </div>
            </div>

            {/* Content preview */}
            <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {title || <span style={{ color: 'var(--text-tertiary)' }}>Пост без текста</span>}
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
  );
}
