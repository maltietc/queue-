import { getChannels } from '../actions';
import ChannelsClient from './ChannelsClient';

export default async function ChannelsPage() {
  const channels = await getChannels();

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <ChannelsClient initialChannels={channels} />
    </div>
  );
}
