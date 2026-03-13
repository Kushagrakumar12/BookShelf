import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../api/bookApi';
import { GENRES } from '../utils/bookHelpers';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';

const FILTER_GENRES = ['All', ...GENRES];

function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [genreFilter, setGenreFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const fetchBooks = async () => {
    try {
      const { data } = await getBooks();
      setBooks(data);
    } catch {
      setError('Failed to fetch books. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = (id) => {
    setBooks((prev) => prev.filter((book) => book._id !== id));
  };

  const stats = useMemo(() => {
    const authors = new Set(books.map((b) => b.author));
    const genres = new Set(books.map((b) => b.genre || 'Uncategorized'));
    const oldestYear = books.length ? Math.min(...books.map((b) => b.publishedYear)) : 0;
    return { total: books.length, authors: authors.size, genres: genres.size, oldestYear };
  }, [books]);

  const filteredBooks = useMemo(() => {
    let result = books;

    if (genreFilter !== 'All') {
      result = result.filter((b) => (b.genre || 'Uncategorized') === genreFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.genre || '').toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    switch (sortBy) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        sorted.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'year-asc':
        sorted.sort((a, b) => a.publishedYear - b.publishedYear);
        break;
      case 'year-desc':
        sorted.sort((a, b) => b.publishedYear - a.publishedYear);
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return sorted;
  }, [books, search, sortBy, genreFilter]);

  if (loading) return <LoadingSpinner message="Loading your library..." />;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-fade-in">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Connection Error</h3>
        <p className="text-slate-500 text-sm mb-5">{error}</p>
        <button
          onClick={() => { setError(''); setLoading(true); fetchBooks(); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-violet-200/50 hover:shadow-md transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  const selectClass = 'px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all cursor-pointer appearance-none';

  return (
    <div className="space-y-6">
      {/* Hero / Stats */}
      {books.length > 0 && (
        <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">Your Library</h1>
            <p className="text-violet-200 text-sm mb-6">Track and manage your book collection</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: stats.total, label: 'Total Books' },
                { value: stats.authors, label: 'Authors' },
                { value: stats.genres, label: 'Genres' },
                { value: stats.oldestYear, label: 'Oldest Book' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
                  <p className="text-violet-200 text-xs sm:text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search, Filter, Sort bar */}
      {books.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm animate-fade-in stagger-1">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search books, authors, genres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className={selectClass}
            >
              {FILTER_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={selectClass}
            >
              <option value="newest">Recently Added</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
              <option value="year-desc">Year (Newest)</option>
              <option value="year-asc">Year (Oldest)</option>
            </select>
            <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                aria-label="Grid view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                aria-label="List view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              </button>
            </div>
          </div>
          {(search || genreFilter !== 'All') && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Showing {filteredBooks.length} of {books.length}</span>
              {genreFilter !== 'All' && (
                <button
                  onClick={() => setGenreFilter('All')}
                  className="inline-flex items-center gap-1 bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full hover:bg-violet-100 transition-colors font-medium"
                >
                  {genreFilter}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="inline-flex items-center gap-1 bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full hover:bg-violet-100 transition-colors font-medium"
                >
                  &ldquo;{search}&rdquo;
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {books.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-violet-400 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Your library is empty</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Start building your collection by adding your first book.
          </p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-violet-200/50 hover:shadow-md transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Book
          </Link>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">No results found</h3>
          <p className="text-slate-500 text-sm mb-4">
            No books match your current filters.
          </p>
          <button
            onClick={() => { setSearch(''); setGenreFilter('All'); }}
            className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'flex flex-col gap-3'
        }>
          {filteredBooks.map((book, i) => (
            <BookCard key={book._id} book={book} onDelete={handleDelete} viewMode={viewMode} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookList;
