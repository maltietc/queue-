import { getPosts } from '../actions';
import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  const posts = await getPosts();

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          История
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {posts.length} {posts.length === 1 ? 'пост' : posts.length < 5 ? 'поста' : 'постов'} всего
        </p>
      </header>
      <HistoryClient posts={posts} />
    </div>
  );
}
