'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Edit2 } from 'lucide-react';

export default function DraftsClient({ drafts }: { drafts: any[] }) {
  const router = useRouter();

  if (drafts.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center text-gray-500">
        У вас пока нет черновиков
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {drafts.map((post) => {
        // Простая очистка от HTML тегов для создания заголовка
        const plainText = post.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
        const title = plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;

        return (
          <div 
            key={post.id} 
            onClick={() => router.push(`/?id=${post.id}`)}
            className="group flex flex-col bg-[var(--card)] border border-[var(--border)] hover:border-blue-500/50 rounded-lg cursor-pointer transition-all duration-300"
          >
            {/* Строка списка (заголовок) */}
            <div className="flex items-center justify-between p-4 bg-[#111] group-hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-xs text-gray-500 whitespace-nowrap bg-[#222] px-2 py-1 rounded border border-[#333]">
                  {format(new Date(post.updatedAt || post.createdAt), 'dd.MM.yyyy HH:mm')}
                </span>
                <span className="text-sm text-gray-200 font-medium truncate">
                  {title || 'Пост без текста'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                <span className="text-xs font-medium">Редактировать</span>
                <Edit2 size={16} />
              </div>
            </div>
            
            {/* Выпадающий контент (раскрывается при наведении) */}
            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
              <div className="overflow-hidden">
                <div className="p-6 border-t border-[#222] bg-[var(--card)] rounded-b-lg">
                  <div 
                    className="text-sm text-gray-300 prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
