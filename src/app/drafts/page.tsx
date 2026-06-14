import { getPosts } from '../actions';
import DraftsClient from './DraftsClient';

export default async function DraftsPage() {
  const posts = await getPosts();
  const drafts = posts.filter((p: any) => p.status === 'DRAFT');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Черновики
        </h1>
        <p className="text-gray-400 mt-2">Неопубликованные идеи и заготовки постов</p>
      </header>

      <DraftsClient drafts={drafts} />
    </div>
  );
}
