import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const MonitorControls = ({ endpoints, activeEndpoint, onEndpointSelect, onParamChange, isProcessing }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Monitor Types</h2>
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
                    ? 'bg-orange-600 text-white'
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-600 bg-gray-800 text-white'
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
                          className={'mr-2 text-orange-500 focus:ring-orange-500'}
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const MonitorInput = ({ inputData, onInputChange, onStartMonitor, isProcessing, activeEndpoint }) => {
  const sampleData = {
    create: `Line 1: Hello World
Line 2: Stream monitoring
Line 3: Performance tracking
Line 4: Real-time metrics
Line 5: Data analysis`,
    realtime: `Real-time data stream
Continuous monitoring
Live performance metrics
Throughput analysis
Latency tracking`,
    compare: `Performance test data
Stream comparison
Multiple streams
Benchmark analysis
Speed testing`,
  };

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Monitor Input</h2>
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
            onClick={onStartMonitor}
            disabled={!activeEndpoint || isProcessing}
            className={
              'px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
            }>
            {isProcessing ? 'Monitoring...' : 'Start Monitor'}
          </button>
        </div>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter data to monitor... (for stats endpoint, data is optional)'
        className={
          'w-full h-32 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-700'
        }
      />

      <div className={'mt-2 text-sm text-gray-400'}>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a monitor type first'}
      </div>
    </div>
  );
};

const MonitorResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
        <h2 className={'text-xl font-semibold text-white mb-4'}>Monitor Results</h2>
        <div className={'text-gray-500 italic'}>
          No monitoring data yet. Start a monitor to see performance metrics here.
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
        <h2 className={'text-xl font-semibold text-white'}>Monitor Results</h2>
        <button
          onClick={onClearResults}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div className={'space-y-4'}>
        {/* Single Stream Metrics */}
        {results.metrics && (
          <div className={'bg-orange-900 bg-opacity-30 rounded-lg p-4 border border-orange-700'}>
            <h3 className={'text-lg font-medium text-orange-300 mb-2'}>Stream Metrics</h3>
            <div className={'grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'}>
              <div>
                <span className={'text-gray-300'}>Name:</span>
                <span className={'text-orange-300 ml-2 font-mono'}>{results.metrics.name}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Duration:</span>
                <span className={'text-orange-300 ml-2 font-mono'}>{formatDuration(results.metrics.duration)}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Chunks:</span>
                <span className={'text-orange-300 ml-2 font-mono'}>{results.metrics.chunks}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Bytes:</span>
                <span className={'text-orange-300 ml-2 font-mono'}>{formatBytes(results.metrics.bytes)}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Avg Throughput:</span>
                <span className={'text-orange-300 ml-2 font-mono'}>{formatBytes(results.metrics.avgThroughput)}/s</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Peak Throughput:</span>
                <span className={'text-orange-300 ml-2 font-mono'}>
                  {formatBytes(results.metrics.peakThroughput)}/s
                </span>
              </div>
            </div>

            {results.metrics.avgLatency && (
              <div className={'mt-2'}>
                <span className={'text-gray-300'}>Avg Latency:</span>
                <span className={'text-orange-300 ml-2 font-mono'}>{results.metrics.avgLatency}ms</span>
              </div>
            )}
          </div>
        )}

        {/* Real-time Monitoring */}
        {results.monitoring && (
          <div className={'bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'}>
            <h3 className={'text-lg font-medium text-blue-300 mb-2'}>Real-time Monitoring</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              {results.monitoring.map((point, index) => (
                <div
                  key={index}
                  className={'text-blue-400 mb-1'}>
                  {`${point.timestamp}ms: ${point.chunks} chunks, ${formatBytes(point.bytes)}, ${formatBytes(point.avgThroughput)}/s`}
                </div>
              ))}
            </div>
            {results.final && (
              <div className={'mt-2 text-sm text-blue-300'}>
                Final: {results.final.chunks} chunks, {formatBytes(results.final.bytes)} total
              </div>
            )}
          </div>
        )}

        {/* Stream Comparison */}
        {results.comparison && (
          <div className={'bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'}>
            <h3 className={'text-lg font-medium text-purple-300 mb-2'}>Stream Comparison</h3>
            <div className={'space-y-2'}>
              {results.comparison.map((stream, index) => (
                <div
                  key={index}
                  className={'bg-black p-2 rounded text-sm'}>
                  <div className={'text-purple-400 font-medium'}>{stream.streamName}</div>
                  <div className={'text-purple-300 ml-2'}>
                    Duration: {formatDuration(stream.metrics.duration)} | Throughput:{' '}
                    {formatBytes(stream.metrics.avgThroughput)}/s | Chunks: {stream.metrics.chunks}
                  </div>
                </div>
              ))}
            </div>

            {results.summary && (
              <div className={'mt-3 pt-3 border-t border-purple-700'}>
                <div className={'text-sm text-purple-300'}>
                  <div>
                    Fastest: <span className={'text-green-400'}>{results.summary.fastest.streamName}</span> (
                    {formatDuration(results.summary.fastest.metrics.duration)})
                  </div>
                  <div>
                    Slowest: <span className={'text-red-400'}>{results.summary.slowest.streamName}</span> (
                    {formatDuration(results.summary.slowest.metrics.duration)})
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Statistics */}
        {results.global && (
          <div className={'bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'}>
            <h3 className={'text-lg font-medium text-green-300 mb-2'}>Global Statistics</h3>
            <div className={'grid grid-cols-2 gap-4 text-sm'}>
              <div>
                <span className={'text-gray-300'}>Total Streams:</span>
                <span className={'text-green-300 ml-2 font-mono'}>{results.global.totalStreams}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Active Streams:</span>
                <span className={'text-green-300 ml-2 font-mono'}>{results.global.activeStreams}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Total Bytes:</span>
                <span className={'text-green-300 ml-2 font-mono'}>{formatBytes(results.global.totalBytes)}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Total Chunks:</span>
                <span className={'text-green-300 ml-2 font-mono'}>{results.global.totalChunks}</span>
              </div>
            </div>
          </div>
        )}

        {/* Individual Stream Details */}
        {results.streams && Object.keys(results.streams).length > 0 && (
          <div className={'bg-cyan-900 bg-opacity-30 rounded-lg p-4 border border-cyan-700'}>
            <h3 className={'text-lg font-medium text-cyan-300 mb-2'}>Active Streams</h3>
            <div className={'space-y-2'}>
              {Object.entries(results.streams).map(([streamId, metrics]) => (
                <div
                  key={streamId}
                  className={'bg-black p-2 rounded text-sm'}>
                  <div className={'text-cyan-400 font-medium'}>{streamId}</div>
                  <div className={'text-cyan-300 ml-2'}>
                    Status: {metrics.isActive ? '🟢 Active' : '🔴 Inactive'} | Duration:{' '}
                    {formatDuration(metrics.duration)} | Throughput: {formatBytes(metrics.avgThroughput)}/s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Output Data */}
        {results.output && (
          <div className={'bg-gray-700 rounded-lg p-4 border border-gray-600'}>
            <h3 className={'text-lg font-medium text-white mb-2'}>Stream Output</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              <pre className={'text-green-400 whitespace-pre-wrap'}>{results.output}</pre>
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
                    <span>Monitoring completed successfully!</span>
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
                    <span>Error: {results.message || 'An error occurred during monitoring.'}</span>
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

function Monitor() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [monitorEndpoints, setMonitorEndpoints] = useState([
    {
      id: 'create',
      name: 'Simple Monitor',
      description: 'Basic stream monitoring with performance metrics',
      params: [
        { name: 'name', type: 'text', value: 'test-stream', label: 'Stream Name', placeholder: 'Enter stream name' },
        { name: 'sampleRate', type: 'number', value: 100, label: 'Sample Rate (ms)', min: 50, max: 5000 },
        { name: 'trackLatency', type: 'checkbox', value: false, label: 'Track Latency' },
      ],
    },
    {
      id: 'realtime',
      name: 'Real-time Monitor',
      description: 'Live monitoring with continuous metrics collection',
      params: [
        { name: 'streamId', type: 'text', value: '', label: 'Stream ID', placeholder: 'Auto-generated if empty' },
        { name: 'duration', type: 'number', value: 5000, label: 'Duration (ms)', min: 1000, max: 30000 },
      ],
    },
    {
      id: 'compare',
      name: 'Stream Comparison',
      description: 'Compare performance of multiple streams',
      params: [
        { name: 'streams', type: 'number', value: 2, label: 'Number of Streams', min: 1, max: 5 },
        {
          name: 'dataSize',
          type: 'select',
          value: 'small',
          label: 'Data Size',
          options: ['small', 'medium', 'large'],
        },
      ],
    },
    {
      id: 'stats',
      name: 'Global Statistics',
      description: 'View global monitoring statistics (no input data needed)',
      params: [],
    },
  ]);

  const handleEndpointSelect = endpoint => {
    setActiveEndpoint(endpoint);
    setResults(null);
  };

  const handleParamChange = (endpointId, paramName, value) => {
    setMonitorEndpoints(prev =>
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

  const handleStartMonitor = async () => {
    if (!activeEndpoint) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = import.meta.env.VITE_STREAM_API_URL + '/monitor';

    try {
      let url = `${baseUrl}/${activeEndpoint.id}`;
      let method = 'POST';

      // Stats endpoint uses GET method
      if (activeEndpoint.id === 'stats') {
        method = 'GET';
      }

      // Build query parameters
      if (activeEndpoint.params.length > 0) {
        const queryParams = new URLSearchParams();
        activeEndpoint.params.forEach(param => {
          queryParams.append(param.name, param.value);
        });
        if (queryParams.toString()) {
          url += `?${queryParams}`;
        }
      }

      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'text/plain',
        },
      };

      // Add body for POST requests
      if (method === 'POST') {
        fetchOptions.body = inputData || '';
      }

      const response = await fetch(url, fetchOptions);

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
      console.error('Monitor failed:', err);
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
        title={'Node.js Stream Monitor Playground'}
        description={'Monitor stream performance, track metrics, and analyze throughput in real-time.'}
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <MonitorControls
            endpoints={monitorEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            isProcessing={isProcessing}
          />

          <MonitorInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onStartMonitor={handleStartMonitor}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <MonitorResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title={'Stream Monitor Info'}
        infos={[
          {
            title: 'Performance Monitoring',
            description:
              'Monitor stream performance metrics including throughput, latency, chunk count, and byte processing in real-time.',
          },
          {
            title: 'Real-time Analytics',
            description:
              'Track live stream performance with continuous metrics collection and visualization of data flow patterns.',
          },
          {
            title: 'Stream Comparison',
            description:
              'Compare multiple streams side-by-side to analyze relative performance and identify bottlenecks or optimization opportunities.',
          },
          {
            title: 'Global Statistics',
            description:
              'View system-wide monitoring statistics including total streams, active connections, and aggregate throughput metrics.',
          },
        ]}
      />
    </div>
  );
}

export default Monitor;
