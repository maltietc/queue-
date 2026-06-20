import { getPosts } from '../actions';
import DraftsClient from './DraftsClient';

export default async function DraftsPage() {
  const posts = await getPosts();
  const drafts = posts.filter((p: any) => p.status === 'DRAFT');

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Черновики
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {drafts.length} {drafts.length === 1 ? 'черновик' : drafts.length < 5 ? 'черновика' : 'черновиков'}
        </p>
      </header>

      {/* Column headers */}
      {drafts.length > 0 && (
        <div
          className="flex items-center justify-between px-4 py-1 mb-1"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Название</span>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Изменён</span>
        </div>
      )}

      <DraftsClient drafts={drafts} />
    </div>
  );
}
