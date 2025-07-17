import { useState } from 'react';
import { Header, InfoPanel } from '@components';

const EncryptControls = ({ algorithms, activeAlgorithm, onAlgorithmSelect, onParamChange, isProcessing }) => {
  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <h2 className={'text-xl font-semibold mb-4 text-white'}>Encryption Algorithms</h2>
      <div className={'space-y-4'}>
        {algorithms.map(algorithm => (
          <div
            key={algorithm.id}
            className={'border border-gray-600 rounded-lg p-4 bg-gray-700'}>
            <div className={'flex items-center justify-between mb-3'}>
              <div>
                <h3 className={'font-medium text-white'}>{algorithm.name}</h3>
                <p className={'text-sm text-gray-300'}>{algorithm.description}</p>
                <div className={'text-xs text-purple-300 mt-1'}>
                  Key Size: {algorithm.keySize} | Mode: {algorithm.mode}
                </div>
              </div>
              <button
                onClick={() => onAlgorithmSelect(algorithm)}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeAlgorithm?.id === algorithm.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-500'
                }`}>
                {activeAlgorithm?.id === algorithm.id ? 'Selected' : 'Select'}
              </button>
            </div>

            {algorithm.params.length > 0 && (
              <div className={'grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'}>
                {algorithm.params.map(param => (
                  <div key={param.name}>
                    <label className={'block text-xs font-medium text-gray-200 mb-1'}>{param.label}</label>
                    {param.type === 'select' ? (
                      <select
                        value={param.value}
                        onChange={e => onParamChange(algorithm.id, param.name, e.target.value)}
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
                    ) : param.type === 'password' ? (
                      <input
                        type='password'
                        value={param.value}
                        onChange={e => onParamChange(algorithm.id, param.name, e.target.value)}
                        disabled={isProcessing}
                        placeholder={param.placeholder}
                        maxLength={param.maxLength}
                        className={
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-600 bg-gray-800 text-white'
                        }
                      />
                    ) : (
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={param.value}
                        onChange={e => onParamChange(algorithm.id, param.name, e.target.value)}
                        disabled={isProcessing}
                        placeholder={param.placeholder}
                        maxLength={param.maxLength}
                        className={
                          'w-full px-2 py-1 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-600 bg-gray-800 text-white'
                        }
                      />
                    )}
                    {param.hint && <div className={'text-xs text-gray-400 mt-1'}>{param.hint}</div>}
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

const EncryptInput = ({ inputData, onInputChange, onEncrypt, onDecrypt, isProcessing, activeAlgorithm }) => {
  const sampleData = {
    simple: `Hello, World!
This is a secret message.
Node.js encryption demo.`,
    secure: `{
  "username": "john_doe",
  "password": "secret123",
  "creditCard": "4532-1234-5678-9012",
  "ssn": "123-45-6789"
}`,
    file: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco.
Duis aute irure dolor in reprehenderit in voluptate velit esse.`,
  };

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Data Input</h2>
        <div className={'flex space-x-2'}>
          {activeAlgorithm && sampleData[activeAlgorithm.id] && (
            <button
              onClick={() => onInputChange(sampleData[activeAlgorithm.id])}
              disabled={isProcessing}
              className={
                'px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-500 text-white rounded-md text-sm transition-colors'
              }>
              Load Sample
            </button>
          )}
          <button
            onClick={onEncrypt}
            disabled={!activeAlgorithm || isProcessing || !inputData.trim()}
            className={
              'px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
            }>
            {isProcessing ? 'Encrypting...' : '🔒 Encrypt'}
          </button>
          <button
            onClick={onDecrypt}
            disabled={!activeAlgorithm || isProcessing || !inputData.trim()}
            className={
              'px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors'
            }>
            {isProcessing ? 'Decrypting...' : '🔓 Decrypt'}
          </button>
        </div>
      </div>

      <textarea
        value={inputData}
        onChange={e => onInputChange(e.target.value)}
        disabled={isProcessing}
        placeholder='Enter your data to encrypt/decrypt here...'
        className={
          'w-full h-40 bg-black text-green-400 p-4 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-700'
        }
      />

      <div className={'mt-2 flex justify-between items-center text-sm text-gray-400'}>
        <span>
          {activeAlgorithm ? `Selected: ${activeAlgorithm.name}` : 'Please select an encryption algorithm first'}
        </span>
        <span>Characters: {inputData.length}</span>
      </div>
    </div>
  );
};

