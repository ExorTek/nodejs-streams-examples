function InfoPanel({
  title = 'Stream Information',
  infos = [
    {
      title: 'Readable Streams',
      description:
        'These streams produce data that can be consumed. Each example demonstrates different patterns of data generation.',
    },
    {
      title: 'Chunked Data',
      description: 'Data arrives in chunks, not all at once. Watch the statistics to see how data flows in real-time.',
    },
    {
      title: 'Backpressure',
      description: 'Streams automatically handle flow control, preventing memory issues with large datasets.',
    },
  ],
}) {
  return (
    <div className={'mt-8 bg-blue-900 bg-opacity-30 rounded-lg p-6 border border-blue-700'}>
      <h2 className={'text-lg font-semibold text-blue-300 mb-2'}> {title}</h2>
      <div className={'text-blue-200 text-sm space-y-2'}>
        {infos.map((info, index) => (
          <div
            key={index}
            className={'mb-2'}>
            <strong>{info.title}:</strong> {info.description}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InfoPanel;
