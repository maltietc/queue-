export const dynamic = 'force-dynamic';

import { getPosts } from '../actions';
import CalendarClient from './CalendarClient';

export default async function CalendarPage() {
  const posts = await getPosts();
  
  // Pass all posts to the client, let the client filter them if needed
  // This allows the calendar to show everything or just scheduled
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Календарь
        </h1>
        <p className="text-gray-400 mt-2">Расписание ваших отложенных публикаций</p>
      </header>

      <div className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-xl">
        <CalendarClient posts={posts} />
      </div>
    </div>
  );
}