const EncryptResults = ({ results, onClearResults }) => {
  const [showDecrypted, setShowDecrypted] = useState(false);

  if (!results) {
    return (
      <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
        <h2 className={'text-xl font-semibold text-white mb-4'}>Encryption Results</h2>
        <div className={'text-gray-500 italic'}>
          No encryption results yet. Select an algorithm and encrypt some data to see results here.
        </div>
      </div>
    );
  }

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={'bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Encryption Results</h2>
        <button
          onClick={onClearResults}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div className={'space-y-4'}>
        {/* Operation Info */}
        {results.operation && (
          <div className={'bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700'}>
            <h3 className={'text-lg font-medium text-purple-300 mb-2'}>Operation Details</h3>
            <div className={'grid grid-cols-2 gap-4 text-sm'}>
              <div>
                <span className={'text-gray-300'}>Operation:</span>
                <span className={'text-purple-300 ml-2 font-mono capitalize'}>{results.operation}</span>
              </div>
              {results.algorithm && (
                <div>
                  <span className={'text-gray-300'}>Algorithm:</span>
                  <span className={'text-purple-300 ml-2 font-mono'}>{results.algorithm}</span>
                </div>
              )}
              {results.keySize && (
                <div>
                  <span className={'text-gray-300'}>Key Size:</span>
                  <span className={'text-purple-300 ml-2 font-mono'}>{results.keySize}</span>
                </div>
              )}
              {results.mode && (
                <div>
                  <span className={'text-gray-300'}>Mode:</span>
                  <span className={'text-purple-300 ml-2 font-mono'}>{results.mode}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        {results.stats && (
          <div className={'bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700'}>
            <h3 className={'text-lg font-medium text-blue-300 mb-2'}>Statistics</h3>
            <div className={'grid grid-cols-2 gap-4 text-sm'}>
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

        {/* Encrypted Data */}
        {results.encrypted && (
          <div className={'bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-700'}>
            <div className={'flex items-center justify-between mb-2'}>
              <h3 className={'text-lg font-medium text-green-300'}>Encrypted Data</h3>
              <button
                onClick={() => copyToClipboard(results.encrypted)}
                className={'px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs transition-colors'}>
                Copy
              </button>
            </div>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              <div className={'text-green-400 break-all'}>{results.encrypted}</div>
            </div>
          </div>
        )}

        {/* Decrypted Data */}
        {results.decrypted && (
          <div className={'bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-700'}>
            <div className={'flex items-center justify-between mb-2'}>
              <h3 className={'text-lg font-medium text-yellow-300'}>Decrypted Data</h3>
              <div className={'flex space-x-2'}>
                <button
                  onClick={() => setShowDecrypted(!showDecrypted)}
                  className={
                    'px-2 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded text-xs transition-colors'
                  }>
                  {showDecrypted ? '👁️ Hide' : '👁️ Show'}
                </button>
                <button
                  onClick={() => copyToClipboard(results.decrypted)}
                  className={
                    'px-2 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded text-xs transition-colors'
                  }>
                  Copy
                </button>
              </div>
            </div>
            <div className={'bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto'}>
              {showDecrypted ? (
                <pre className={'text-yellow-400 whitespace-pre-wrap'}>{results.decrypted}</pre>
              ) : (
                <div className={'text-yellow-600 italic'}>Click "Show" to reveal decrypted content</div>
              )}
            </div>
          </div>
        )}

        {/* Keys (for demonstration purposes only) */}
        {results.key && (
          <div className={'bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700'}>
            <h3 className={'text-lg font-medium text-red-300 mb-2'}>🔑 Generated Key (Demo Only)</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm'}>
              <div className={'text-red-400 break-all text-xs'}>{results.key}</div>
            </div>
            <div className={'text-xs text-red-300 mt-2'}>
              ⚠️ In production, never expose encryption keys in logs or UI
            </div>
          </div>
        )}

        {/* IV (Initialization Vector) */}
        {results.iv && (
          <div className={'bg-cyan-900 bg-opacity-30 rounded-lg p-4 border border-cyan-700'}>
            <h3 className={'text-lg font-medium text-cyan-300 mb-2'}>IV (Initialization Vector)</h3>
            <div className={'bg-black p-3 rounded font-mono text-sm'}>
              <div className={'text-cyan-400 break-all text-xs'}>{results.iv}</div>
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

        {/* Success/Error Status */}
        <div className={'mt-4 p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:border-solid'}>
          <div className={'flex items-center space-x-3'}>
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${results.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <div className={'flex-1'}>
              <div className={'text-sm font-medium text-white mb-1'}>{results.success ? 'Success' : 'Error'}</div>
              <div className={`text-sm ${results.success ? 'text-green-300' : 'text-red-300'}`}>
                {results.success ? (
                  <span className={'flex items-center space-x-2'}>
                    <svg
                      className={'w-4 h-4'}
                      fill={'currentColor'}
                      viewBox={'0 0 20 20'}>
                      <path
                        fillRule={'evenodd'}
                        d={
                          'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        }
                        clipRule={'evenodd'}
                      />
                    </svg>
                    <span>Operation completed successfully!</span>
                  </span>
                ) : (
                  <span className={'flex items-center space-x-2'}>
                    <svg
                      className={'w-4 h-4'}
                      fill={'currentColor'}
                      viewBox={'0 0 20 20'}>
                      <path
                        fillRule={'evenodd'}
                        d={
                          'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                        }
                        clipRule={'evenodd'}
                      />
                    </svg>
                    <span>Error: {results.message || 'An error occurred during the encryption operation.'}</span>
                  </span>
                )}
              </div>
            </div>
            <div className={'text-xs text-gray-500'}>{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Encrypt() {
  const [activeAlgorithm, setActiveAlgorithm] = useState(null);
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const [encryptionAlgorithms, setEncryptionAlgorithms] = useState([
    {
      id: 'aes-encrypt',
      name: 'AES-256-GCM',
      description: 'Advanced Encryption Standard with Galois/Counter Mode',
      keySize: '256-bit',
      mode: 'GCM',
      params: [
        {
          name: 'password',
          type: 'password',
          value: '',
          label: 'Password',
          placeholder: 'Enter encryption password',
          maxLength: 100,
          hint: 'Used to derive encryption key',
        },
        {
          name: 'encoding',
          type: 'select',
          value: 'hex',
          label: 'Output Encoding',
          options: ['hex', 'base64'],
        },
      ],
    },
    {
      id: 'aes-decrypt',
      name: 'AES-128-CBC',
      description: 'AES with 128-bit key in Cipher Block Chaining mode',
      keySize: '128-bit',
      mode: 'CBC',
      params: [
        {
          name: 'password',
          type: 'password',
          value: '',
          label: 'Password',
          placeholder: 'Enter encryption password',
          maxLength: 100,
        },
        {
          name: 'encoding',
          type: 'select',
          value: 'base64',
          label: 'Output Encoding',
          options: ['hex', 'base64'],
        },
      ],
    },
    {
      id: 'hash',
      name: 'ChaCha20-Poly1305',
      description: 'Modern stream cipher with Poly1305 authentication',
      keySize: '256-bit',
      mode: 'Authenticated',
      params: [
        {
          name: 'password',
          type: 'password',
          value: '',
          label: 'Password',
          placeholder: 'Enter encryption password',
          maxLength: 100,
        },
        {
          name: 'encoding',
          type: 'select',
          value: 'hex',
          label: 'Output Encoding',
          options: ['hex', 'base64'],
        },
      ],
    },
    {
      id: 'sign',
      name: 'Simple Caesar Cipher',
      description: 'Basic demonstration cipher (NOT for real security)',
      keySize: 'Variable',
      mode: 'Educational',
      params: [
        {
          name: 'shift',
          type: 'number',
          value: 13,
          label: 'Shift Value',
          placeholder: 'ROT13 = 13',
        },
        {
          name: 'direction',
          type: 'select',
          value: 'forward',
          label: 'Direction',
          options: ['forward', 'backward'],
        },
      ],
    },
  ]);

  const handleAlgorithmSelect = algorithm => {
    setActiveAlgorithm(algorithm);
    setResults(null);
  };

  const handleParamChange = (algorithmId, paramName, value) => {
    setEncryptionAlgorithms(prev =>
      prev.map(algorithm => {
        if (algorithm.id === algorithmId) {
          return {
            ...algorithm,
            params: algorithm.params.map(param => (param.name === paramName ? { ...param, value } : param)),
          };
        }
        return algorithm;
      }),
    );

    if (activeAlgorithm && activeAlgorithm.id === algorithmId) {
      setActiveAlgorithm(prev => ({
        ...prev,
        params: prev.params.map(param => (param.name === paramName ? { ...param, value } : param)),
      }));
    }
  };

  const performCryptoOperation = async operation => {
    if (!activeAlgorithm || !inputData.trim()) return;

    setIsProcessing(true);
    setResults(null);

    const baseUrl = 'http://127.0.0.1:5001/api/v1/encrypt';

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('operation', operation);
    activeAlgorithm.params.forEach(param => {
      queryParams.append(param.name, param.value);
    });

    const url = `${baseUrl}/${activeAlgorithm.id}?${queryParams}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: inputData,
      });

      if (!response.ok) {
        const errorResult = await response.json();
        setResults({
          success: false,
          error: errorResult.message || `HTTP ${response.status}: Failed to ${operation} data`,
          operation,
          algorithm: activeAlgorithm.name,
        });
        setIsProcessing(false);
        return;
      }

      const result = await response.json();
      setResults({
        success: true,
        operation,
        algorithm: activeAlgorithm.name,
        keySize: activeAlgorithm.keySize,
        mode: activeAlgorithm.mode,
        ...result.results,
      });
    } catch (error) {
      setResults({
        success: false,
        error: `Network error: ${error.message}`,
        operation,
        algorithm: activeAlgorithm.name,
      });
    }

    setIsProcessing(false);
  };

  const handleEncrypt = () => performCryptoOperation('encrypt');
  const handleDecrypt = () => performCryptoOperation('decrypt');

  const handleClearResults = () => {
    setResults(null);
  };

  const handleInputChange = value => {
    setInputData(value);
  };

  return (
    <div className={'w-full'}>
      <Header
        title={'Node.js Encrypt Stream Playground'}
        description={'Explore cryptographic operations using Node.js streams with various encryption algorithms.'}
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <EncryptControls
            algorithms={encryptionAlgorithms}
            activeAlgorithm={activeAlgorithm}
            onAlgorithmSelect={handleAlgorithmSelect}
            onParamChange={handleParamChange}
            isProcessing={isProcessing}
          />

          <EncryptInput
            inputData={inputData}
            onInputChange={handleInputChange}
            onEncrypt={handleEncrypt}
            onDecrypt={handleDecrypt}
            isProcessing={isProcessing}
            activeAlgorithm={activeAlgorithm}
          />
        </div>

        <EncryptResults
          results={results}
          onClearResults={handleClearResults}
        />
      </div>

      <InfoPanel
        title={'Encryption Stream Info'}
        infos={[
          {
            title: 'Symmetric Encryption',
            description:
              'Uses the same key for both encryption and decryption. AES (Advanced Encryption Standard) is the most widely used symmetric algorithm.',
          },
          {
            title: 'Encryption Modes',
            description:
              'Different modes like GCM (authenticated), CBC (chained), and stream ciphers like ChaCha20 provide various security and performance characteristics.',
          },
          {
            title: 'Key Derivation',
            description:
              'Passwords are converted to encryption keys using secure key derivation functions like PBKDF2 or scrypt to resist brute-force attacks.',
          },
          {
            title: 'Stream Processing',
            description:
              'Encryption streams allow processing large amounts of data efficiently without loading everything into memory, perfect for file encryption.',
          },
          {
            title: 'Security Notice',
            description:
              'This is a demonstration. In production, use established crypto libraries, secure key management, and never expose keys in logs or UI.',
          },
          {
            title: 'Modern Algorithms',
            description:
              'ChaCha20-Poly1305 is a modern alternative to AES, offering better performance on some platforms and resistance to timing attacks.',
          },
        ]}
      />
    </div>
  );
}

export default Encrypt;
