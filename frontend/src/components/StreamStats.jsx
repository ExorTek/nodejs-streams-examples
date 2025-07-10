function StreamStats({ streamStats, isStreaming }) {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Stream Statistics</h2>
      <div className={'grid grid-cols-2 gap-4'}>
        <div className={'bg-blue-900 bg-opacity-50 rounded-lg p-3 border border-blue-700'}>
          <div className={'text-2xl font-bold text-blue-400'}>{streamStats.chunks}</div>
          <div className={'text-sm text-blue-300'}>Chunks Received</div>
        </div>
        <div className={'bg-green-900 bg-opacity-50 rounded-lg p-3 border border-green-700'}>
          <div className={'text-2xl font-bold text-green-400'}>{streamStats.bytes}</div>
          <div className={'text-sm text-green-300'}>Bytes Received</div>
        </div>
      </div>
      <div className={'mt-4'}>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isStreaming
              ? 'bg-green-900 bg-opacity-50 text-green-300 border border-green-700'
              : 'bg-gray-700 text-gray-300 border border-gray-600'
          }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${isStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
          {isStreaming ? 'Streaming...' : 'Idle'}
        </div>
      </div>
    </div>
  );
}

export default StreamStats;
