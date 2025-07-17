// pages/compress/index.jsx
import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const CompressControls = ({ endpoints, activeEndpoint, onEndpointSelect, onParamChange, isProcessing }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Compression Types</h2>
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
                    ? 'bg-pink-600 text-white'
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-600 bg-gray-800 text-white'
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
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const CompressInput = ({ inputData, onInputChange, onStartCompress, isProcessing, activeEndpoint }) => {
  const sampleData = {
    gzip: `This is sample text data for gzip compression testing.
It contains multiple lines and repeated patterns that should compress well.
The gzip algorithm is widely supported and efficient for text data.
This is sample text data for gzip compression testing.
It contains multiple lines and repeated patterns that should compress well.`,
    gunzip: `H4sIAAAAAAAAAy2MQRLCIBRDr5KVq8rK8QBq9RyUplNG4Hf4dKqeXsSuMkle8vj4BVeJS6aql4QDLlZ5PqFPTkbm441N4XaIisJX6cAGVCf7pINkjPynvmCw7mnQW/XhDd18cTMGlo1MiA2a6kBpY6i/WJUGd59Yy8yfndZQ3yUoZmaaL2QmIQ+sAAAA`,
    deflate: `Deflate compression test data with repeating patterns.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Deflate compression test data with repeating patterns.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    brotli: `Brotli compression algorithm test data for modern web applications.
This algorithm provides excellent compression ratios for text content.
It's particularly effective for web resources and API responses.
Brotli compression algorithm test data for modern web applications.
This algorithm provides excellent compression ratios for text content.`,
    compare: `Compression algorithm comparison test data with various patterns.
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
This text will be compressed using multiple algorithms for comparison.
Compression algorithm comparison test data with various patterns.
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.`,
  };

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Compression Input</h2>
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
            onClick={onStartCompress}
            disabled={!activeEndpoint || isProcessing}
            className={
              'px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
            }>
            {isProcessing ? 'Processing...' : 'Start Compression'}
          </button>
        </div>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter data to compress... (for gunzip, use base64 encoded gzipped data)'
        className={
          'w-full h-40 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-700'
        }
      />

      <div className={'mt-2 text-sm text-gray-400'}>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a compression type first'}
      </div>
    </div>
  );
};

const CompressResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
        <h2 className={'text-xl font-semibold text-white mb-4'}>Compression Results</h2>
        <div className={'text-gray-500 italic'}>
          No compression results yet. Start a compression operation to see performance data here.
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

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Compression Results</h2>
        <button
          onClick={onClearResults}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div className={'space-y-4'}>
        {/* Single Compression Stats */}
        {results.stats && (
          <div className={'bg-pink-900 bg-opacity-30 rounded-lg p-4 border border-pink-700'}>
            <h3 className={'text-lg font-medium text-pink-300 mb-2'}>Compression Statistics</h3>
            <div className={'grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'}>
              <div>
                <span className={'text-gray-300'}>Algorithm:</span>
                <span className={'text-pink-300 ml-2 font-mono uppercase'}>{results.stats.algorithm}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Original Size:</span>
                <span className={'text-pink-300 ml-2 font-mono'}>{formatBytes(results.stats.originalSize)}</span>
              </div>
              <div>
                <span className={'text-gray-300'}>Compressed Size:</span>
                <span className={'text-pink-300 ml-2 font-mono'}>
                  {formatBytes(results.stats.compressedSize || results.stats.decompressedSize)}
                </span>
              </div>
              <div>
                <span className={'text-gray-300'}>Ratio:</span>
                <span className={'text-pink-300 ml-2 font-mono'}>
                  {results.stats.compressionRatio || results.stats.expansionRatio}%
                </span>
              </div>
              <div>
                <span className={'text-gray-300'}>Time:</span>
                <span className={'text-pink-300 ml-2 font-mono'}>
                  {results.stats.compressionTime || results.stats.decompressionTime}ms
                </span>
              </div>
              {results.stats.level && (
                <div>
                  <span className={'text-gray-300'}>Level:</span>
                  <span className={'text-pink-300 ml-2 font-mono'}>{results.stats.level}</span>
                </div>
              )}
              {results.stats.quality && (
                <div>
                  <span className={'text-gray-300'}>Quality:</span>
                  <span className={'text-pink-300 ml-2 font-mono'}>{results.stats.quality}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Algorithm Comparison */}
        {results.comparison && (
          <div className={'bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'}>
            <h3 className={'text-lg font-medium text-blue-300 mb-2'}>Algorithm Comparison</h3>
            <div className={'space-y-2'}>
              {results.comparison.map((result, index) => (
                <div
                  key={index}
                  className={'bg-black p-3 rounded'}>
                  <div className={'flex justify-between items-center mb-2'}>
                    <span className={'text-blue-400 font-medium uppercase'}>{result.algorithm}</span>
                    <span className={'text-blue-300 text-sm'}>{result.compressionRatio}% compression</span>
                  </div>
                  <div className={'grid grid-cols-3 gap-4 text-xs'}>
                    <div>
                      <span className={'text-gray-400'}>Size:</span>
                      <span className={'text-blue-300 ml-1'}>{formatBytes(result.compressedSize)}</span>
                    </div>
                    <div>
                      <span className={'text-gray-400'}>Time:</span>
                      <span className={'text-blue-300 ml-1'}>{result.compressionTime}ms</span>
                    </div>
                    <div>
                      <span className={'text-gray-400'}>Saved:</span>
                      <span className={'text-blue-300 ml-1'}>{formatBytes(result.sizeSaved)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {results.bestCompression && (
              <div className={'mt-3 pt-3 border-t border-blue-700'}>
                <div className={'grid grid-cols-2 gap-4 text-sm'}>
                  <div>
                    <span className={'text-gray-300'}>Best Compression:</span>
                    <span className={'text-green-300 ml-2 font-mono uppercase'}>
                      {results.bestCompression.algorithm}
                    </span>
                    <span className={'text-green-400 ml-1'}>({results.bestCompression.compressionRatio}%)</span>
                  </div>
                  <div>
                    <span className={'text-gray-300'}>Fastest:</span>
                    <span className={'text-yellow-300 ml-2 font-mono uppercase'}>
                      {results.fastestAlgorithm.algorithm}
                    </span>
                    <span className={'text-yellow-400 ml-1'}>({results.fastestAlgorithm.compressionTime}ms)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compressed Data Preview */}
        {results.compressed && (
          <div className={'bg-gray-700 rounded-lg p-4 border border-gray-600'}>
            <h3 className={'text-lg font-medium text-white mb-2'}>Compressed Data (Base64)</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              <div className={'text-gray-400 text-xs mb-1'}>Base64 encoded compressed data:</div>
              <div className={'text-green-400 break-all'}>
                {results.compressed.substring(0, 500)}
                {results.compressed.length > 500 && '... (truncated)'}
              </div>
            </div>
          </div>
        )}

        {/* Decompressed Data */}
        {results.decompressed && (
          <div className={'bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'}>
            <h3 className={'text-lg font-medium text-green-300 mb-2'}>Decompressed Data</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'}>
              <pre className={'text-green-400 whitespace-pre-wrap'}>
                {results.decompressed.substring(0, 1000)}
                {results.decompressed.length > 1000 && '\n... (truncated)'}
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
                    <span>Compression completed successfully!</span>
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
                    <span>Error: {results.message || 'An error occurred during compression.'}</span>
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

function Compress() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [compressEndpoints, setCompressEndpoints] = useState([
    {
      id: 'gzip',
      name: 'Gzip Compress',
      description: 'Compress data using the gzip algorithm with configurable compression levels',
      params: [
        { name: 'level', type: 'number', value: 6, label: 'Compression Level', min: 1, max: 9 },
        {
          name: 'strategy',
          type: 'select',
          value: 'default',
          label: 'Strategy',
          options: ['default', 'huffman', 'rle', 'fixed'],
        },
      ],
    },
    {
      id: 'gunzip',
      name: 'Gzip Decompress',
      description: 'Decompress gzip compressed data (expects base64 encoded input)',
      params: [],
    },
    {
      id: 'deflate',
      name: 'Deflate Compress',
      description: 'Compress data using the deflate algorithm with window size control',
      params: [
        { name: 'level', type: 'number', value: 6, label: 'Compression Level', min: 1, max: 9 },
        { name: 'windowBits', type: 'number', value: 15, label: 'Window Bits', min: 8, max: 15 },
      ],
    },
    {
      id: 'brotli',
      name: 'Brotli Compress',
      description: 'Modern compression algorithm with excellent ratios for web content',
      params: [
        { name: 'quality', type: 'number', value: 6, label: 'Quality Level', min: 0, max: 11 },
        {
          name: 'mode',
          type: 'select',
          value: 'generic',
          label: 'Compression Mode',
          options: ['generic', 'text', 'font'],
        },
      ],
    },
    {
      id: 'compare',
      name: 'Algorithm Comparison',
      description: 'Compare gzip, deflate, and brotli algorithms on the same data',
      params: [],
    },
  ]);

  const handleEndpointSelect = endpoint => {
    setActiveEndpoint(endpoint);
    setResults(null);
  };

  const handleParamChange = (endpointId, paramName, value) => {
    setCompressEndpoints(prev =>
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

  const handleStartCompress = async () => {
    if (!activeEndpoint) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = 'http://127.0.0.1:5001/api/v1/compress';

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
      console.error('Compression failed:', err);
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
        title={'Node.js Stream Compression Playground'}
        description={'Compress and decompress data using various algorithms including gzip, deflate, and brotli.'}
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <CompressControls
            endpoints={compressEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            isProcessing={isProcessing}
          />

          <CompressInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onStartCompress={handleStartCompress}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <CompressResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title={'Stream Compression Info'}
        infos={[
          {
            title: 'Gzip Compression',
            description:
              'Widely supported compression algorithm with good balance of speed and compression ratio. Perfect for web content and general data compression.',
          },
          {
            title: 'Deflate Algorithm',
            description:
              'Core compression algorithm used by gzip and many other formats. Offers fine-tuned control over compression parameters and window sizes.',
          },
          {
            title: 'Brotli Compression',
            description:
              'Modern compression algorithm developed by Google. Provides superior compression ratios especially for text and web content compared to gzip.',
          },
          {
            title: 'Algorithm Comparison',
            description:
              'Compare multiple compression algorithms simultaneously to find the best balance of compression ratio, speed, and compatibility for your use case.',
          },
        ]}
      />
    </div>
  );
}

export default Compress;
