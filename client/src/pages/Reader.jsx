import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, LayoutGrid, AlignJustify } from 'lucide-react';

export default function Reader() {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const mangaId = searchParams.get('mangaId');
  const mangaTitle = searchParams.get('mangaTitle') || 'Manga';
  const chapterNum = searchParams.get('chapterNum') || '?';
  const coverUrl = searchParams.get('coverUrl') || '';

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState('paginated');
  const [currentPage, setCurrentPage] = useState(0);
  const [showUI, setShowUI] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const hideUITimer = useRef(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/chapter/${chapterId}`);
        const data = await res.json();
        const imgs = dataSaver ? data.dataSaverImages : data.images;
        setImages(imgs);

        const progress = JSON.parse(localStorage.getItem('mangadex_progress') || '{}');
        progress[chapterId] = {
          chapterId,
          chapterNum,
          mangaTitle,
          mangaId,
          coverUrl,
          timestamp: Date.now()
        };
        localStorage.setItem('mangadex_progress', JSON.stringify(progress));
      } catch (err) {
        setError('Failed to load images.');
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId, dataSaver, mangaId, mangaTitle, chapterNum, coverUrl]);

  const nextPage = useCallback(() => {
    if (currentPage < images.length - 1) setCurrentPage(p => p + 1);
  }, [currentPage, images.length]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== 'paginated') return;
      if (e.key === 'ArrowRight' || e.key === 'd') nextPage();
      else if (e.key === 'ArrowLeft' || e.key === 'a') prevPage();
      else if (e.key === 'f') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, nextPage, prevPage]);

  const handleMouseMove = () => {
    setShowUI(true);
    if (hideUITimer.current) clearTimeout(hideUITimer.current);
    hideUITimer.current = setTimeout(() => setShowUI(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-400">Loading Chapter...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="h-screen bg-darker text-white relative overflow-hidden" onMouseMove={handleMouseMove}>
      <div className={`absolute top-0 left-0 right-0 z-50 bg-darker/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-4">
          <Link to={mangaId ? `/manga/${mangaId}` : '/'} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-sm">Chapter {chapterNum}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode(mode === 'paginated' ? 'vertical' : 'paginated')} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm">
            {mode === 'paginated' ? <AlignJustify className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            <span className="hidden sm:inline">{mode === 'paginated' ? 'Webtoon' : 'Paginated'}</span>
          </button>
          <button onClick={() => setDataSaver(!dataSaver)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${dataSaver ? 'bg-accent text-darker' : 'bg-white/10 hover:bg-white/20'}`}>
            Data Saver
          </button>
          <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        {mode === 'paginated' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer" onClick={prevPage} />
            <div className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer" onClick={nextPage} />
            <img src={images[currentPage]} alt={`Page ${currentPage + 1}`} className="max-h-full max-w-full object-contain select-none" />
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-darker/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-mono transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
              {currentPage + 1} / {images.length}
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center py-20">
            {images.map((src, idx) => (
              <img key={idx} src={src} alt={`Page ${idx + 1}`} className="w-full max-w-3xl object-contain mb-2" loading="lazy" />
            ))}
            <div className="py-12 text-gray-500 text-sm">End of Chapter</div>
          </div>
        )}
      </div>

      {mode === 'paginated' && (
        <div className={`absolute bottom-0 left-0 right-0 z-50 bg-darker/80 backdrop-blur-md border-t border-white/10 p-4 flex items-center justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : 'translate-y-full'}`}>
          <button onClick={prevPage} disabled={currentPage === 0} className="p-3 hover:bg-white/10 rounded-xl disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 mx-8 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${((currentPage + 1) / images.length) * 100}%` }} />
          </div>
          <button onClick={nextPage} disabled={currentPage === images.length - 1} className="p-3 hover:bg-white/10 rounded-xl disabled:opacity-30 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}