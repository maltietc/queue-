'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Edit2, FileEdit } from 'lucide-react';

export default function DraftsClient({ drafts }: { drafts: any[] }) {
  const router = useRouter();

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
    <div className="flex flex-col gap-1">
      {drafts.map((post) => {
        const plainText = post.content
          .replace(/<[^>]*>?/gm, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        const title = plainText.length > 90 ? plainText.substring(0, 90) + '…' : plainText;
        const date = format(new Date(post.updatedAt || post.createdAt), 'd MMMM, HH:mm', { locale: ru });

        return (
          <div
            key={post.id}
            onClick={() => router.push(`/?id=${post.id}`)}
            className="group flex items-center justify-between px-4 py-3 rounded-sm cursor-pointer transition-all"
            style={{ borderRadius: 'var(--radius-sm)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Doc icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                <FileEdit size={14} style={{ color: 'var(--text-tertiary)' }} />
              </div>

              {/* Title */}
              <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {title || <span style={{ color: 'var(--text-tertiary)' }}>Пост без текста</span>}
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
        );
      })}
    </div>
  );
}
