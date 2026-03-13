import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBook, updateBook } from '../api/bookApi';
import { useToast } from '../hooks/useToast';
import BookForm from '../components/BookForm';
import LoadingSpinner from '../components/LoadingSpinner';

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleSubmit = async (bookData) => {
    await updateBook(id, bookData);
    addToast('Book updated successfully!');
    navigate('/');
  };

  if (loading) return <LoadingSpinner message="Loading book..." />;

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

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-600 mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to library
      </Link>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Edit Book</h2>
        <p className="text-sm text-slate-500 mt-1">Update the book details below.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
        <BookForm initialData={book} onSubmit={handleSubmit} buttonText="Update Book" onCancel={() => navigate(-1)} />
      </div>
    </div>
  );
}

export default EditBook;
