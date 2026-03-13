import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBook, deleteBook } from '../api/bookApi';
import { useToast } from '../hooks/useToast';
import { getCoverColor } from '../utils/bookHelpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await getBook(id);
        setBook(data);
      } catch {
        setError('Book not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteBook(id);
      addToast('Book deleted successfully');
      navigate('/');
    } catch {
      addToast('Failed to delete book', 'error');
    }
    setShowDeleteModal(false);
  };

  if (loading) return <LoadingSpinner message="Loading book details..." />;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-fade-in">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">{error}</h3>
        <Link to="/" className="text-violet-600 hover:text-violet-700 font-medium text-sm transition-colors">
          &larr; Back to library
        </Link>
      </div>
    );
  }

  const coverColor = getCoverColor(book.title);
  const genre = book.genre || 'Uncategorized';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-600 mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to library
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
        {/* Hero header */}
        <div className={`bg-gradient-to-br ${coverColor} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
              <circle cx="85" cy="-10" r="40" fill="white" />
              <circle cx="10" cy="50" r="30" fill="white" />
            </svg>
          </div>
          <div className="relative px-6 sm:px-8 py-8 sm:py-10">
            <span className="inline-flex items-center text-xs font-medium bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full mb-4">
              {genre}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">{book.title}</h1>
            <p className="text-white/80 text-sm sm:text-base">by {book.author}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Description */}
          {book.description ? (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">{book.description}</p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">No description available.</p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Year</p>
              <p className="text-lg font-semibold text-slate-800">{book.publishedYear}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Genre</p>
              <p className="text-lg font-semibold text-slate-800">{genre}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Added</p>
              <p className="text-sm font-medium text-slate-800">
                {new Date(book.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Updated</p>
              <p className="text-sm font-medium text-slate-800">
                {new Date(book.updatedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex gap-3">
          <Link
            to={`/edit/${book._id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit Book
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

export default BookDetail;
