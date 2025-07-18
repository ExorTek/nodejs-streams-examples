import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const ProxyControls = ({ endpoints, activeEndpoint, onEndpointSelect, onParamChange, isProcessing }) => {
  return (
    <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
      <h2 className='text-xl font-semibold mb-4 text-white'>Proxy Operations</h2>
      <div className='space-y-4'>
        {endpoints.map(endpoint => (
          <div
            key={endpoint.id}
            className='border border-gray-600 rounded-lg p-4 bg-gray-700'>
            <div className='flex items-center justify-between mb-3'>
              <div>
                <h3 className='font-medium text-white'>{endpoint.name}</h3>
                <p className='text-sm text-gray-300'>{endpoint.description}</p>
              </div>
              <button
                onClick={() => onEndpointSelect(endpoint)}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeEndpoint?.id === endpoint.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-500'
                }`}>
                {activeEndpoint?.id === endpoint.id ? 'Selected' : 'Select'}
              </button>
            </div>

            {endpoint.params.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                {endpoint.params.map(param => (
                  <div key={param.name}>
                    <label className='block text-xs font-medium text-gray-200 mb-1'>{param.label}</label>
                    {param.type === 'select' ? (
                      <select
                        value={param.value}
                        onChange={e => onParamChange(endpoint.id, param.name, e.target.value)}
                        disabled={isProcessing}
                        className='w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-600 bg-gray-800 text-white'>
                        {param.options.map(option => (
                          <option
                            key={option}
                            value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : param.type === 'checkbox' ? (
                      <label className='flex items-center mt-1'>
                        <input
                          type='checkbox'
                          checked={param.value}
                          onChange={e => onParamChange(endpoint.id, param.name, e.target.checked)}
                          disabled={isProcessing}
                          className='mr-2 text-teal-500 focus:ring-teal-500'
                        />
                        <span className='text-sm text-gray-300'>Enable</span>
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
                        className='w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const ProxyInput = ({ inputData, onInputChange, onProcessProxy, isProcessing, activeEndpoint }) => {
  const sampleData = {
    'simple': `Data to be proxied to multiple targets.
This demonstrates basic stream proxying functionality.
Each target will receive the same data stream.`,
    'transform': `Original data for transform proxy testing.
This data will be modified during proxy forwarding.
Different targets may receive different transformations.`,
    'http': `{"message": "HTTP proxy test data", "timestamp": "${new Date().toISOString()}"}`,
    'load-balancer': `Load balancer test request data.
This simulates distributing requests across multiple backend servers.
Each request will be routed based on the selected algorithm.`,
    'cache': `Cache proxy test data for key: test-${Date.now()}`,
  };

  return (
    <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-white'>Proxy Input</h2>
        <div className='flex space-x-2'>
          {activeEndpoint && sampleData[activeEndpoint.id] && (
            <button
              onClick={() => onInputChange(sampleData[activeEndpoint.id])}
              disabled={isProcessing}
              className='px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-500 text-white rounded-md text-sm transition-colors'>
              Load Sample
            </button>
          )}
          <button
            onClick={onProcessProxy}
            disabled={!activeEndpoint || isProcessing}
            className='px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'>
            {isProcessing ? 'Processing...' : 'Process Proxy'}
          </button>
        </div>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter data to proxy...'
        className='w-full h-32 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-700'
      />

      <div className='mt-2 text-sm text-gray-400'>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a proxy operation first'}
      </div>
    </div>
  );
};

const ProxyResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
        <h2 className='text-xl font-semibold text-white mb-4'>Proxy Results</h2>
        <div className='text-gray-500 italic'>
          No proxy operations yet. Process some data to see proxy results here.
        </div>
      </div>
    );
  }

  const formatTime = ms => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-white'>Proxy Results</h2>
        <button
          onClick={onClearResults}
          className='px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'>
          Clear
        </button>
      </div>

      <div className='space-y-4'>
        {/* Simple/Transform Proxy Targets */}
        {results.targets && (
          <div className={'bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'}>
            <h3 className={'text-lg font-medium text-purple-300 mb-2'}>Proxy Targets ({results.targets.length})</h3>
            <div className={'space-y-2'}>
              {results.targets.map((target, index) => (
                <div
                  key={index}
                  className={'bg-black p-2 rounded'}>
                  <div className={'text-purple-400 font-medium'}>
                    {target.name} ({target.id})
                  </div>

                  {/* Server Metrics */}
                  <div className={'text-purple-300 text-sm ml-2'}>
                    Load: {target.load}/{target.capacity} • Requests: {target.requestCount} • Success Rate:{' '}
                    {target.successRate} • Avg Response: {target.avgResponseTime}ms
                  </div>

                  {/* Individual Requests */}
                  {target.requests && target.requests.length > 0 && (
                    <div className={'ml-4 mt-2'}>
                      <div className={'text-purple-500 text-xs'}>Recent Requests:</div>
                      {target.requests.slice(0, 3).map((request, reqIndex) => (
                        <div
                          key={reqIndex}
                          className={'text-purple-300 text-xs'}>
                          #{request.requestId}: {request.processingTime}ms
                          {request.success ? ' ✅' : ' ❌'}
                        </div>
                      ))}
                      {target.requests.length > 3 && (
                        <div className={'text-purple-500 text-xs'}>
                          ... and {target.requests.length - 3} more requests
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HTTP Proxy Results */}
        {results.proxied && (
          <div className='bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'>
            <h3 className='text-lg font-medium text-blue-300 mb-2'>HTTP Proxy Results</h3>
            <div className='space-y-2'>
              {results.proxied.map((proxy, index) => (
                <div
                  key={index}
                  className='bg-black p-3 rounded'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-blue-400 font-medium'>{proxy.endpointName}</span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        proxy.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                      {proxy.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                  {proxy.success ? (
                    <div className='text-blue-300 text-sm'>
                      <div>Response Time: {formatTime(proxy.responseTime)}</div>
                      <div>Attempts: {proxy.attempts}</div>
                      {proxy.response && (
                        <div className='mt-1 text-blue-400 font-mono text-xs'>
                          {JSON.stringify(proxy.response, null, 2).substring(0, 150)}...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='text-red-300 text-sm'>
                      <div>Error: {proxy.error}</div>
                      <div>Attempts: {proxy.attempts}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Load Balancer Distribution */}
        {results.distribution && (
          <div className='bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>Load Distribution</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {results.targets &&
                results.targets.map((target, index) => (
                  <div
                    key={index}
                    className='bg-black p-3 rounded'>
                    <div className='text-purple-400 font-medium mb-1'>{target.name}</div>
                    <div className='text-purple-300 text-sm space-y-1'>
                      <div>Requests: {target.requestCount}</div>
                      <div>Capacity: {target.capacity}</div>
                      <div>Success Rate: {target.successRate}</div>
                      <div>Avg Response: {formatTime(target.avgResponseTime)}</div>
                    </div>
                    <div className='mt-2 bg-gray-800 rounded-full h-2'>
                      <div
                        className='bg-purple-500 h-2 rounded-full transition-all duration-300'
                        style={{
                          width: `${(target.requestCount / Math.max(...results.targets.map(t => t.requestCount))) * 100}%`,
                        }}></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Cache Proxy Results */}
        {results.cache && (
          <div className='bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-700'>
            <h3 className='text-lg font-medium text-yellow-300 mb-2'>Cache Operation</h3>
            <div className='bg-black p-3 rounded'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-gray-400'>Action:</span>
                  <span className='text-yellow-300 ml-2 font-mono'>{results.cache.action}</span>
                </div>
                <div>
                  <span className='text-gray-400'>Cache Hit:</span>
                  <span className={`ml-2 font-mono ${results.cache.hit ? 'text-green-400' : 'text-red-400'}`}>
                    {results.cache.hit ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div>
                  <span className='text-gray-400'>Cache Size:</span>
                  <span className='text-yellow-300 ml-2 font-mono'>
                    {results.cache.size}/{results.cache.maxSize}
                  </span>
                </div>
                <div>
                  <span className='text-gray-400'>Key:</span>
                  <span className='text-yellow-300 ml-2 font-mono'>{results.cache.key}</span>
                </div>
              </div>
              {results.data && (
                <div className='mt-3 text-yellow-400 font-mono text-xs'>
                  Data: {JSON.stringify(results.data, null, 2).substring(0, 200)}...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        {results.summary && (
          <div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
            <h3 className='text-lg font-medium text-white mb-2'>Operation Summary</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
              {Object.entries(results.summary).map(([key, value]) => (
                <div key={key}>
                  <span className='text-gray-300'>{key}:</span>
                  <span className='text-white ml-2 font-mono'>
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </span>
                </div>
              ))}
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
                    <span>Proxy operation completed successfully!</span>
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
                    <span>Error: {results.message || 'An error occurred during proxy operation.'}</span>
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

function Proxy() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [proxyEndpoints, setProxyEndpoints] = useState([
    {
      id: 'simple',
      name: 'Simple Proxy',
      description: 'Forward data to multiple targets simultaneously',
      params: [
        { name: 'targets', type: 'number', value: 2, label: 'Number of Targets', min: 1, max: 5 },
        { name: 'delay', type: 'number', value: 0, label: 'Proxy Delay (ms)', min: 0, max: 5000 },
      ],
    },
    {
      id: 'transform',
      name: 'Transform Proxy',
      description: 'Modify data while proxying to different targets',
      params: [
        {
          name: 'transform',
          type: 'select',
          value: 'uppercase',
          label: 'Transformation',
          options: ['uppercase', 'lowercase', 'reverse', 'base64', 'hash'],
        },
        { name: 'targets', type: 'number', value: 2, label: 'Number of Targets', min: 1, max: 5 },
        { name: 'preserveOriginal', type: 'checkbox', value: true, label: 'Keep Original' },
      ],
    },
    {
      id: 'http',
      name: 'HTTP Proxy',
      description: 'Simulate HTTP request proxying to backend services',
      params: [
        { name: 'endpoint', type: 'text', value: '/api/data', label: 'Endpoint', placeholder: '/api/endpoint' },
        {
          name: 'method',
          type: 'select',
          value: 'GET',
          label: 'HTTP Method',
          options: ['GET', 'POST', 'PUT', 'DELETE'],
        },
        { name: 'timeout', type: 'number', value: 1000, label: 'Timeout (ms)', min: 100, max: 30000 },
        { name: 'retries', type: 'number', value: 1, label: 'Max Retries', min: 0, max: 3 },
      ],
    },
    {
      id: 'load-balancer',
      name: 'Load Balancer',
      description: 'Distribute requests across multiple backend servers',
      params: [
        {
          name: 'algorithm',
          type: 'select',
          value: 'round-robin',
          label: 'Algorithm',
          options: ['round-robin', 'least-connections', 'weighted'],
        },
        { name: 'targets', type: 'number', value: 3, label: 'Backend Servers', min: 2, max: 5 },
        { name: 'requests', type: 'number', value: 10, label: 'Number of Requests', min: 1, max: 50 },
      ],
    },
    {
      id: 'cache',
      name: 'Cache Proxy',
      description: 'Cache responses for faster subsequent requests',
      params: [
        { name: 'cacheDuration', type: 'number', value: 5000, label: 'Cache Duration (ms)', min: 1000, max: 60000 },
        { name: 'maxCacheSize', type: 'number', value: 10, label: 'Max Cache Size', min: 1, max: 100 },
        {
          name: 'operation',
          type: 'select',
          value: 'get',
          label: 'Cache Operation',
          options: ['get', 'clear', 'stats'],
        },
      ],
    },
  ]);

  const handleEndpointSelect = endpoint => {
    setActiveEndpoint(endpoint);
    setResults(null);
  };

  const handleParamChange = (endpointId, paramName, value) => {
    setProxyEndpoints(prev =>
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

  const handleProcessProxy = async () => {
    if (!activeEndpoint) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = 'http://127.0.0.1:5001/api/v1/proxy';

    try {
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
      console.error('Proxy operation failed:', err);
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
    <div className='w-full'>
      <Header
        title='Node.js Proxy Stream Playground'
        description='Forward, transform, and route data streams through various proxy patterns and load balancing algorithms.'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          <ProxyControls
            endpoints={proxyEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            isProcessing={isProcessing}
          />

          <ProxyInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onProcessProxy={handleProcessProxy}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <ProxyResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title='Proxy Stream Info'
        infos={[
          {
            title: 'Simple Proxy',
            description:
              'Forward data to multiple targets simultaneously. Useful for data replication, backup systems, and parallel processing.',
          },
          {
            title: 'Transform Proxy',
            description:
              'Modify data while forwarding to different targets. Each target can receive differently transformed versions of the same data.',
          },
          {
            title: 'HTTP Proxy',
            description:
              'Simulate HTTP request forwarding with retry logic, timeout handling, and backend service simulation for testing proxy behavior.',
          },
          {
            title: 'Load Balancer',
            description:
              'Distribute requests across multiple backend servers using round-robin, least-connections, or weighted algorithms for optimal resource utilization.',
          },
          {
            title: 'Cache Proxy',
            description:
              'Cache responses to improve performance. Includes cache hit/miss tracking, expiration handling, and cache management operations.',
          },
        ]}
      />
    </div>
  );
}

export default Proxy;
