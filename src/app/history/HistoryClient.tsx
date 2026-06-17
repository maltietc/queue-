'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { Edit } from 'lucide-react';

export default function HistoryClient({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center text-gray-500">
        У вас пока нет ни одного поста
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
              <span className={`text-xs px-3 py-1 rounded-full font-medium self-start ${
                post.status === 'PUBLISHED' ? 'bg-green-900/50 text-green-400 border border-green-800/50' :
                post.status === 'DRAFT' ? 'bg-gray-800 text-gray-400 border border-gray-700' :
                'bg-blue-900/50 text-blue-400 border border-blue-800/50'
              }`}>
                {post.status}
              </span>
              {post.publishAt && post.status === 'SCHEDULED' && (
                <span className="text-sm text-blue-400 mt-2 font-medium">
                  Будет опубликовано: {format(new Date(post.publishAt), 'dd.MM.yyyy в HH:mm')}
                </span>
              )}
              {post.publications?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.publications.map((pub: any) => (
                    <span key={pub.id} className="text-xs bg-[#222] border border-[#333] px-2 py-0.5 rounded text-gray-400">
                      {pub.channel?.name} ({pub.status})
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-gray-500">
                Создан: {format(new Date(post.createdAt), 'dd.MM.yyyy HH:mm')}
              </span>
              <Link 
                href={`/?id=${post.id}`}
                className="flex items-center gap-1.5 text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1.5 rounded transition-colors"
              >
                <Edit size={14} /> Редактировать
              </Link>
            </div>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
            <div 
              className="text-sm text-gray-300 prose prose-sm prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
