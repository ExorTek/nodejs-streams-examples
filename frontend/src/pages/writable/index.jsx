import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const WritableControls = ({ endpoints, activeEndpoint, onEndpointSelect, onParamChange, isProcessing }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Writable Stream Types</h2>
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-500'
                }`}>
                {activeEndpoint?.id === endpoint.id ? 'Selected' : 'Select'}
              </button>
            </div>

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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 bg-gray-800 text-white'
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
                        className={
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const DataInput = ({ inputData, onInputChange, onSendData, isProcessing, activeEndpoint }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Data Input</h2>
        <button
          onClick={onSendData}
          disabled={!activeEndpoint || isProcessing || !inputData.trim()}
          className={
            'px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
          }>
          {isProcessing ? 'Processing...' : 'Send Data'}
        </button>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter your data here... (one item per line for better processing)'
        className={
          'w-full h-40 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700'
        }
      />

      <div className={'mt-2 text-sm text-gray-400'}>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a stream type first'}
      </div>
    </div>
  );
};

const ProcessingResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
        <h2 className={'text-xl font-semibold text-white mb-4'}>Processing Results</h2>
        <div className={'text-gray-500 italic'}>No results yet. Send some data to see processing results here.</div>
      </div>
    );
  }

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Processing Results</h2>
        <button
          onClick={onClearResults}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div className={'space-y-4'}>
        {results.stats && (
          <div className={'bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'}>
            <h3 className={'text-lg font-medium text-blue-300 mb-2'}>Statistics</h3>
            <div className={'grid grid-cols-2 gap-4 text-sm'}>
              {Object.entries(results.stats).map(([key, value]) => (
                <div key={key}>
                  <span className={'text-gray-300'}>{key}:</span>
                  <span className={'text-blue-300 ml-2 font-mono'}>
                    {key === 'startTime' ? new Date(value).toLocaleString() : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processed Data */}
        {results.processedLines && (
          <div className={'bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'}>
            <h3 className={'text-lg font-medium text-green-300 mb-2'}>Processed Lines</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              {results.processedLines.map((line, index) => (
                <div
                  key={index}
                  className={'text-green-400'}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Results */}
        {results.validLines && (
          <div className={'space-y-3'}>
            <div className={'bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'}>
              <h3 className={'text-lg font-medium text-green-300 mb-2'}>Valid Lines ({results.validLines.length})</h3>
              <div className={'bg-black p-3 rounded font-mono text-sm max-h-32 overflow-y-auto'}>
                {results.validLines.map((line, index) => (
                  <div
                    key={index}
                    className={'text-green-400'}>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {results.invalidLines.length > 0 && (
              <div className={'bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700'}>
                <h3 className={'text-lg font-medium text-red-300 mb-2'}>
                  Invalid Lines ({results.invalidLines.length})
                </h3>
                <div className={'bg-black p-3 rounded font-mono text-sm max-h-32 overflow-y-auto'}>
                  {results.invalidLines.map((line, index) => (
                    <div
                      key={index}
                      className={'text-red-400'}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Raw Data */}
        {results.data && (
          <div className={'bg-gray-700 rounded-lg p-4 border border-gray-600'}>
            <h3 className={'text-lg font-medium text-white mb-2'}>Collected Data</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              <pre className={'text-green-400 whitespace-pre-wrap'}>{results.data}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function Writable() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [streamEndpoints, setStreamEndpoints] = useState([
    {
      id: 'collect',
      name: 'Data Collector',
      description: 'Collect and analyze incoming data with statistics',
      params: [{ name: 'maxSize', type: 'number', value: 1024, label: 'Max Size (bytes)' }],
    },
    {
      id: 'process',
      name: 'Line Processor',
      description: 'Process data line by line with transformations',
      params: [
        {
          name: 'processor',
          type: 'select',
          value: 'uppercase',
          label: 'Processor Type',
          options: ['uppercase', 'lowercase', 'reverse', 'wordCount'],
        },
      ],
    },
    {
      id: 'validate',
      name: 'Data Validator',
      description: 'Validate data and separate valid/invalid entries',
      params: [
        {
          name: 'validator',
          type: 'select',
          value: 'nonEmpty',
          label: 'Validation Type',
          options: ['nonEmpty', 'email', 'number', 'minLength'],
        },
      ],
    },
    {
      id: 'upload',
      name: 'Stream Upload',
      description: 'Handle streaming upload with real-time processing',
      params: [],
    },
  ]);

  const handleEndpointSelect = endpoint => {
    setActiveEndpoint(endpoint);
    setResults(null);
  };

  const handleParamChange = (endpointId, paramName, value) => {
    // StreamEndpoints array'ini güncelle
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

    // Active endpoint'i güncelle
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

    const baseUrl = import.meta.env.VITE_STREAM_API_URL + '/writable';

    // Build query parameters
    const queryParams = new URLSearchParams();
    activeEndpoint.params.forEach(param => {
      queryParams.append(param.name, param.value);
    });

    const url = `${baseUrl}/${activeEndpoint.id}${queryParams.toString() ? `?${queryParams}` : ''}`;

    // Upload endpoint için basit handling (diğerleri gibi)
    if (activeEndpoint.id === 'upload') {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: inputData,
      }).catch(err => {
        console.error('Upload failed:', err);
        return null;
      });

      if (!response || !response.ok) {
        setIsProcessing(false);
        setResults({
          error: `Failed to upload stream - ${response?.status || 'Network Error'}`,
          stats: { error: true },
        });
        return;
      }

      const result = await response.json();
      setResults(result.results);
      setIsProcessing(false);
      return;
    }

    // Diğer endpoint'ler için normal handling
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: inputData,
    }).catch(err => {
      console.error('Processing failed:', err);
      return null;
    });

    if (!response || !response.ok) {
      setIsProcessing(false);
      setResults({
        error: `Failed to process data - ${response?.status || 'Network Error'}`,
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
        title={'Node.js Writable Stream Playground'}
        description={'Test and experiment with various Node.js writable stream operations and data processing.'}
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <WritableControls
            endpoints={streamEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            onSendData={handleSendData}
            isProcessing={isProcessing}
          />

          <DataInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onSendData={handleSendData}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <ProcessingResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title={'Writable Stream Info'}
        infos={[
          {
            title: 'Writable Streams',
            description:
              'Writable streams are destinations for data. They consume data and can process, validate, transform, or store it in various ways.',
          },
          {
            title: 'Data Processing',
            description:
              'This playground includes data collection, line-by-line processing, validation, and streaming upload capabilities.',
          },
          {
            title: 'Stream Operations',
            description:
              'Data is processed as it flows through the stream, allowing for efficient handling of large datasets without loading everything into memory.',
          },
          {
            title: 'Real-time Processing',
            description:
              'Writable streams can process data in real-time as it arrives, providing immediate feedback and statistics about the processing operation.',
          },
        ]}
      />
    </div>
  );
}

export default Writable;
