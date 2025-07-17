import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Readable,
  Writable,
  Duplex,
  Home,
  NotFound,
  Transform,
  Pipe,
  Monitor,
  Throttle,
  Split,
  JsonL,
  Compress,
  Encrypt,
} from '@pages';
import { useMemo } from 'react';

function App() {
  const navigate = useNavigate();

  const routes = useMemo(
    () => [
      { path: '/', element: <Home /> },
      { path: '/readable', element: <Readable /> },
      { path: '/writable', element: <Writable /> },
      { path: '/duplex', element: <Duplex /> },
      { path: '/transform', element: <Transform /> },
      { path: '/pipe', element: <Pipe /> },
      { path: '/monitor', element: <Monitor /> },
      { path: '/throttle', element: <Throttle /> },
      { path: '/split', element: <Split /> },
      { path: '/jsonl', element: <JsonL /> },
      { path: '/compress', element: <Compress /> },
      { path: '/encrypt', element: <Encrypt /> },
      { path: '*', element: <NotFound /> },
    ],
    [],
  );
  return (
    <div className={'w-full py-10 px-4 min-h-screen bg-gray-900 text-white'}>
      <div className={'fixed top-2 right-2'}>
        <button
          className={
            'px-4 py-2 text-white rounded shadow bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }
          onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
      <div className={'w-full mx-auto max-w-7xl'}>
        <Routes>
          {routes.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
      </div>
    </div>
  );
}

export default App;
