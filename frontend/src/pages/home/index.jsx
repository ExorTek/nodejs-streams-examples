import { useState } from 'react';

const HomePage = () => {
  const streamTypes = [
    {
      path: '/readable',
      title: 'Readable Stream',
      description: 'Stream type used for reading data operations',
      icon: '📖',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      path: '/writable',
      title: 'Writable Stream',
      description: 'Stream type used for writing data operations',
      icon: '✍️',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      path: '/duplex',
      title: 'Duplex Stream',
      description: 'Stream type used for both reading and writing operations',
      icon: '🔄',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      path: '/transform',
      title: 'Transform Stream',
      description: 'Stream type used for data transformation operations',
      icon: '🔧',
      color: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      path: '/pipe',
      title: 'Pipe Operations',
      description: 'Operations for connecting streams together',
      icon: '🔗',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      path: '/throttle',
      title: 'Throttle Stream',
      description: 'Controlling and limiting data flow',
      icon: '⏳',
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      path: '/compress',
      title: 'Compress Stream',
      description: 'Data compression operations',
      icon: '📦',
      color: 'bg-cyan-600 hover:bg-cyan-700',
    },
    {
      path: '/encrypt',
      title: 'Encrypt Stream',
      description: 'Data encryption operations',
      icon: '🔐',
      color: 'bg-pink-600 hover:bg-pink-700',
    },
    {
      path: '/monitor',
      title: 'Monitor Stream',
      description: 'Monitoring stream performance',
      icon: '📊',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      path: '/jsonl',
      title: 'JSONL Stream',
      description: 'Processing data in JSON Lines format',
      icon: '📋',
      color: 'bg-teal-600 hover:bg-teal-700',
    },
    {
      path: '/split',
      title: 'Split Stream',
      description: 'Data splitting and separation operations',
      icon: '✂️',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      path: '/proxy',
      title: 'Proxy Stream',
      description: 'Redirecting stream data through proxy',
      icon: '🔄',
      color: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      path: '/combo',
      title: 'Combo Stream',
      description: 'Combining multiple stream types',
      icon: '🎯',
      color: 'bg-violet-600 hover:bg-violet-700',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>
            Node.js Streams Demo
          </h1>
          <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
            Explore different Node.js stream types and learn how each one works
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {streamTypes.map(stream => (
            <div
              key={stream.path}
              onClick={() => (window.location.href = stream.path)}
              className={`${stream.color} rounded-lg p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-gray-700 cursor-pointer`}>
              <div className='text-center'>
                <div className='text-4xl mb-4'>{stream.icon}</div>
                <h3 className='text-xl font-semibold mb-2'>{stream.title}</h3>
                <p className='text-sm text-gray-100 opacity-90'>{stream.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-16 text-center'>
          <div className='bg-gray-800 rounded-lg p-8 border border-gray-700'>
            <h2 className='text-2xl font-bold mb-4'>What is a Stream?</h2>
            <p className='text-gray-300 max-w-4xl mx-auto leading-relaxed'>
              Streams are structures used in Node.js to efficiently process large amounts of data. Instead of loading
              all data into memory, they process data in small chunks, optimizing memory usage. This makes it easy to
              manage large files and continuous data flows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
