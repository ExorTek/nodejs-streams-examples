import { useState } from 'react';
import { Header, InfoPanel } from '@components';

// Transform-specific components
const TransformControls = ({
  endpoints,
  activeEndpoint,
  onEndpointSelect,
  onParamChange,
  onSendData,
  isProcessing,
}) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Transform Stream Types</h2>
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
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-500'
                }`}>
                {activeEndpoint?.id === endpoint.id ? 'Selected' : 'Select'}
              </button>
            </div>

            {/* Parameters */}
            {endpoint.params.length > 0 && (
              <div className={'grid grid-cols-2 gap-3 mt-3'}>
                {endpoint.params.map(param => (
                  <div key={param.name}>
                    <label className={'block text-xs font-medium text-gray-200 mb-1'}>{param.label}</label>
                    {param.type === 'select' ? (
                      <select
                        value={param.value}
                        onChange={e => onParamChange(endpoint.id, param.name, e.target.value)}
                        disabled={isProcessing}
                        className={
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-600 bg-gray-800 text-white'
                        }>
                        {param.options.map(option => (
                          <option
                            key={option}
                            value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const TransformInput = ({ inputData, onInputChange, onSendData, isProcessing, activeEndpoint }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Data Input</h2>
        <button
          onClick={onSendData}
          disabled={!activeEndpoint || isProcessing || !inputData.trim()}
          className={
            'px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
          }>
          {isProcessing ? 'Transforming...' : 'Transform Data'}
        </button>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter your data here... (each line will be processed separately)'
        className={
          'w-full h-40 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-700'
        }
      />

      <div className={'mt-2 text-sm text-gray-400'}>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a transform type first'}
      </div>
    </div>
  );
};

const TransformResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
        <h2 className={'text-xl font-semibold text-white mb-4'}>Transform Results</h2>
        <div className={'text-gray-500 italic'}>
          No transformations yet. Select a transform type and process some data to see results here.
        </div>
      </div>
    );
  }

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Transform Results</h2>
        <button
          onClick={onClearResults}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div className={'space-y-4'}>
        {/* Statistics */}
        {results.stats && (
          <div className={'bg-amber-900 bg-opacity-30 rounded-lg p-4 border border-amber-700'}>
            <h3 className={'text-lg font-medium text-amber-300 mb-2'}>Transform Statistics</h3>
            <div className={'grid grid-cols-2 gap-4 text-sm'}>
              {Object.entries(results.stats).map(([key, value]) => (
                <div key={key}>
                  <span className={'text-gray-300'}>{key}:</span>
                  <span className={'text-amber-300 ml-2 font-mono'}>
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transformed Text */}
        {results.transformed && (
          <div className={'bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'}>
            <h3 className={'text-lg font-medium text-green-300 mb-2'}>Transformed Text</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              <pre className={'text-green-400 whitespace-pre-wrap'}>{results.transformed}</pre>
            </div>
          </div>
        )}

        {/* Filtered Data */}
        {results.filtered && (
          <div className={'bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'}>
            <h3 className={'text-lg font-medium text-blue-300 mb-2'}>Filtered Data</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              <pre className={'text-blue-400 whitespace-pre-wrap'}>{results.filtered}</pre>
            </div>
          </div>
        )}

        {/* Mathematical Calculations */}
        {results.calculations && (
          <div className={'bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'}>
            <h3 className={'text-lg font-medium text-purple-300 mb-2'}>Mathematical Analysis</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              <pre className={'text-purple-400 whitespace-pre-wrap'}>{results.calculations}</pre>
            </div>
          </div>
        )}

        {/* Encoded/Decoded Data */}
        {results.encoded && (
          <div className={'bg-cyan-900 bg-opacity-30 rounded-lg p-4 border border-cyan-700'}>
            <h3 className={'text-lg font-medium text-cyan-300 mb-2'}>Encoded/Decoded Data</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              <pre className={'text-cyan-400 whitespace-pre-wrap'}>{results.encoded}</pre>
            </div>
          </div>
        )}

        {/* Error Display */}
        {results.error && (
          <div className={'bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700'}>
            <h3 className={'text-lg font-medium text-red-300 mb-2'}>Error</h3>
            <div className={'text-red-400 font-mono text-sm'}>{results.error}</div>
          </div>
        )}
      </div>
    </div>
  );
};

function Transform() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [streamEndpoints, setStreamEndpoints] = useState([
    {
      id: 'case',
      name: 'Case Transform',
      description: 'Transform text case (uppercase, lowercase, title case, camelCase, reverse)',
      params: [
        {
          name: 'mode',
          type: 'select',
          value: 'upper',
          label: 'Transform Mode',
          options: ['upper', 'lower', 'title', 'camel', 'reverse'],
        },
      ],
    },
    {
      id: 'filter',
      name: 'Data Filter',
      description: 'Filter data based on length, content, patterns, or data types',
      params: [
        {
          name: 'filterMode',
          type: 'select',
          value: 'length',
          label: 'Filter Mode',
          options: ['length', 'contains', 'pattern', 'numbers', 'alpha', 'empty', 'nonEmpty'],
        },
        { name: 'minLength', type: 'number', value: 1, label: 'Min Length', min: 0, max: 1000 },
        { name: 'contains', type: 'text', value: '', label: 'Contains Text', placeholder: 'Text to search for' },
        { name: 'pattern', type: 'text', value: '', label: 'Regex Pattern', placeholder: 'e.g., \\d+' },
      ],
    },
    {
      id: 'math',
      name: 'Math Operations',
      description: 'Perform mathematical analysis on data (count, sum, average, min/max)',
      params: [
        {
          name: 'operation',
          type: 'select',
          value: 'count',
          label: 'Math Operation',
          options: ['count', 'sum', 'average', 'minmax', 'realtime'],
        },
      ],
    },
    {
      id: 'encoding',
      name: 'Encoding Transform',
      description: 'Encode or decode data using Base64, Hex, URL encoding, or JSON',
      params: [
        {
          name: 'encoding',
          type: 'select',
          value: 'base64',
          label: 'Encoding Type',
          options: ['base64', 'hex', 'url', 'json'],
        },
        {
          name: 'direction',
          type: 'select',
          value: 'encode',
          label: 'Direction',
          options: ['encode', 'decode'],
        },
      ],
    },
  ]);

  const handleEndpointSelect = endpoint => {
    setActiveEndpoint(endpoint);
    setResults(null);
  };

  const handleParamChange = (endpointId, paramName, value) => {
    setStreamEndpoints(prev =>
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

  const handleSendData = async () => {
    if (!activeEndpoint || !inputData.trim()) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = 'http://127.0.0.1:5001/api/v1/transform';

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
      body: inputData,
    }).catch(err => {
      console.error('Transform failed:', err);
      return null;
    });

    if (!response || !response.ok) {
      setIsProcessing(false);
      setResults({
        error: `Failed to transform data - ${response?.status || 'Network Error'}`,
        stats: { error: true },
      });
      return;
    }

    const result = await response.json();
    setResults(result.results);
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
        title={'Node.js Transform Stream Playground'}
        description={'Transform data using streams - filter, modify, analyze, and encode your data in real-time.'}
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <TransformControls
            endpoints={streamEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            onSendData={handleSendData}
            isProcessing={isProcessing}
          />

          <TransformInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onSendData={handleSendData}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <TransformResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title={'Transform Stream Info'}
        infos={[
          {
            title: 'Transform Streams',
            description:
              'Transform streams are a special type of duplex stream where the output is computed from the input. They read data, transform it, and write the result.',
          },
          {
            title: 'Data Processing',
            description:
              'This playground demonstrates various transformation patterns: case conversion, data filtering, mathematical analysis, and encoding/decoding operations.',
          },
          {
            title: 'Stream Pipeline',
            description:
              'Transform streams can be chained together to create complex data processing pipelines, where each transform adds a specific operation to the data flow.',
          },
          {
            title: 'Real-time Analysis',
            description:
              'Transform streams process data as it flows through them, making them perfect for real-time data analysis, content filtering, and format conversion.',
          },
        ]}
      />
    </div>
  );
}

export default Transform;
