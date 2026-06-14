import { getPosts } from '../actions';
import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  const posts = await getPosts();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          История постов
        </h1>
        <p className="text-gray-400 mt-2">Все ваши опубликованные, отложенные посты и черновики</p>
      </header>

      <HistoryClient posts={posts} />
    </div>
  );
}
