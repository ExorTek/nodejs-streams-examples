import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const JsonlControls = ({ endpoints, activeEndpoint, onEndpointSelect, onParamChange, isProcessing }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>JSONL Operations</h2>
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
                    ? 'bg-emerald-600 text-white'
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-600 bg-gray-800 text-white'
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
                          className={'mr-2 text-emerald-500 focus:ring-emerald-500'}
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const JsonlInput = ({ inputData, onInputChange, onProcessJsonl, isProcessing, activeEndpoint }) => {
  const sampleData = {
    parse: `{"id": 1, "name": "Alice", "age": 30, "city": "New York"}
{"id": 2, "name": "Bob", "age": 25, "city": "Los Angeles"}
{"id": 3, "name": "Charlie", "age": 35, "city": "Chicago"}
{"id": 4, "name": "Diana", "age": 28, "city": "Houston"}`,
    'to-jsonl': `[
  {"id": 1, "name": "Alice", "age": 30},
  {"id": 2, "name": "Bob", "age": 25},
  {"id": 3, "name": "Charlie", "age": 35}
]`,
    filter: `{"id": 1, "name": "Alice", "age": 30, "active": true}
{"id": 2, "name": "Bob", "age": 25, "active": false}
{"id": 3, "name": "Charlie", "age": 35, "active": true}
{"name": "Diana", "age": 28, "active": true}`,
    transform: `{"id": 1, "name": "alice", "age": 30}
{"id": 2, "name": "bob", "age": 25}
{"id": 3, "name": "charlie", "age": 35}`,
    aggregate: `{"type": "sale", "amount": 100, "region": "north"}
{"type": "sale", "amount": 150, "region": "south"}
{"type": "refund", "amount": 50, "region": "north"}
{"type": "sale", "amount": 200, "region": "east"}
{"type": "refund", "amount": 75, "region": "south"}`,
  };

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>JSONL Input</h2>
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
            onClick={onProcessJsonl}
            disabled={!activeEndpoint || isProcessing}
            className={
              'px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
            }>
            {isProcessing ? 'Processing...' : 'Process JSONL'}
          </button>
        </div>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter JSONL data... (one JSON object per line)'
        className={
          'w-full h-40 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-700'
        }
      />

      <div className={'mt-2 text-sm text-gray-400'}>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a JSONL operation first'}
      </div>
    </div>
  );
};

const JsonlResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
        <h2 className={'text-xl font-semibold text-white mb-4'}>JSONL Results</h2>
        <div className={'text-gray-500 italic'}>
          No JSONL processing results yet. Start a JSONL operation to see processed data here.
        </div>
      </div>
    );
  }

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>JSONL Results</h2>
        <button
          onClick={onClearResults}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div className={'space-y-4'}>
        {/* Parsed Objects */}
        {results.objects && (
          <div className={'bg-emerald-900 bg-opacity-30 rounded-lg p-4 border border-emerald-700'}>
            <h3 className={'text-lg font-medium text-emerald-300 mb-2'}>Parsed Objects ({results.objects.length})</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              {results.objects.slice(0, 10).map((obj, index) => (
                <div
                  key={index}
                  className={'text-emerald-400 mb-2'}>
                  <span className={'text-emerald-500'}>Line {obj.lineNumber}:</span>
                  <div className={'ml-4 text-emerald-300'}>{JSON.stringify(obj.data, null, 2)}</div>
                </div>
              ))}
              {results.objects.length > 10 && (
                <div className={'text-emerald-500 italic'}>... and {results.objects.length - 10} more objects</div>
              )}
            </div>
          </div>
        )}

        {/* JSONL Output */}
        {results.jsonl && (
          <div className={'bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'}>
            <h3 className={'text-lg font-medium text-blue-300 mb-2'}>JSONL Output</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              <pre className={'text-blue-400 whitespace-pre-wrap'}>
                {results.jsonl.substring(0, 2000)}
                {results.jsonl.length > 2000 && '\n... (truncated)'}
              </pre>
            </div>
          </div>
        )}

        {/* Transformed Objects */}
        {results.transformed && (
          <div className={'bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'}>
            <h3 className={'text-lg font-medium text-purple-300 mb-2'}>
              Transformed Objects ({results.transformed.length})
            </h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              {results.transformed.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className={'text-purple-400 mb-3'}>
                  <div className={'text-purple-500'}>Line {item.lineNumber}:</div>
                  <div className={'ml-2'}>
                    <div className={'text-gray-400 text-xs'}>Original:</div>
                    <div className={'text-purple-300 ml-4'}>{JSON.stringify(item.original)}</div>
                    <div className={'text-gray-400 text-xs mt-1'}>Transformed:</div>
                    <div className={'text-purple-300 ml-4'}>{JSON.stringify(item.transformed)}</div>
                  </div>
                </div>
              ))}
              {results.transformed.length > 5 && (
                <div className={'text-purple-500 italic'}>
                  ... and {results.transformed.length - 5} more transformations
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter Results */}
        {(results.matched || results.unmatched) && (
          <div className={'space-y-3'}>
            {results.matched && results.matched.length > 0 && (
              <div className={'bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'}>
                <h3 className={'text-lg font-medium text-green-300 mb-2'}>
                  Matched Objects ({results.matched.length})
                </h3>
                <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
                  {results.matched.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className={'text-green-400 mb-1'}>
                      Line {item.lineNumber}: {JSON.stringify(item.data)}
                    </div>
                  ))}
                  {results.matched.length > 5 && (
                    <div className={'text-green-500 italic'}>... and {results.matched.length - 5} more matches</div>
                  )}
                </div>
              </div>
            )}

            {results.unmatched && results.unmatched.length > 0 && (
              <div className={'bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700'}>
                <h3 className={'text-lg font-medium text-red-300 mb-2'}>
                  Unmatched Objects ({results.unmatched.length})
                </h3>
                <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
                  {results.unmatched.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className={'text-red-400 mb-1'}>
                      Line {item.lineNumber}: {JSON.stringify(item.data)}
                    </div>
                  ))}
                  {results.unmatched.length > 5 && (
                    <div className={'text-red-500 italic'}>... and {results.unmatched.length - 5} more unmatched</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aggregation Results */}
        {results.aggregations && (
          <div className={'bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-700'}>
            <h3 className={'text-lg font-medium text-yellow-300 mb-2'}>
              Aggregation Results ({Object.keys(results.aggregations).length} groups)
            </h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              {Object.entries(results.aggregations).map(([key, value]) => (
                <div
                  key={key}
                  className={'text-yellow-400 mb-2'}>
                  <div className={'text-yellow-500 font-medium'}>{key}:</div>
                  <div className={'ml-4 text-yellow-300'}>{JSON.stringify(value, null, 2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {results.errors && results.errors.length > 0 && (
          <div className={'bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700'}>
            <h3 className={'text-lg font-medium text-red-300 mb-2'}>Processing Errors ({results.errors.length})</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              {results.errors.slice(0, 5).map((error, index) => (
                <div
                  key={index}
                  className={'text-red-400 mb-2'}>
                  <div className={'text-red-500'}>Line {error.lineNumber}:</div>
                  <div className={'ml-2 text-red-300'}>{error.error}</div>
                  <div className={'ml-2 text-gray-400 text-xs'}>{error.originalLine}</div>
                </div>
              ))}
              {results.errors.length > 5 && (
                <div className={'text-red-500 italic'}>... and {results.errors.length - 5} more errors</div>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        {results.stats && (
          <div className={'bg-gray-700 rounded-lg p-4 border border-gray-600'}>
            <h3 className={'text-lg font-medium text-white mb-2'}>Processing Statistics</h3>
            <div className={'grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'}>
              {Object.entries(results.stats).map(([key, value]) => (
                <div key={key}>
                  <span className={'text-gray-300'}>{key}:</span>
                  <span className={'text-white ml-2 font-mono'}>
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
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
                    <span>JSONL processing completed successfully!</span>
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
                    <span>Error: {results.message || 'An error occurred during JSONL processing.'}</span>
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

function Jsonl() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [jsonlEndpoints, setJsonlEndpoints] = useState([
    {
      id: 'parse',
      name: 'Parse JSONL',
      description: 'Parse JSONL format into individual JSON objects with validation',
      params: [
        { name: 'validateJson', type: 'checkbox', value: true, label: 'Validate JSON' },
        { name: 'skipEmpty', type: 'checkbox', value: true, label: 'Skip Empty Lines' },
      ],
    },
    {
      id: 'to-jsonl',
      name: 'Convert to JSONL',
      description: 'Convert JSON array or objects to JSONL format',
      params: [
        { name: 'pretty', type: 'checkbox', value: false, label: 'Pretty Print' },
        { name: 'sortKeys', type: 'checkbox', value: false, label: 'Sort Object Keys' },
      ],
    },
    {
      id: 'filter',
      name: 'Filter JSONL',
      description: 'Filter JSONL data based on field conditions',
      params: [
        { name: 'field', type: 'text', value: 'id', label: 'Field Name', placeholder: 'Field to filter' },
        {
          name: 'operator',
          type: 'select',
          value: 'exists',
          label: 'Operator',
          options: [
            'exists',
            'equals',
            'not_equals',
            'greater_than',
            'less_than',
            'contains',
            'starts_with',
            'is_true',
            'is_false',
          ],
        },
        { name: 'value', type: 'text', value: '', label: 'Filter Value', placeholder: 'Comparison value' },
        {
          name: 'outputFormat',
          type: 'select',
          value: 'jsonl',
          label: 'Output Format',
          options: ['jsonl', 'json', 'raw'],
        },
      ],
    },
    {
      id: 'transform',
      name: 'Transform JSONL',
      description: 'Transform JSONL data by modifying fields and values',
      params: [
        {
          name: 'operation',
          type: 'select',
          value: 'add_field',
          label: 'Operation',
          options: [
            'add_field',
            'remove_field',
            'rename_field',
            'uppercase_field',
            'lowercase_field',
            'add_id',
            'add_timestamp',
          ],
        },
        { name: 'field', type: 'text', value: 'timestamp', label: 'Field Name', placeholder: 'Field to operate on' },
        {
          name: 'value',
          type: 'text',
          value: new Date().toISOString(),
          label: 'Field Value',
          placeholder: 'New value',
        },
        {
          name: 'targetField',
          type: 'text',
          value: 'name',
          label: 'Target Field',
          placeholder: 'Target field for rename',
        },
      ],
    },
    {
      id: 'aggregate',
      name: 'Aggregate JSONL',
      description: 'Group and aggregate JSONL data with calculations',
      params: [
        { name: 'groupBy', type: 'text', value: 'type', label: 'Group By Field', placeholder: 'Field to group by' },
        {
          name: 'operation',
          type: 'select',
          value: 'count',
          label: 'Aggregation',
          options: ['count', 'sum', 'average', 'min', 'max', 'unique'],
        },
        {
          name: 'field',
          type: 'text',
          value: 'value',
          label: 'Aggregate Field',
          placeholder: 'Field for calculations',
        },
        {
          name: 'outputFormat',
          type: 'select',
          value: 'jsonl',
          label: 'Output Format',
          options: ['jsonl', 'json', 'object'],
        },
      ],
    },
  ]);

  const handleEndpointSelect = endpoint => {
    setActiveEndpoint(endpoint);
    setResults(null);
  };

  const handleParamChange = (endpointId, paramName, value) => {
    setJsonlEndpoints(prev =>
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

  const handleProcessJsonl = async () => {
    if (!activeEndpoint) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = import.meta.env.VITE_STREAM_API_URL + '/jsonl';

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
      console.error('JSONL processing failed:', err);
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
        title={'Node.js JSONL Stream Playground'}
        description={'Process JSON Lines data with parsing, filtering, transforming, and aggregation operations.'}
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <JsonlControls
            endpoints={jsonlEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            isProcessing={isProcessing}
          />

          <JsonlInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onProcessJsonl={handleProcessJsonl}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <JsonlResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title={'JSONL Stream Info'}
        infos={[
          {
            title: 'JSONL Format',
            description:
              'JSON Lines is a text format where each line contains a single JSON object. Perfect for streaming data, logs, and large datasets.',
          },
          {
            title: 'Parsing & Validation',
            description:
              'Parse JSONL data with built-in validation, error handling, and statistics tracking for data quality assessment.',
          },
          {
            title: 'Filtering & Transformation',
            description:
              'Apply complex filters based on field conditions and transform data with field operations like add, remove, rename, and format changes.',
          },
          {
            title: 'Aggregation & Analytics',
            description:
              'Group data by fields and perform calculations like count, sum, average, min/max, and unique value analysis for insights.',
          },
        ]}
      />
    </div>
  );
}

export default Jsonl;
