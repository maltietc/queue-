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
    <div className="flex flex-col gap-4">
      {drafts.map((post) => (
        <div key={post.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-gray-500">
              Последнее изменение: {format(new Date(post.updatedAt || post.createdAt), 'dd.MM.yyyy HH:mm')}
            </span>
            <button 
              onClick={() => router.push(`/?id=${post.id}`)}
              className="flex items-center gap-2 text-sm bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg font-medium transition-colors border border-blue-500/20"
            >
              <Edit2 size={16} />
              Редактировать
            </button>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] cursor-pointer" onClick={() => router.push(`/?id=${post.id}`)}>
            <div 
              className="text-sm text-gray-300 prose prose-sm prose-invert max-w-none line-clamp-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
