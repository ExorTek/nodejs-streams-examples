import { useState, useRef } from 'react';
import { Header, StreamControls, StreamOutput, StreamStats, InfoPanel } from '@components';

function Readable() {
  const [activeStream, setActiveStream] = useState(null);
  const [streamData, setStreamData] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStats, setStreamStats] = useState({ chunks: 0, bytes: 0 });
  const abortControllerRef = useRef(null);

  const streamEndpoints = [
    {
      id: 'basic',
      name: 'Basic Number Stream',
      description: 'Simple counting stream with delays',
      params: [
        { name: 'start', type: 'number', default: 1, label: 'Start Number' },
        { name: 'end', type: 'number', default: 10, label: 'End Number' },
        { name: 'delay', type: 'number', default: 500, label: 'Delay (ms)' },
      ],
    },
    {
      id: 'data',
      name: 'JSON Data Stream',
      description: 'Streaming JSON objects',
      params: [
        { name: 'count', type: 'number', default: 10, label: 'Item Count' },
        { name: 'delay', type: 'number', default: 300, label: 'Delay (ms)' },
      ],
    },
    {
      id: 'logs',
      name: 'Log Stream',
      description: 'Simulated log entries',
      params: [
        { name: 'maxLogs', type: 'number', default: 10, label: 'Max Logs' },
        { name: 'delay', type: 'number', default: 400, label: 'Delay (ms)' },
      ],
    },
    {
      id: 'custom',
      name: 'Custom Text Stream',
      description: 'Custom text with repetition',
      params: [
        { name: 'text', type: 'text', default: 'Hello', label: 'Text' },
        { name: 'repeat', type: 'number', default: 5, label: 'Repeat Count' },
        { name: 'delay', type: 'number', default: 1000, label: 'Delay (ms)' },
      ],
    },
  ];

  const [streamParams, setStreamParams] = useState(() => {
    const params = {};
    streamEndpoints.forEach(endpoint => {
      params[endpoint.id] = {};
      endpoint.params.forEach(param => {
        params[endpoint.id][param.name] = param.default;
      });
    });
    return params;
  });

  const handleParamChange = (streamId, paramName, value) => {
    setStreamParams(prev => ({
      ...prev,
      [streamId]: {
        ...prev[streamId],
        [paramName]: value,
      },
    }));
  };

  const startStream = async endpoint => {
    if (isStreaming) {
      stopStream();
      return;
    }

    setActiveStream(endpoint.id);
    setStreamData('');
    setIsStreaming(true);
    setStreamStats({ chunks: 0, bytes: 0 });

    abortControllerRef.current = new AbortController();

    const params = streamParams[endpoint.id];

    const baseUrl = 'http://127.0.0.1:5001/api/v1/readable';

    const url = new URL(`${baseUrl}/${endpoint.id}`);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url, {
      method: 'GET',
      signal: abortControllerRef.current.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response || !response.ok) {
      setIsStreaming(false);
      setStreamData(`Error: Failed to start stream - ${response?.status || 'Network Error'}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let chunkCount = 0;
    let totalBytes = 0;

    const readStream = async () => {
      const { done, value } = await reader.read();

      if (done) {
        setIsStreaming(false);
        setStreamData(prev => prev + '\n\n✅ Stream completed');
        return;
      }

      const chunk = decoder.decode(value, { stream: true });
      totalBytes += value.length;
      chunkCount++;

      setStreamData(prev => prev + chunk);
      setStreamStats({ chunks: chunkCount, bytes: totalBytes });

      readStream();
    };

    readStream();
  };

  const stopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setStreamData(prev => prev + '\n\n🛑 Stream stopped');
  };

  const clearOutput = () => {
    setStreamData('');
    setStreamStats({ chunks: 0, bytes: 0 });
  };

  return (
    <div className={'w-full'}>
      <Header
        title={'Node.js Readable Stream Playground'}
        description={'Explore and test various Node.js readable stream types and functionalities.'}
      />

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        <div className={'space-y-6'}>
          <StreamControls
            streamEndpoints={streamEndpoints}
            streamParams={streamParams}
            isStreaming={isStreaming}
            activeStream={activeStream}
            onParamChange={handleParamChange}
            onStartStream={startStream}
          />

          <StreamStats
            streamStats={streamStats}
            isStreaming={isStreaming}
          />
        </div>

        <StreamOutput
          streamData={streamData}
          onClearOutput={clearOutput}
        />
      </div>

      <InfoPanel
        title={'Readable Stream Info'}
        infos={[
          {
            title: 'Readable Streams',
            description:
              'Readable streams are used to read data from a source. They can be created from various sources like files, network requests, or custom data generators.',
          },
          {
            title: 'Stream Types',
            description:
              'This playground includes various readable stream types such as basic number streams, JSON data streams, log streams, and custom text streams.',
          },
          {
            title: 'Streaming Data',
            description:
              'Data is streamed in chunks, allowing for efficient processing of large datasets without loading everything into memory at once.',
          },
          {
            title: 'API Integration',
            description:
              'Streams are fetched using axios with proper stream handling for real-time data processing and display.',
          },
        ]}
      />
    </div>
  );
}

export default Readable;
