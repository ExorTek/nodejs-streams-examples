import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Readable, Writable, Duplex } from '@pages';

function App() {
  return (
    <div className={'w-full py-10 px-4 min-h-screen bg-gray-900 text-white'}>
      <div className={'w-full max-w-6xl mx-auto'}>
        <BrowserRouter>
          <Routes>
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
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
