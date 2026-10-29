import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [mangaList, setMangaList] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('mangadex_progress') || '{}');
    const items = Object.values(saved).sort((a, b) => b.timestamp - a.timestamp);
    setContinueReading(items);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/manga?title=${encodeURIComponent(query)}`);
      const data = await res.json();
      setMangaList(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="flex items-center gap-3 mb-12">
        <BookOpen className="text-accent w-8 h-8" />
        <h1 className="text-3xl font-bold tracking-tight">MangaDex Reader</h1>
      </header>

      <form onSubmit={handleSearch} className="relative max-w-2xl mb-16">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search manga, manhwa, comics..."
          className="w-full bg-dark border border-white/10 rounded-2xl py-4 pl-14 pr-32 text-lg focus:outline-none focus:border-accent transition-colors"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-darker font-semibold px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors"
        >
          Search
        </button>
      </form>

      {continueReading.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Continue Reading</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {continueReading.map((item) => (
              <Link to={`/read/${item.chapterId}?mangaId=${item.mangaId}`} key={item.chapterId} className="group relative rounded-xl overflow-hidden aspect-[2/3] bg-dark">
                {item.coverUrl ? (
                  <img src={item.coverUrl} alt={item.mangaTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">No Cover</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-darker/90 via-darker/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="font-semibold text-sm line-clamp-2">{item.mangaTitle}</p>
                  <p className="text-xs text-accent mt-1">Ch. {item.chapterNum}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Searching...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {mangaList.map((manga) => {
            const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || 'Unknown';
            const coverArt = manga.relationships.find(r => r.type === 'cover_art');
            const coverUrl = coverArt ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}` : null;

            return (
              <Link to={`/manga/${manga.id}`} key={manga.id} className="group relative rounded-xl overflow-hidden aspect-[2/3] bg-dark">
                {coverUrl ? (
                  <img src={coverUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">No Cover</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-darker/90 via-darker/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="font-semibold text-sm line-clamp-2">{title}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}