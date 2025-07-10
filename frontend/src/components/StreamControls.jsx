import { StreamCard } from '@components';

function StreamControls({ streamEndpoints, streamParams, isStreaming, activeStream, onParamChange, onStartStream }) {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Stream Types</h2>
      <div className={'space-y-4'}>
        {streamEndpoints.map(endpoint => (
          <StreamCard
            key={endpoint.id}
            endpoint={endpoint}
            streamParams={streamParams}
            isStreaming={isStreaming}
            activeStream={activeStream}
            onParamChange={onParamChange}
            onStartStream={onStartStream}
          />
        ))}
      </div>
    </div>
  );
}

export default StreamControls;
