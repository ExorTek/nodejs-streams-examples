import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const EncryptControls = ({ endpoints, activeEndpoint, onEndpointSelect, onParamChange, isProcessing }) => {
  return (
    <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
      <h2 className='text-xl font-semibold mb-4 text-white'>Encryption Operations</h2>
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
                    ? 'bg-red-600 text-white'
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
                        className='w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-600 bg-gray-800 text-white'>
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
                        className='w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-600 bg-gray-800 text-white'
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

const EncryptInput = ({ inputData, onInputChange, onProcessCrypto, isProcessing, activeEndpoint }) => {
  const sampleData = {
    'aes-encrypt': `Secret message for AES encryption.
This confidential data will be encrypted using strong cryptographic algorithms.
The encrypted output can only be decrypted with the correct key and IV.`,
    'aes-decrypt': ``,
    'hash': `Data for hash generation and integrity verification.
Hash functions create unique fingerprints for data validation.
Any change in input will result in completely different hash.`,
    'signature': `Important document that needs digital signature.
This ensures authenticity and prevents tampering.
Digital signatures provide non-repudiation guarantees.`,
    'random': ``,
  };

  return (
    <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-white'>Crypto Input</h2>
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
            onClick={onProcessCrypto}
            disabled={!activeEndpoint || isProcessing}
            className='px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'>
            {isProcessing ? 'Processing...' : 'Process Crypto'}
          </button>
        </div>
      </div>

      {activeEndpoint?.id !== 'random' && (
        <textarea
          value={inputData}
          onChange={e => onInputChange(e.target.value)}
          disabled={isProcessing}
          placeholder='Enter data to process...'
          className='w-full h-40 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-700'
        />
      )}

      <div className='mt-2 text-sm text-gray-400'>
        {activeEndpoint ? `Selected: ${activeEndpoint.name}` : 'Please select a crypto operation first'}
      </div>
    </div>
  );
};

const EncryptResults = ({ results, onClearResults }) => {
  if (!results) {
    return (
      <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
        <h2 className='text-xl font-semibold text-white mb-4'>Crypto Results</h2>
        <div className='text-gray-500 italic'>
          No crypto operations yet. Process some data to see encryption/decryption results here.
        </div>
      </div>
    );
  }

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
  };

  const formatBytes = bytes => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-white'>Crypto Results</h2>
        <button
          onClick={onClearResults}
          className='px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'>
          Clear
        </button>
      </div>

      <div className='space-y-4'>
        {/* Encrypted Data */}
        {results.encrypted && (
          <div className='bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700'>
            <h3 className='text-lg font-medium text-red-300 mb-2'>Encrypted Data</h3>
            <div className='bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'>
              <div className='text-gray-400 text-xs mb-1'>Encrypted output:</div>
              <div
                className='text-red-400 break-all cursor-pointer hover:bg-gray-800 p-1 rounded'
                onClick={() => copyToClipboard(results.encrypted)}
                title='Click to copy'>
                {results.encrypted}
              </div>
            </div>
            {results.keyUsed && (
              <div className='mt-2 space-y-1'>
                <div className='text-red-300 text-xs'>
                  Key:
                  <span
                    className='font-mono ml-1 cursor-pointer hover:bg-gray-800 p-1 rounded'
                    onClick={() => copyToClipboard(results.keyUsed)}>
                    {results.keyUsed}
                  </span>
                </div>
                <div className='text-red-300 text-xs'>
                  IV:
                  <span
                    className='font-mono ml-1 cursor-pointer hover:bg-gray-800 p-1 rounded'
                    onClick={() => copyToClipboard(results.ivUsed)}>
                    {results.ivUsed}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decrypted Data */}
        {results.decrypted && (
          <div className='bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'>
            <h3 className='text-lg font-medium text-green-300 mb-2'>Decrypted Data</h3>
            <div className='bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto'>
              <pre className='text-green-400 whitespace-pre-wrap'>{results.decrypted}</pre>
            </div>
          </div>
        )}

        {/* Hash Results */}
        {results.hash && (
          <div className='bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>Hash Result</h3>
            <div className='bg-black p-3 rounded'>
              <div className='text-purple-400 text-sm mb-1'>Hash Value:</div>
              <div
                className='text-purple-300 font-mono text-sm break-all cursor-pointer hover:bg-gray-800 p-1 rounded'
                onClick={() => copyToClipboard(results.hash)}
                title='Click to copy hash'>
                {results.hash}
              </div>
              {results.salt && <div className='text-purple-300 text-xs mt-1'>Salt: {results.salt}</div>}
            </div>
          </div>
        )}

        {/* Digital Signature */}
        {results.signature && (
          <div className='bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'>
            <h3 className='text-lg font-medium text-blue-300 mb-2'>Digital Signature</h3>
            <div className='bg-black p-3 rounded space-y-2'>
              <div>
                <div className='text-blue-400 text-sm mb-1'>Signature:</div>
                <div
                  className='text-blue-300 font-mono text-xs break-all cursor-pointer hover:bg-gray-800 p-1 rounded'
                  onClick={() => copyToClipboard(results.signature)}
                  title='Click to copy'>
                  {results.signature}
                </div>
              </div>
              <div>
                <div className='text-blue-400 text-sm mb-1'>Public Key:</div>
                <div
                  className='text-blue-300 font-mono text-xs break-all cursor-pointer hover:bg-gray-800 p-1 rounded max-h-20 overflow-y-auto'
                  onClick={() => copyToClipboard(results.publicKey)}
                  title='Click to copy'>
                  {results.publicKey}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Random Data */}
        {results.data && (
          <div className='bg-cyan-900 bg-opacity-30 rounded-lg p-4 border border-cyan-700'>
            <h3 className='text-lg font-medium text-cyan-300 mb-2'>Random Data</h3>
            <div className='bg-black p-3 rounded'>
              <div className='text-cyan-400 text-sm mb-1'>Generated Data:</div>
              <div
                className='text-cyan-300 font-mono text-sm break-all cursor-pointer hover:bg-gray-800 p-1 rounded'
                onClick={() => copyToClipboard(results.data)}
                title='Click to copy'>
                {results.data}
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {results.stats && (
          <div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
            <h3 className='text-lg font-medium text-white mb-2'>Operation Statistics</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
              {Object.entries(results.stats).map(([key, value]) => (
                <div key={key}>
                  <span className='text-gray-300'>{key}:</span>
                  <span className='text-white ml-2 font-mono'>
                    {key.includes('Size')
                      ? formatBytes(value)
                      : key.includes('Time') || key === 'duration'
                        ? `${value}ms`
                        : typeof value === 'object'
                          ? JSON.stringify(value)
                          : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {results.summary && (
          <div className='bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-700'>
            <h3 className='text-lg font-medium text-yellow-300 mb-2'>Operation Summary</h3>
            <div className='text-sm text-yellow-200'>
              {Object.entries(results.summary).map(([key, value]) => (
                <div
                  key={key}
                  className='mb-1'>
                  <span className='font-medium'>{key}:</span> {value}
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
                    <span>Cryptographic operation completed successfully!</span>
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
                    <span>Error: {results.message || 'An error occurred during crypto operation.'}</span>
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

function Encrypt() {
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [cryptoEndpoints, setCryptoEndpoints] = useState([
    {
      id: 'aes-encrypt',
      name: 'AES Encrypt',
      description: 'Encrypt data using AES algorithm with configurable modes',
      params: [
        {
          name: 'algorithm',
          type: 'select',
          value: 'aes-256-cbc',
          label: 'Algorithm',
          options: ['aes-256-cbc', 'aes-192-cbc', 'aes-128-cbc'],
        },
        {
          name: 'key',
          type: 'text',
          value: '',
          label: 'Encryption Key (hex)',
          placeholder: 'Leave empty to auto-generate',
        },
        {
          name: 'outputFormat',
          type: 'select',
          value: 'base64',
          label: 'Output Format',
          options: ['base64', 'hex'],
        },
      ],
    },
    {
      id: 'aes-decrypt',
      name: 'AES Decrypt',
      description: 'Decrypt AES encrypted data back to original text',
      params: [
        {
          name: 'algorithm',
          type: 'select',
          value: 'aes-256-cbc',
          label: 'Algorithm',
          options: ['aes-256-cbc', 'aes-192-cbc', 'aes-128-cbc'],
        },
        { name: 'key', type: 'text', value: '', label: 'Decryption Key (hex)', placeholder: 'Key from encryption' },
        { name: 'iv', type: 'text', value: '', label: 'IV (hex)', placeholder: 'IV from encryption' },
        {
          name: 'inputFormat',
          type: 'select',
          value: 'base64',
          label: 'Input Format',
          options: ['base64', 'hex'],
        },
      ],
    },
    {
      id: 'hash',
      name: 'Generate Hash',
      description: 'Create cryptographic hash for data integrity verification',
      params: [
        {
          name: 'algorithm',
          type: 'select',
          value: 'sha256',
          label: 'Hash Algorithm',
          options: ['sha256', 'sha512', 'sha1', 'md5', 'pbkdf2'],
        },
        {
          name: 'outputFormat',
          type: 'select',
          value: 'hex',
          label: 'Output Format',
          options: ['hex', 'base64'],
        },
        {
          name: 'salt',
          type: 'text',
          value: '',
          label: 'Salt (optional)',
          placeholder: 'Leave empty to auto-generate',
        },
        { name: 'iterations', type: 'number', value: 1000, label: 'Iterations (PBKDF2)', min: 1, max: 10000 },
      ],
    },
    {
      id: 'signature',
      name: 'Digital Signature',
      description: 'Create digital signatures for authentication and non-repudiation',
      params: [
        {
          name: 'algorithm',
          type: 'select',
          value: 'RSA-SHA256',
          label: 'Algorithm',
          options: ['RSA-SHA256', 'RSA-SHA512'],
        },
        { name: 'keySize', type: 'number', value: 2048, label: 'Key Size (bits)', min: 1024, max: 4096 },
        {
          name: 'outputFormat',
          type: 'select',
          value: 'base64',
          label: 'Output Format',
          options: ['base64', 'hex'],
        },
      ],
    },
    {
      id: 'random',
      name: 'Random Generator',
      description: 'Generate cryptographically secure random data',
      params: [
        { name: 'size', type: 'number', value: 32, label: 'Size (bytes)', min: 1, max: 1024 },
        {
          name: 'format',
          type: 'select',
          value: 'hex',
          label: 'Output Format',
          options: ['hex', 'base64'],
        },
        {
          name: 'type',
          type: 'select',
          value: 'bytes',
          label: 'Data Type',
          options: ['bytes', 'password', 'uuid', 'key'],
        },
      ],
    },
  ]);

  const handleEndpointSelect = endpoint => {
    setActiveEndpoint(endpoint);
    setResults(null);
  };

  const handleParamChange = (endpointId, paramName, value) => {
    setCryptoEndpoints(prev =>
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

  const handleProcessCrypto = async () => {
    if (!activeEndpoint) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = 'http://127.0.0.1:5001/api/v1/encrypt';

    try {
      let url = `${baseUrl}/${activeEndpoint.id}`;
      let method = 'POST';

      if (activeEndpoint.id === 'random') {
        method = 'GET';
      }

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
      console.error('Crypto operation failed:', err);
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
        title='Node.js Encryption Stream Playground'
        description='Encrypt, decrypt, hash, sign data and generate secure random values using Node.js crypto module.'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          <EncryptControls
            endpoints={cryptoEndpoints}
            activeEndpoint={activeEndpoint}
            onEndpointSelect={handleEndpointSelect}
            onParamChange={handleParamChange}
            isProcessing={isProcessing}
          />

          <EncryptInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onProcessCrypto={handleProcessCrypto}
            isProcessing={isProcessing}
            activeEndpoint={activeEndpoint}
          />
        </div>

        <EncryptResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title='Encryption Stream Info'
        infos={[
          {
            title: 'AES Encryption',
            description:
              'Advanced Encryption Standard with CBC mode. Supports 128, 192, and 256-bit keys for different security levels.',
          },
          {
            title: 'Cryptographic Hashing',
            description:
              'Generate message digests using SHA-256, SHA-512, and other algorithms. Includes PBKDF2 for key derivation.',
          },
          {
            title: 'Digital Signatures',
            description:
              'RSA digital signatures provide authentication and non-repudiation. Automatically generates key pairs.',
          },
          {
            title: 'Secure Random Generation',
            description:
              'Cryptographically secure random data generation for keys, passwords, UUIDs, and other security purposes.',
          },
        ]}
      />
    </div>
  );
}

export default Encrypt;
