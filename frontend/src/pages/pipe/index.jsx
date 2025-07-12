import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const PipeControls = ({ pipeTypes, activePipe, onPipeSelect, onParamChange, isProcessing }) => {
  return (
    <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
      <h2 className='text-xl font-semibold mb-4 text-white'>Pipe Operations</h2>
      <div className='space-y-4'>
        {pipeTypes.map(pipe => (
          <div
            key={pipe.id}
            className='border border-gray-600 rounded-lg p-4 bg-gray-700'>
            <div className='flex items-center justify-between mb-3'>
              <div>
                <h3 className='font-medium text-white'>{pipe.name}</h3>
                <p className='text-sm text-gray-300'>{pipe.description}</p>
              </div>
              <button
                onClick={() => onPipeSelect(pipe)}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePipe?.id === pipe.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-500'
                }`}>
                {activePipe?.id === pipe.id ? 'Selected' : 'Select'}
              </button>
            </div>

            {pipe.params.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                {pipe.params.map(param => (
                  <div key={param.name}>
                    <label className='block text-xs font-medium text-gray-200 mb-1'>{param.label}</label>
                    {param.type === 'select' ? (
                      <select
                        value={param.value}
                        onChange={e => onParamChange(pipe.id, param.name, e.target.value)}
                        disabled={isProcessing}
                        className='w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 bg-gray-800 text-white'>
                        {param.options.map(option => (
                          <option
                            key={option}
                            value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : param.type === 'multiselect' ? (
                      <div className='space-y-1'>
                        {param.options.map(option => (
                          <label
                            key={option}
                            className='flex items-center text-sm text-gray-300'>
                            <input
                              type='checkbox'
                              checked={param.value.includes(option)}
                              onChange={e => {
                                const newValue = e.target.checked
                                  ? [...param.value, option]
                                  : param.value.filter(v => v !== option);
                                onParamChange(pipe.id, param.name, newValue);
                              }}
                              disabled={isProcessing}
                              className='mr-2'
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={param.value}
                        onChange={e => onParamChange(pipe.id, param.name, e.target.value)}
                        disabled={isProcessing}
                        placeholder={param.placeholder}
                        className='w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const DataInput = ({ inputData, onInputChange, onExecutePipe, isProcessing, activePipe }) => {
  const sampleData = {
    simple: `Hello World
Node.js Streams
Pipe Operations
Data Processing`,
    chain: `javascript is awesome
python is powerful
go is fast
rust is safe`,
    pipeline: `{"name": "John", "age": 30}
{"name": "Jane", "age": 25}
{"name": "Bob", "age": 35}`,
    filter: `info: application started
error: connection failed
warning: deprecated method
error: timeout occurred
info: processing complete`,
    csv: `name,age,city
John,30,New York
Jane,25,Los Angeles
Bob,35,Chicago
Alice,28,Miami`,
  };

  return (
    <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-white'>Input Data</h2>
        <div className='flex space-x-2'>
          {activePipe && sampleData[activePipe.id] && (
            <button
              onClick={() => onInputChange(sampleData[activePipe.id])}
              disabled={isProcessing}
              className='px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-500 text-white rounded-md text-sm transition-colors'>
              Load Sample
            </button>
          )}
          <button
            onClick={onExecutePipe}
            disabled={!activePipe || isProcessing || !inputData.trim()}
            className='px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'>
            {isProcessing ? 'Processing...' : 'Execute Pipe'}
          </button>
        </div>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter your data here...'
        className='w-full h-40 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700'
      />

      <div className='mt-2 text-sm text-gray-400'>
        {activePipe ? `Selected: ${activePipe.name}` : 'Please select a pipe operation first'}
      </div>
    </div>
  );
};

const PipeResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
        <h2 className='text-xl font-semibold text-white mb-4'>Pipe Results</h2>
        <div className='text-gray-500 italic'>No results yet. Execute a pipe operation to see results here.</div>
      </div>
    );
  }

  return (
    <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-white'>Pipe Results</h2>
        <button
          onClick={onClearResults}
          className='px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'>
          Clear
        </button>
      </div>

      <div className='space-y-4'>
        {/* Operation Info */}
        {results.operation && (
          <div className='bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'>
            <h3 className='text-lg font-medium text-blue-300 mb-2'>Operation</h3>
            <div className='text-sm text-blue-200'>
              {typeof results.operation === 'string' ? results.operation : results.operations?.join(' → ')}
            </div>
          </div>
        )}

        {/* Operations Chain */}
        {results.operations && (
          <div className='bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>Operations Chain</h3>
            <div className='text-sm text-purple-200'>{results.operations.join(' → ')}</div>
          </div>
        )}

        {/* Keyword Filter */}
        {results.keyword && (
          <div className='bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-700'>
            <h3 className='text-lg font-medium text-yellow-300 mb-2'>Filter Keyword</h3>
            <div className='text-sm text-yellow-200 font-mono'>"{results.keyword}"</div>
          </div>
        )}

        {/* Statistics */}
        {results.results?.stats && (
          <div className='bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'>
            <h3 className='text-lg font-medium text-green-300 mb-2'>Statistics</h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              {Object.entries(results.results.stats).map(([key, value]) => (
                <div key={key}>
                  <span className='text-gray-300'>{key}:</span>
                  <span className='text-green-300 ml-2 font-mono'>
                    {key === 'startTime' ? new Date(value).toLocaleString() : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JSON Data (for CSV conversion) */}
        {results.results?.jsonData && (
          <div className='bg-indigo-900 bg-opacity-30 rounded-lg p-4 border border-indigo-700'>
            <h3 className='text-lg font-medium text-indigo-300 mb-2'>JSON Data ({results.results.count} items)</h3>
            <div className='bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'>
              <pre className='text-indigo-300 whitespace-pre-wrap'>
                {JSON.stringify(results.results.jsonData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {results.results?.data && (
          <div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
            <h3 className='text-lg font-medium text-white mb-2'>Processed Data</h3>
            <div className='bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'>
              <pre className='text-green-400 whitespace-pre-wrap'>{results.results.data}</pre>
            </div>
          </div>
        )}
      </div>

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
                  <span>Operation completed successfully!</span>
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
                  <span>Error: {results.message || 'An error occurred during processing.'}</span>
                </span>
              )}
            </div>
          </div>
          <div className='text-xs text-gray-500'>{new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};

function Pipe() {
  const [activePipe, setActivePipe] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [pipeTypes, setPipeTypes] = useState([
    {
      id: 'simple',
      name: 'Simple Pipe',
      description: 'Single transformation through one pipe operation',
      params: [
        {
          name: 'operations',
          type: 'select',
          value: 'uppercase',
          label: 'Operation',
          options: ['uppercase', 'lowercase', 'reverse', 'addTimestamp', 'addLineNumbers', 'wordCount'],
        },
      ],
    },
    {
      id: 'chain',
      name: 'Chained Pipe',
      description: 'Multiple transformations chained together',
      params: [
        {
          name: 'operations',
          type: 'multiselect',
          value: ['uppercase', 'addTimestamp'],
          label: 'Operations Chain',
          options: ['uppercase', 'lowercase', 'reverse', 'addTimestamp', 'addLineNumbers', 'wordCount'],
        },
      ],
    },
    {
      id: 'pipeline',
      name: 'Pipeline Operation',
      description: 'Advanced pipeline with error handling',
      params: [
        {
          name: 'operations',
          type: 'multiselect',
          value: ['jsonParse', 'uppercase'],
          label: 'Pipeline Operations',
          options: ['jsonParse', 'uppercase', 'lowercase', 'addTimestamp', 'wordCount'],
        },
      ],
    },
    {
      id: 'filter',
      name: 'Filter & Process',
      description: 'Filter data by keyword then process',
      params: [
        {
          name: 'keyword',
          type: 'text',
          value: 'error',
          label: 'Filter Keyword',
          placeholder: 'Enter keyword to filter',
        },
        {
          name: 'operations',
          type: 'multiselect',
          value: ['uppercase'],
          label: 'Processing Operations',
          options: ['uppercase', 'lowercase', 'addTimestamp', 'wordCount'],
        },
      ],
    },
    {
      id: 'csv',
      name: 'CSV to JSON',
      description: 'Convert CSV data to JSON format',
      params: [],
    },
  ]);

  const handlePipeSelect = pipe => {
    setActivePipe(pipe);
    setResults(null);
  };

  const handleParamChange = (pipeId, paramName, value) => {
    setPipeTypes(prev =>
      prev.map(pipe => {
        if (pipe.id === pipeId) {
          return {
            ...pipe,
            params: pipe.params.map(param => (param.name === paramName ? { ...param, value } : param)),
          };
        }
        return pipe;
      }),
    );

    if (activePipe && activePipe.id === pipeId) {
      setActivePipe(prev => ({
        ...prev,
        params: prev.params.map(param => (param.name === paramName ? { ...param, value } : param)),
      }));
    }
  };

  const handleExecutePipe = async () => {
    if (!activePipe || !inputData.trim()) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = 'http://127.0.0.1:5001/api/v1/pipe';

    // Build query parameters
    const queryParams = new URLSearchParams();
    activePipe.params.forEach(param => {
      if (param.type === 'multiselect') {
        queryParams.append(param.name, param.value.join(','));
      } else {
        queryParams.append(param.name, param.value);
      }
    });

    // Map pipe IDs to endpoints
    const endpoints = {
      simple: 'simple',
      chain: 'chain',
      pipeline: 'pipeline',
      filter: 'filter',
      csv: 'csv-to-json',
    };

    const endpoint = endpoints[activePipe.id];
    const url = `${baseUrl}/${endpoint}${queryParams.toString() ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: inputData,
    }).catch(err => {
      return err;
    });

    // error response is json

    if (!response || !response.ok) {
      const result = await response.json();
      setIsProcessing(false);
      setResults({
        success: false,
        statusCode: response.status,
        message: result.message || 'An error occurred while processing the pipe operation.',
      });
      return;
    }

    const result = await response.json();
    setResults(result);
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
        title='Node.js Pipe Operations Playground'
        description='Connect streams together with pipe operations for powerful data processing chains.'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          <PipeControls
            pipeTypes={pipeTypes}
            activePipe={activePipe}
            onPipeSelect={handlePipeSelect}
            onParamChange={handleParamChange}
            isProcessing={isProcessing}
          />

          <DataInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onExecutePipe={handleExecutePipe}
            isProcessing={isProcessing}
            activePipe={activePipe}
          />
        </div>

        <PipeResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title='Pipe Operations Info'
        infos={[
          {
            title: 'Simple Pipe',
            description:
              'The most basic pipe operation - connects one readable stream to one writable stream through a single transformation.',
          },
          {
            title: 'Chained Pipe',
            description:
              'Multiple transformations connected in sequence. Data flows through each transformation step by step.',
          },
          {
            title: 'Pipeline Operation',
            description:
              'Advanced pipe with better error handling and cleanup. Uses Node.js pipeline() for production-ready stream processing.',
          },
          {
            title: 'Filter & Process',
            description: 'First filters data based on keywords, then applies transformations to the filtered results.',
          },
          {
            title: 'CSV to JSON',
            description:
              'Specialized pipe operation that converts CSV format data into JSON objects for easier processing.',
          },
          {
            title: 'Stream Benefits',
            description:
              'Pipes allow you to process data in chunks without loading everything into memory, making them perfect for large datasets.',
          },
        ]}
      />
    </div>
  );
}

export default Pipe;
