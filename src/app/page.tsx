import EditorClient from './EditorClient';
import { getPostById, getChannels } from './actions';

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const id = resolvedParams.id as string | undefined;
  const post = id ? await getPostById(id) : null;
  const allChannels = await getChannels();
  const activeChannels = allChannels.filter(c => c.isActive);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {post ? 'Редактирование поста' : 'Новый пост'}
        </h1>
        <p className="text-gray-400 mt-2">
          {post ? 'Внесите изменения в сохраненный черновик' : 'Создайте и отформатируйте пост для Telegram'}
        </p>
      </header>

      <EditorClient initialPost={post} channels={activeChannels} />
    </div>
  );
}
