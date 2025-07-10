import { useMemo, useRef, useEffect } from 'react';

function StreamOutput({ streamData, onClearOutput }) {
  const scrollRef = useRef(null);

  // Memoize the formatted lines to prevent unnecessary re-renders
  const formattedLines = useMemo(() => {
    if (!streamData) return [];

    return streamData.split('\n').map((line, index) => (
      <div
        key={index}
        className={'text-green-400'}>
        {line || '\u00A0'}
      </div>
    ));
  }, [streamData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamData]);

  return (
    <div className={'w-full bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700'}>
      <div className={'flex items-center justify-between mb-4'}>
        <h2 className={'text-xl font-semibold text-white'}>Stream Output</h2>
        <button
          onClick={onClearOutput}
          className={'px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors'}>
          Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        className={
          'bg-black text-green-400 p-4 rounded-md font-mono text-sm h-96 overflow-y-auto border border-gray-600'
        }>
        {formattedLines.length > 0 ? (
          formattedLines
        ) : (
          <div className={'text-gray-500 italic'}>Select a stream type and click "Start" to begin...</div>
        )}
      </div>
    </div>
  );
}

export default StreamOutput;
