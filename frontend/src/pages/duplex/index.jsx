import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const DuplexControls = ({ endpoints, activeEndpoint, onEndpointSelect, onParamChange, isProcessing }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Duplex Stream Types</h2>
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
                    ? 'bg-purple-600 text-white'
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-600 bg-gray-800 text-white'
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
                          className={'mr-2 text-purple-500 focus:ring-purple-500'}
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
                        className={
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const CommunicationInput = ({ inputData, onInputChange, onSendData, isProcessing, activeEndpoint }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Communication Input</h2>
        <button
          onClick={onSendData}
          disabled={!activeEndpoint || isProcessing || !inputData.trim()}
          className={
            'px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
          }>
          {isProcessing ? 'Communicating...' : 'Start Communication'}
        </button>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter your messages here... (one message per line for conversation/chat)'
        className={
          'w-full h-40 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-700'
        }
      />

      <div className={'mt-2 text-sm text-gray-400'}>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a duplex stream type first'}
      </div>
    </div>
  );
};

const CommunicationResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
        <h2 className={'text-xl font-semibold text-white mb-4'}>Communication Results</h2>
        <div className={'text-gray-500 italic'}>
          No communication yet. Start a duplex stream to see bidirectional results here.
        </div>
      </div>
    );
  }

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Communication Results</h2>
        <button
          onClick={onClearResults}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div className={'space-y-4'}>
        {results.stats && (
          <div className={'bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'}>
            <h3 className={'text-lg font-medium text-purple-300 mb-2'}>Communication Stats</h3>
            <div className={'grid grid-cols-2 gap-4 text-sm'}>
              {Object.entries(results.stats).map(([key, value]) => (
                <div key={key}>
                  <span className={'text-gray-300'}>{key}:</span>
                  <span className={'text-purple-300 ml-2 font-mono'}>
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.echoes && (
          <div className={'bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'}>
            <h3 className={'text-lg font-medium text-green-300 mb-2'}>Echo Responses</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              {results.echoes.map((echo, index) => (
                <div
                  key={index}
                  className={'text-green-400 mb-1'}>
                  {echo.trim()}
                </div>
              ))}
            </div>
          </div>
        )}

        {results.transformed && (
          <div className={'bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'}>
            <h3 className={'text-lg font-medium text-blue-300 mb-2'}>Transformed Data</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              {results.transformed.map((item, index) => (
                <div
                  key={index}
                  className={'text-blue-400 mb-1'}>
                  {item.trim()}
                </div>
              ))}
            </div>
          </div>
        )}

        {results.conversation && (
          <div className={'bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-700'}>
            <h3 className={'text-lg font-medium text-yellow-300 mb-2'}>Chat Conversation</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              {results.conversation.map((message, index) => (
                <div
                  key={index}
                  className={'text-yellow-400 mb-1'}>
                  {message.trim()}
                </div>
              ))}
            </div>
          </div>
        )}

        {results.communication && (
          <div className={'bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'}>
            <h3 className={'text-lg font-medium text-purple-300 mb-2'}>Bidirectional Flow</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              {results.communication.map((item, index) => (
                <div
                  key={index}
                  className={`mb-1 ${index % 2 === 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

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
    </div>
  );
};

function Duplex() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [streamEndpoints, setStreamEndpoints] = useState([
    {
      id: 'echo',
      name: 'Echo Stream',
      description: 'Echo messages back with optional transformations and delays',
      params: [
        { name: 'delay', type: 'number', value: 100, label: 'Echo Delay (ms)', min: 50, max: 5000 },
        { name: 'uppercase', type: 'checkbox', value: false, label: 'Uppercase' },
        { name: 'prefix', type: 'text', value: '', label: 'Prefix Text' },
      ],
    },
    {
      id: 'transform',
      name: 'Transform Stream',
      description: 'Transform data using various algorithms (reverse, ROT13, Base64, Morse)',
      params: [
        {
          name: 'mode',
          type: 'select',
          value: 'reverse',
          label: 'Transform Mode',
          options: ['reverse', 'rot13', 'base64', 'morse'],
        },
      ],
    },
    {
      id: 'chatbot',
      name: 'ChatBot Stream',
      description: 'Interactive chat with an AI bot using duplex communication',
      params: [
        {
          name: 'personality',
          type: 'select',
          value: 'friendly',
          label: 'Bot Personality',
          options: ['friendly', 'sarcastic', 'helpful'],
        },
      ],
    },
    {
      id: 'bidirectional',
      name: 'Bidirectional Stream',
      description: 'Simulate full bidirectional communication patterns',
      params: [],
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

    const baseUrl = 'http://127.0.0.1:5001/api/v1/duplex';

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
      console.error('Duplex communication failed:', err);
      return null;
    });

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
    setResults({
      success: true,
      ...result.results,
    });
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
        title={'Node.js Duplex Stream Playground'}
        description={
          'Explore bidirectional communication with duplex streams - both readable and writable in one stream.'
        }
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <DuplexControls
            endpoints={streamEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            onSendData={handleSendData}
            isProcessing={isProcessing}
          />

          <CommunicationInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onSendData={handleSendData}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <CommunicationResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title={'Duplex Stream Info'}
        infos={[
          {
            title: 'Duplex Streams',
            description:
              'Duplex streams implement both readable and writable interfaces, allowing bidirectional communication. Data can flow in both directions simultaneously.',
          },
          {
            title: 'Communication Patterns',
            description:
              'This playground demonstrates echo servers, data transformers, chatbots, and full bidirectional communication patterns using duplex streams.',
          },
          {
            title: 'Real-time Interaction',
            description:
              'Duplex streams enable real-time interactive applications like chat systems, protocol handlers, and data transformation pipelines.',
          },
          {
            title: 'Stream Composition',
            description:
              'Duplex streams can be composed and chained together to create complex communication flows and data processing pipelines.',
          },
        ]}
      />
    </div>
  );
}

export default Duplex;
