import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteBook } from '../api/bookApi';
import { useToast } from '../hooks/useToast';
import { getCoverColor } from '../utils/bookHelpers';
import ConfirmModal from './ConfirmModal';

function BookCard({ book, onDelete, viewMode = 'grid', index = 0 }) {
  const { addToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const coverColor = getCoverColor(book.title);
  const genre = book.genre || 'Uncategorized';

  const handleDelete = async () => {
    try {
      await deleteBook(book._id);
      onDelete(book._id);
      addToast(`"${book.title}" deleted successfully`);
    } catch {
      addToast('Failed to delete book', 'error');
    }
    setShowDeleteModal(false);
  };

  const stagger = index < 6 ? `stagger-${index + 1}` : '';

  if (viewMode === 'list') {
    return (
      <>
        <div className={`group bg-white rounded-xl border border-slate-200/60 hover:border-violet-200 hover:shadow-md transition-all duration-200 p-4 flex gap-4 items-center animate-fade-in ${stagger}`}>
          <Link to={`/books/${book._id}`} className="shrink-0">
            <div className={`w-12 h-16 rounded-lg bg-gradient-to-br ${coverColor} flex items-center justify-center shadow-sm`}>
              <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/books/${book._id}`}>
              <h3 className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors truncate">{book.title}</h3>
            </Link>
            <p className="text-sm text-slate-500 mt-0.5">by {book.author} &middot; {book.publishedYear}</p>
          </div>
          <span className="hidden sm:inline-flex text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{genre}</span>
          <div className="flex items-center gap-1 shrink-0">
            <Link to={`/edit/${book._id}`} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Edit">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </Link>
            <button onClick={() => setShowDeleteModal(true)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
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
      </>
    );
  }

  return (
    <>
      <div className={`group bg-white rounded-2xl border border-slate-200/60 hover:border-violet-200 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col animate-fade-in ${stagger}`}>
        {/* Color cover header */}
        <Link to={`/books/${book._id}`} className="block">
          <div className={`h-32 bg-gradient-to-br ${coverColor} relative overflow-hidden`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="absolute top-3 right-3 text-xs font-semibold bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
              {book.publishedYear}
            </span>
          </div>
        </Link>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <Link to={`/books/${book._id}`} className="mb-1">
            <h3 className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors line-clamp-1 leading-snug">
              {book.title}
            </h3>
          </Link>
          <p className="text-sm text-slate-500 mb-3">by {book.author}</p>
          <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
            {book.description || 'No description available.'}
          </p>
          <span className="self-start text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full mb-4">
            {genre}
          </span>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Link
              to={`/books/${book._id}`}
              className="flex-1 text-center py-2 px-3 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
            >
              View
            </Link>
            <Link
              to={`/edit/${book._id}`}
              className="flex-1 text-center py-2 px-3 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="py-2 px-3 text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

export default BookCard;
