import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function MangaDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/manga/${id}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchManga();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-gray-400">Loading...</div>;
  if (!data) return <div className="p-20 text-center text-gray-400">Not found</div>;

  const { manga, chapters } = data;
  const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || 'Unknown';
  const description = manga.attributes.description.en || Object.values(manga.attributes.description)[0] || 'No description.';
  const coverArt = manga.relationships.find(r => r.type === 'cover_art');
  const coverUrl = coverArt ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}` : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-16">
        <div className="w-full md:w-1/3 aspect-[2/3] rounded-2xl overflow-hidden bg-dark shrink-0">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">No Cover</div>
          )}
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-gray-400 leading-relaxed mb-6 line-clamp-6">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
        <BookOpen className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold">Chapters ({chapters.length})</h2>
      </div>

      <div className="flex flex-col gap-2">
        {chapters.map((chapter) => {
          const chNum = chapter.attributes.chapter;
          const chTitle = chapter.attributes.title || 'No Title';
          return (
            <Link
              to={`/read/${chapter.id}?mangaId=${manga.id}&mangaTitle=${encodeURIComponent(title)}&chapterNum=${chNum}&coverUrl=${encodeURIComponent(coverUrl || '')}`}
              key={chapter.id}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-dark transition-colors border border-transparent hover:border-white/5 group"
            >
              <div className="flex items-center gap-4">
                <span className="text-accent font-mono font-bold w-16">Ch. {chNum || '?'}</span>
                <span className="font-medium group-hover:text-accent transition-colors">{chTitle}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(chapter.attributes.publishAt).toLocaleDateString()}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}