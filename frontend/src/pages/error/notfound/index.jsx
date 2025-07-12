import { useState, useEffect } from 'react';

const NotFoundPage = () => {
  const [streamText, setStreamText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  const errorMessage = '404 - Stream Not Found';
  const streamingChars = ['|', '/', '-', '\\'];
  const [spinnerIndex, setSpinnerIndex] = useState(0);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < errorMessage.length) {
        setStreamText(errorMessage.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isStreaming) {
      const spinnerInterval = setInterval(() => {
        setSpinnerIndex(prev => (prev + 1) % streamingChars.length);
      }, 150);
      return () => clearInterval(spinnerInterval);
    }
  }, [isStreaming]);

  const goHome = () => {
    window.location.href = '/';
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center'>
      <div className='text-center max-w-2xl mx-auto px-4'>
        <div className='mb-8'>
          <div className='text-6xl font-mono mb-4 text-red-400'>
            {streamText}
            {isStreaming && <span className='text-yellow-400 animate-pulse'>{streamingChars[spinnerIndex]}</span>}
          </div>

          <div className='flex justify-center items-center space-x-2 mb-6'>
            <div className='w-4 h-4 bg-red-500 rounded-full animate-pulse'></div>
            <div className='w-12 h-1 bg-gray-600 rounded'>
              <div className='w-0 h-full bg-red-500 rounded animate-pulse'></div>
            </div>
            <div className='text-red-400 text-xl'>⚠️</div>
            <div className='w-12 h-1 bg-gray-600 rounded'>
              <div className='w-0 h-full bg-red-500 rounded animate-pulse'></div>
            </div>
            <div className='w-4 h-4 bg-gray-600 rounded-full'></div>
          </div>
        </div>

        <div className='bg-gray-800 rounded-lg p-8 border border-red-500/30 mb-8'>
          <div className='text-red-400 text-xl mb-4'>🚫 Stream Connection Lost</div>
          <p className='text-gray-300 mb-4 leading-relaxed'>
            The stream you are looking for could not be found. This stream may not be implemented yet or you may have
            been redirected to an incorrect URL.
          </p>

          <div className='bg-gray-900 rounded p-4 font-mono text-sm text-left border border-gray-700'>
            <div className='text-red-400'>Error Stack:</div>
            <div className='text-gray-400 mt-2'>
              → Stream.readable: <span className='text-red-300'>false</span>
              <br />→ Stream.writable: <span className='text-red-300'>false</span>
              <br />→ Stream.destroyed: <span className='text-yellow-300'>true</span>
              <br />→ Error.code: <span className='text-red-300'>'ENOENT'</span>
              <br />→ Error.path: <span className='text-blue-300'>'{window.location.pathname}'</span>
            </div>
          </div>
        </div>

        <div className='bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8'>
          <h3 className='text-xl font-semibold mb-4 text-blue-400'>📡 Available Streams</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-2 text-sm'>
            {[
              '/readable',
              '/writable',
              '/duplex',
              '/transform',
              '/pipe',
              '/throttle',
              '/compress',
              '/encrypt',
              '/monitor',
              '/jsonl',
              '/split',
              '/proxy',
              '/combo',
            ].map(stream => (
              <div
                key={stream}
                onClick={() => (window.location.href = stream)}
                className='bg-gray-700 hover:bg-gray-600 rounded px-3 py-2 cursor-pointer transition-colors duration-200 font-mono text-green-400 hover:text-green-300'>
                {stream}
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button
            onClick={goHome}
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg'>
            🏠 Go to Homepage
          </button>

          <button
            onClick={goBack}
            className='bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg'>
            ← Go Back
          </button>
        </div>

        <div className='mt-8 text-sm text-gray-400'>
          <p className='italic'>
            💡 Stream Fact: Node.js streams are derived from the EventEmitter class and efficiently manage asynchronous
            data flow.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
