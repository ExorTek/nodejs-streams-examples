function StreamCard({ endpoint, streamParams, isStreaming, activeStream, onParamChange, onStartStream }) {
  return (
    <div className={'border border-gray-600 rounded-lg p-4 bg-gray-700'}>
      <div className={'flex items-center justify-between mb-3'}>
        <div>
          <h3 className={'font-medium text-white'}>{endpoint.name}</h3>
          <p className={'text-sm text-gray-300'}>{endpoint.description}</p>
        </div>
        <button
          onClick={() => onStartStream(endpoint)}
          disabled={isStreaming && activeStream !== endpoint.id}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isStreaming && activeStream === endpoint.id
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-500'
          }`}>
          {isStreaming && activeStream === endpoint.id ? 'Stop' : 'Start'}
        </button>
      </div>

      {endpoint.params.length > 0 && (
        <div className={'grid grid-cols-2 gap-3'}>
          {endpoint.params.map(param => (
            <div key={param.name}>
              <label className={'block text-xs font-medium text-gray-200 mb-1'}>{param.label}</label>
              <input
                type={param.type === 'number' ? 'number' : 'text'}
                value={streamParams[endpoint.id][param.name]}
                onChange={e =>
                  onParamChange(
                    endpoint.id,
                    param.name,
                    param.type === 'number' ? parseInt(e.target.value) : e.target.value,
                  )
                }
                disabled={isStreaming}
                className={
                  'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 bg-gray-800 text-white'
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StreamCard;
