import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MangaDetail from './pages/MangaDetail';
import Reader from './pages/Reader';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manga/:id" element={<MangaDetail />} />
        <Route path="/read/:chapterId" element={<Reader />} />
      </Routes>
    </div>
  );
}

export default App;