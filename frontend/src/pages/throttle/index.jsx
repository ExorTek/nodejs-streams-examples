import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const ThrottleControls = ({ endpoints, activeEndpoint, onEndpointSelect, onParamChange, isProcessing }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Throttle Types</h2>
      <div className={'space-y-4'}>
        {endpoints.map(endpoint => (
          <div
            key={endpoint.id}
            className={'border border-gray-600 rounded-lg p-4 bg-gray-700'}>
            <div className={'flex items-center justify-between mb-3'}>
              <div>
                <h3 className={'font-medium text-white'}>{endpoint.name}</h3>
                <p className={'text-sm text-gray-300'}>{endpoint.description}</p>
              </div>
              <button
                onClick={() => onEndpointSelect(endpoint)}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeEndpoint?.id === endpoint.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-500'
                }`}>
                {activeEndpoint?.id === endpoint.id ? 'Selected' : 'Select'}
              </button>
            </div>

            {endpoint.params.length > 0 && (
              <div className={'grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'}>
                {endpoint.params.map(param => (
                  <div key={param.name}>
                    <label className={'block text-xs font-medium text-gray-200 mb-1'}>{param.label}</label>
                    {param.type === 'select' ? (
                      <select
                        value={param.value}
                        onChange={e => onParamChange(endpoint.id, param.name, e.target.value)}
                        disabled={isProcessing}
                        className={
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-600 bg-gray-800 text-white'
                        }>
                        {param.options.map(option => (
                          <option
                            key={option}
                            value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : param.type === 'checkbox' ? (
                      <label className={'flex items-center mt-1'}>
                        <input
                          type='checkbox'
                          checked={param.value}
                          onChange={e => onParamChange(endpoint.id, param.name, e.target.checked)}
                          disabled={isProcessing}
                          className={'mr-2 text-indigo-500 focus:ring-indigo-500'}
                        />
                        <span className={'text-sm text-gray-300'}>Enable</span>
                      </label>
                    ) : (
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={param.value}
                        onChange={e => onParamChange(endpoint.id, param.name, e.target.value)}
                        disabled={isProcessing}
                        min={param.min}
                        max={param.max}
                        placeholder={param.placeholder}
                        className={
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-600 bg-gray-800 text-white'
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ThrottleInput = ({ inputData, onInputChange, onStartThrottle, isProcessing, activeEndpoint }) => {
  const sampleData = {
    basic: `Basic throttle test data line 1
Basic throttle test data line 2
Basic throttle test data line 3
Basic throttle test data line 4
Basic throttle test data line 5`,
    burst: `Burst test - this is a longer line that should demonstrate burst allowance behavior
Short line
Another longer line that will test the burst throttling mechanism
Quick
Final long line to complete the burst throttling demonstration`,
    'rate-limit': `Rate limiting test - no input data needed, this will test request frequency`,
    adaptive: `Adaptive throttling test data
This data will be processed with adaptive rate limiting
The system will adjust throughput based on simulated load
Multiple lines of varying lengths for comprehensive testing
Final line to complete adaptive throttling demonstration`,
  };

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Throttle Input</h2>
        <div className={'flex space-x-2'}>
          {activeEndpoint && sampleData[activeEndpoint.id] && (
            <button
              onClick={() => onInputChange(sampleData[activeEndpoint.id])}
              disabled={isProcessing}
              className={
                'px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-500 text-white rounded-md text-sm transition-colors'
              }>
              Load Sample
            </button>
          )}
          <button
            onClick={onStartThrottle}
            disabled={!activeEndpoint || isProcessing}
            className={
              'px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
            }>
            {isProcessing ? 'Throttling...' : 'Start Throttle'}
          </button>
        </div>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter data to throttle... (for rate limiting, data is optional)'
        className={
          'w-full h-32 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700'
        }
      />

      <div className={'mt-2 text-sm text-gray-400'}>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a throttle type first'}
      </div>
    </div>
  );
};

const ThrottleResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
        <h2 className={'text-xl font-semibold text-white mb-4'}>Throttle Results</h2>
        <div className={'text-gray-500 italic'}>
          No throttling results yet. Start a throttle operation to see performance data here.
        </div>
      </div>
    );
  }

  const formatBytes = bytes => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = ms => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Throttle Results</h2>
        <button
          onClick={onClearResults}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div className={'space-y-4'}>
        {/* Basic Throttle Stats */}
        {results.stats && (
          <div className={'bg-indigo-900 bg-opacity-30 rounded-lg p-4 border border-indigo-700'}>
            <h3 className={'text-lg font-medium text-indigo-300 mb-2'}>Throttle Statistics</h3>
            <div className={'grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'}>
              <div>
                <span className={'text-gray-300'}>Total Bytes:</span>
                <span className={'text-indigo-300 ml-2 font-mono'}>{formatBytes(results.stats.totalBytes)}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Total Chunks:</span>
                <span className={'text-indigo-300 ml-2 font-mono'}>{results.stats.totalChunks}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Duration:</span>
                <span className={'text-indigo-300 ml-2 font-mono'}>{formatDuration(results.stats.duration)}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Target Rate:</span>
                <span className={'text-indigo-300 ml-2 font-mono'}>
                  {formatBytes(results.stats.targetBytesPerSecond)}/s
                </span>
              </div>
              <div>
                <span className={'text-gray-300'}>Actual Rate:</span>
                <span className={'text-indigo-300 ml-2 font-mono'}>
                  {formatBytes(results.stats.actualBytesPerSecond)}/s
                </span>
              </div>
              <div>
                <span className={'text-gray-300'}>Efficiency:</span>
                <span className={'text-indigo-300 ml-2 font-mono'}>{results.stats.efficiency?.toFixed(1)}%</span>
              </div>
              {results.stats.delays > 0 && (
                <>
                  <div>
                    <span className={'text-gray-300'}>Delays:</span>
                    <span className={'text-indigo-300 ml-2 font-mono'}>{results.stats.delays}</span>
                  </div>
                  <div>
                    <span className={'text-gray-300'}>Avg Delay:</span>
                    <span className={'text-indigo-300 ml-2 font-mono'}>{results.stats.avgDelay?.toFixed(1)}ms</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Burst Throttle Chunks */}
        {results.chunks && (
          <div className={'bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'}>
            <h3 className={'text-lg font-medium text-blue-300 mb-2'}>Chunk Timeline</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              {results.chunks.slice(0, 20).map((chunk, index) => (
                <div
                  key={index}
                  className={'text-blue-400 mb-1'}>
                  {`${chunk.timestamp}ms: ${formatBytes(chunk.size)}`}
                </div>
              ))}
              {results.chunks.length > 20 && (
                <div className={'text-blue-500 italic'}>... and {results.chunks.length - 20} more chunks</div>
              )}
            </div>
          </div>
        )}

        {/* Rate Limiting Timeline */}
        {results.timeline && (
          <div className={'bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'}>
            <h3 className={'text-lg font-medium text-purple-300 mb-2'}>Rate Limiting Timeline</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              {results.timeline.slice(0, 30).map((entry, index) => (
                <div
                  key={index}
                  className={`mb-1 ${entry.allowed ? 'text-green-400' : 'text-red-400'}`}>
                  {`${entry.timestamp}ms: Request ${entry.requestId} - ${entry.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`}
                  {!entry.allowed && entry.timeUntilNext > 0 && ` (wait ${entry.timeUntilNext}ms)`}
                </div>
              ))}
              {results.timeline.length > 30 && (
                <div className={'text-purple-500 italic'}>... and {results.timeline.length - 30} more requests</div>
              )}
            </div>

            {results.summary && (
              <div className={'mt-3 pt-3 border-t border-purple-700'}>
                <div className={'grid grid-cols-2 gap-4 text-sm'}>
                  <div>
                    <span className={'text-gray-300'}>Total Requests:</span>
                    <span className={'text-purple-300 ml-2 font-mono'}>{results.summary.totalRequests}</span>
                  </div>
                  <div>
                    <span className={'text-gray-300'}>Allowed:</span>
                    <span className={'text-green-300 ml-2 font-mono'}>{results.summary.allowedRequests}</span>
                  </div>
                  <div>
                    <span className={'text-gray-300'}>Blocked:</span>
                    <span className={'text-red-300 ml-2 font-mono'}>{results.summary.blockedRequests}</span>
                  </div>
                  <div>
                    <span className={'text-gray-300'}>Success Rate:</span>
                    <span className={'text-purple-300 ml-2 font-mono'}>
                      {results.summary.allowedPercentage?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Adaptive Throttle Adaptations */}
        {results.adaptations && (
          <div className={'bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-700'}>
            <h3 className={'text-lg font-medium text-yellow-300 mb-2'}>Adaptive Changes</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              {results.adaptations.map((adaptation, index) => (
                <div
                  key={index}
                  className={'text-yellow-400 mb-1'}>
                  {`${adaptation.timestamp}ms: ${formatBytes(adaptation.oldRate)}/s → ${formatBytes(adaptation.newRate)}/s`}
                  <div className={'text-yellow-500 text-xs ml-2'}>
                    {adaptation.reason} (Load: {(adaptation.load * 100).toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>

            {results.finalStats && (
              <div className={'mt-3 pt-3 border-t border-yellow-700'}>
                <div className={'text-sm text-yellow-300'}>
                  Final Rate: {formatBytes(results.finalStats.actualBytesPerSecond)}/s | Efficiency:{' '}
                  {results.finalStats.efficiency?.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Throttled Output */}
        {results.output && (
          <div className={'bg-gray-700 rounded-lg p-4 border border-gray-600'}>
            <h3 className={'text-lg font-medium text-white mb-2'}>Throttled Output</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              <pre className={'text-green-400 whitespace-pre-wrap'}>
                {results.output.substring(0, 1000)}
                {results.output.length > 1000 && '\n... (truncated)'}
              </pre>
            </div>
          </div>
        )}

        {/* Success/Error Status */}
        <div className='mt-4 p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:border-solid'>
          <div className='flex items-center space-x-3'>
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${results.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <div className='flex-1'>
              <div className='text-sm font-medium text-white mb-1'>{results.success ? 'Success' : 'Error'}</div>
              <div className={`text-sm ${results.success ? 'text-green-300' : 'text-red-300'}`}>
                {results.success ? (
                  <span className='flex items-center space-x-2'>
                    <svg
                      className='w-4 h-4'
                      fill='currentColor'
                      viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>Throttling completed successfully!</span>
                  </span>
                ) : (
                  <span className='flex items-center space-x-2'>
                    <svg
                      className='w-4 h-4'
                      fill='currentColor'
                      viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>Error: {results.message || 'An error occurred during throttling.'}</span>
                  </span>
                )}
              </div>
            </div>
            <div className='text-xs text-gray-500'>{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Throttle() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [throttleEndpoints, setThrottleEndpoints] = useState([
    {
      id: 'basic',
      name: 'Basic Throttle',
      description: 'Simple bandwidth throttling with configurable bytes per second',
      params: [
        { name: 'bytesPerSecond', type: 'number', value: 1024, label: 'Bytes/Second', min: 1, max: 1048576 },
        { name: 'chunkDelay', type: 'number', value: 0, label: 'Chunk Delay (ms)', min: 0, max: 5000 },
        { name: 'smoothing', type: 'checkbox', value: true, label: 'Smooth Flow' },
      ],
    },
    {
      id: 'burst',
      name: 'Burst Throttle',
      description: 'Throttling with initial burst allowance for better user experience',
      params: [
        { name: 'bytesPerSecond', type: 'number', value: 512, label: 'Base Rate (B/s)', min: 1, max: 1048576 },
        { name: 'burstSize', type: 'number', value: 2048, label: 'Burst Size (bytes)', min: 0, max: 10485760 },
        { name: 'smoothing', type: 'checkbox', value: true, label: 'Smooth Flow' },
      ],
    },
    {
      id: 'rate-limit',
      name: 'Rate Limiting',
      description: 'Request frequency control with burst limits and time windows',
      params: [
        { name: 'requestsPerSecond', type: 'number', value: 5, label: 'Requests/Second', min: 1, max: 100 },
        { name: 'windowSize', type: 'number', value: 1000, label: 'Window Size (ms)', min: 100, max: 10000 },
        { name: 'burstLimit', type: 'number', value: 2, label: 'Burst Limit', min: 0, max: 20 },
        { name: 'testDuration', type: 'number', value: 3000, label: 'Test Duration (ms)', min: 1000, max: 10000 },
      ],
    },
    {
      id: 'adaptive',
      name: 'Adaptive Throttle',
      description: 'Smart throttling that adjusts based on system load conditions',
      params: [
        { name: 'baseBytesPerSecond', type: 'number', value: 1024, label: 'Base Rate (B/s)', min: 100, max: 1048576 },
        { name: 'adaptationFactor', type: 'number', value: 0.5, label: 'Adaptation Factor', min: 0.1, max: 1.0 },
        { name: 'loadThreshold', type: 'number', value: 0.8, label: 'Load Threshold', min: 0.1, max: 1.0 },
      ],
    },
  ]);

  const handleEndpointSelect = endpoint => {
    setActiveEndpoint(endpoint);
    setResults(null);
  };

  const handleParamChange = (endpointId, paramName, value) => {
    setThrottleEndpoints(prev =>
      prev.map(endpoint => {
        if (endpoint.id === endpointId) {
          return {
            ...endpoint,
            params: endpoint.params.map(param => (param.name === paramName ? { ...param, value } : param)),
          };
        }
        return endpoint;
      }),
    );

    if (activeEndpoint && activeEndpoint.id === endpointId) {
      setActiveEndpoint(prev => ({
        ...prev,
        params: prev.params.map(param => (param.name === paramName ? { ...param, value } : param)),
      }));
    }
  };

  const handleStartThrottle = async () => {
    if (!activeEndpoint) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = import.meta.env.VITE_STREAM_API_URL + '/throttle';

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      activeEndpoint.params.forEach(param => {
        queryParams.append(param.name, param.value);
      });

      const url = `${baseUrl}/${activeEndpoint.id}${queryParams.toString() ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: inputData || '',
      });

      if (!response || !response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setResults({
          success: false,
          message: errorData.message || `HTTP ${response.status}`,
        });
      } else {
        const result = await response.json();
        setResults({
          success: true,
          ...result.results,
        });
      }
    } catch (err) {
      console.error('Throttle failed:', err);
      setResults({
        success: false,
        message: err.message || 'Network error occurred',
      });
    }

    setIsProcessing(false);
  };

  const handleClearResults = () => {
    setResults(null);
  };

  const handleInputChange = value => {
    setInputData(value);
  };

  return (
    <div className={'w-full'}>
      <Header
        title={'Node.js Stream Throttle Playground'}
        description={'Control data flow rate, implement rate limiting, and manage bandwidth usage effectively.'}
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <ThrottleControls
            endpoints={throttleEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            isProcessing={isProcessing}
          />

          <ThrottleInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onStartThrottle={handleStartThrottle}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <ThrottleResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title={'Stream Throttle Info'}
        infos={[
          {
            title: 'Basic Throttling',
            description:
              'Control bandwidth usage by limiting the number of bytes processed per second, with optional chunk delays and flow smoothing.',
          },
          {
            title: 'Burst Allowance',
            description:
              'Allow initial bursts of data to improve user experience while maintaining overall rate limits for sustained transfers.',
          },
          {
            title: 'Rate Limiting',
            description:
              'Control request frequency with configurable time windows, burst limits, and comprehensive monitoring of allowed vs blocked requests.',
          },
          {
            title: 'Adaptive Throttling',
            description:
              'Smart throttling that automatically adjusts bandwidth based on system load conditions, optimizing performance dynamically.',
          },
        ]}
      />
    </div>
  );
}

export default Throttle;
