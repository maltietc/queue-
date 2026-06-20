import EditorClient from './EditorClient';
import { getPostById, getChannels } from './actions';

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const id = resolvedParams.id as string | undefined;
  const post = id ? await getPostById(id) : null;
  const allChannels = await getChannels();
  const activeChannels = allChannels.filter(c => c.isActive);

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {post ? 'Редактирование поста' : 'Новый пост'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {post
            ? 'Внесите изменения в сохранённый черновик'
            : 'Создайте и отформатируйте пост для публикации'}
        </p>
      </header>

      <EditorClient initialPost={post} channels={activeChannels} />
    </div>
  );
}
