import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Readable, Writable, Duplex, Home, NotFound, Transform, Pipe } from '@pages';

function App() {
  return (
    <div className={'w-full py-10 px-4 min-h-screen bg-gray-900 text-white'}>
      <div className={'w-full max-w-6xl mx-auto'}>
        <BrowserRouter>
          <Routes>
            <Route
              index
              path={'/'}
              element={<Home />}
            />
            <Route
              path={'/readable'}
              element={<Readable />}
            />
            <Route
              path={'/writable'}
              element={<Writable />}
            />
            <Route
              path={'/duplex'}
              element={<Duplex />}
            />
            <Route
              path={'*'}
              element={<NotFound />}
            />
            <Route
              path={'/pipe'}
              element={<Pipe />}
            />
            <Route
              path={'/transform'}
              element={<Transform />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
