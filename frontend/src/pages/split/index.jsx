import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const SplitControls = ({ endpoints, activeEndpoint, onEndpointSelect, onParamChange, isProcessing }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Split Types</h2>
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
                    ? 'bg-cyan-600 text-white'
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-600 bg-gray-800 text-white'
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
                          className={'mr-2 text-cyan-500 focus:ring-cyan-500'}
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const SplitInput = ({ inputData, onInputChange, onStartSplit, isProcessing, activeEndpoint }) => {
  const sampleData = {
    line: `Line 1: Hello World
Line 2: Node.js Streams
Line 3: Split Operations

Line 5: After empty line
Line 6: Final line`,
    conditional: `Short line
This is a medium length line that exceeds threshold
Tiny
Another very long line that should be filtered based on the length condition
Small
Final very long line for comprehensive testing of conditional splitting`,
    'multi-output': `Data chunk 1 for splitting
Data chunk 2 for distribution
Data chunk 3 for parallel processing
Data chunk 4 for load balancing
Data chunk 5 for final testing`,
    field: `{"type": "info", "message": "Application started", "timestamp": "2024-01-01T10:00:00Z"}
{"type": "error", "message": "Connection failed", "timestamp": "2024-01-01T10:01:00Z"}
{"type": "warning", "message": "Deprecated method", "timestamp": "2024-01-01T10:02:00Z"}
{"type": "info", "message": "Process completed", "timestamp": "2024-01-01T10:03:00Z"}
{"type": "error", "message": "Timeout occurred", "timestamp": "2024-01-01T10:04:00Z"}`,
  };

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Split Input</h2>
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
            onClick={onStartSplit}
            disabled={!activeEndpoint || isProcessing}
            className={
              'px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
            }>
            {isProcessing ? 'Splitting...' : 'Start Split'}
          </button>
        </div>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter data to split... (format depends on split type)'
        className={
          'w-full h-40 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-700'
        }
      />

      <div className={'mt-2 text-sm text-gray-400'}>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a split type first'}
      </div>
    </div>
  );
};

const SplitResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
        <h2 className={'text-xl font-semibold text-white mb-4'}>Split Results</h2>
        <div className={'text-gray-500 italic'}>
          No splitting results yet. Start a split operation to see separated data here.
        </div>
      </div>
    );
  }

  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Split Results</h2>
        <button
          onClick={onClearResults}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div className={'space-y-4'}>
        {/* Line Split Results */}
        {results.lines && (
          <div className={'bg-cyan-900 bg-opacity-30 rounded-lg p-4 border border-cyan-700'}>
            <h3 className={'text-lg font-medium text-cyan-300 mb-2'}>Split Lines ({results.lines.length})</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              {results.lines.map((line, index) => (
                <div
                  key={index}
                  className={'text-cyan-400 mb-1'}>
                  <span className={'text-cyan-500'}>#{line.lineNumber}:</span> {line.content}
                  {line.isEmpty && <span className={'text-gray-500 ml-2'}>(empty)</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conditional Split Results */}
        {(results.matched || results.unmatched) && (
          <div className={'space-y-3'}>
            {results.matched && results.matched.length > 0 && (
              <div className={'bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'}>
                <h3 className={'text-lg font-medium text-green-300 mb-2'}>Matched Lines ({results.matched.length})</h3>
                <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
                  {results.matched.map((item, index) => (
                    <div
                      key={index}
                      className={'text-green-400 mb-1'}>
                      #{item.lineNumber}: {item.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.unmatched && results.unmatched.length > 0 && (
              <div className={'bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700'}>
                <h3 className={'text-lg font-medium text-red-300 mb-2'}>
                  Unmatched Lines ({results.unmatched.length})
                </h3>
                <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
                  {results.unmatched.map((item, index) => (
                    <div
                      key={index}
                      className={'text-red-400 mb-1'}>
                      #{item.lineNumber}: {item.content}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Multi-Output Results */}
        {results.outputs && (
          <div className={'bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'}>
            <h3 className={'text-lg font-medium text-purple-300 mb-2'}>
              Multi-Output Streams ({results.outputs.length} outputs)
            </h3>
            <div className={'space-y-2'}>
              {results.outputs.map((output, outputIndex) => (
                <div
                  key={outputIndex}
                  className={'bg-black p-2 rounded'}>
                  <div className={'text-purple-400 font-medium mb-1'}>Output Stream {outputIndex + 1}:</div>
                  <div className={'font-mono text-sm max-h-20 overflow-y-auto'}>
                    {output.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={'text-purple-300'}>
                        {item.content.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Field-Based Split Results */}
        {results.groups && (
          <div className={'bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-700'}>
            <h3 className={'text-lg font-medium text-yellow-300 mb-2'}>
              Field Groups ({Object.keys(results.groups).length} groups)
            </h3>
            <div className={'space-y-2'}>
              {Object.entries(results.groups).map(([groupName, items]) => (
                <div
                  key={groupName}
                  className={'bg-black p-2 rounded'}>
                  <div className={'text-yellow-400 font-medium mb-1'}>
                    {groupName} ({items.length} items):
                  </div>
                  <div className={'font-mono text-sm max-h-20 overflow-y-auto'}>
                    {items.slice(0, 5).map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={'text-yellow-300'}>
                        {typeof item === 'object'
                          ? item.message || item.data || JSON.stringify(item).substring(0, 50)
                          : item.toString().substring(0, 50)}
                      </div>
                    ))}
                    {items.length > 5 && (
                      <div className={'text-yellow-500 italic'}>... and {items.length - 5} more items</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        {results.stats && (
          <div className={'bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'}>
            <h3 className={'text-lg font-medium text-blue-300 mb-2'}>Split Statistics</h3>
            <div className={'grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'}>
              {Object.entries(results.stats).map(([key, value]) => (
                <div key={key}>
                  <span className={'text-gray-300'}>{key}:</span>
                  <span className={'text-blue-300 ml-2 font-mono'}>
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Information */}
        {results.summary && (
          <div className={'bg-gray-700 rounded-lg p-4 border border-gray-600'}>
            <h3 className={'text-lg font-medium text-white mb-2'}>Operation Summary</h3>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'}>
              {Object.entries(results.summary).map(([key, value]) => (
                <div key={key}>
                  <span className={'text-gray-300'}>{key}:</span>
                  <span className={'text-white ml-2 font-mono'}>
                    {Array.isArray(value)
                      ? value.join(', ')
                      : typeof value === 'object'
                        ? JSON.stringify(value)
                        : value}
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
                    <span>Data splitting completed successfully!</span>
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
                    <span>Error: {results.message || 'An error occurred during splitting.'}</span>
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

function Split() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [splitEndpoints, setSplitEndpoints] = useState([
    {
      id: 'line',
      name: 'Line Split',
      description: 'Split text data into individual lines with configurable delimiters',
      params: [
        { name: 'delimiter', type: 'text', value: '\n', label: 'Delimiter', placeholder: 'Enter delimiter' },
        { name: 'skipEmpty', type: 'checkbox', value: true, label: 'Skip Empty Lines' },
        { name: 'maxLineLength', type: 'number', value: 1000, label: 'Max Line Length', min: 10, max: 10000 },
      ],
    },
    {
      id: 'multi-output',
      name: 'Multi-Output Split',
      description: 'Duplicate data to multiple output streams for parallel processing',
      params: [
        { name: 'outputs', type: 'number', value: 3, label: 'Number of Outputs', min: 1, max: 5 },
        { name: 'processDelay', type: 'number', value: 100, label: 'Process Delay (ms)', min: 0, max: 2000 },
      ],
    },
    {
      id: 'field',
      name: 'Field-Based Split',
      description: 'Group structured data by field values (JSON/CSV)',
      params: [
        { name: 'field', type: 'text', value: 'type', label: 'Group By Field', placeholder: 'Field name' },
        {
          name: 'format',
          type: 'select',
          value: 'json',
          label: 'Data Format',
          options: ['json', 'csv'],
        },
        { name: 'delimiter', type: 'text', value: '\n', label: 'Line Delimiter', placeholder: 'Delimiter' },
      ],
    },
  ]);

  const handleEndpointSelect = endpoint => {
    setActiveEndpoint(endpoint);
    setResults(null);
  };

  const handleParamChange = (endpointId, paramName, value) => {
    setSplitEndpoints(prev =>
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

  const handleStartSplit = async () => {
    if (!activeEndpoint) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = import.meta.env.VITE_STREAM_API_URL + '/split';

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
      console.error('Split failed:', err);
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
        title={'Node.js Stream Split Playground'}
        description={'Split, separate, and route data streams using various splitting strategies and conditions.'}
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <SplitControls
            endpoints={splitEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            isProcessing={isProcessing}
          />

          <SplitInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onStartSplit={handleStartSplit}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <SplitResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title={'Stream Split Info'}
        infos={[
          {
            title: 'Line Splitting',
            description:
              'Basic text splitting by delimiters with options to handle empty lines and control maximum line lengths for data safety.',
          },
          {
            title: 'Conditional Splitting',
            description:
              'Advanced filtering that separates data based on content conditions like length, patterns, or field values for targeted processing.',
          },
          {
            title: 'Multi-Output Streams',
            description:
              'Duplicate data to multiple parallel streams for load balancing, redundancy, or concurrent processing scenarios.',
          },
          {
            title: 'Field-Based Grouping',
            description:
              'Intelligent data organization that groups structured data (JSON/CSV) by field values for efficient categorization and routing.',
          },
        ]}
      />
    </div>
  );
}

export default Split;
