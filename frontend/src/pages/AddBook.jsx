import { useNavigate, Link } from 'react-router-dom';
import { createBook } from '../api/bookApi';
import { useToast } from '../hooks/useToast';
import BookForm from '../components/BookForm';

function AddBook() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (bookData) => {
    await createBook(bookData);
    addToast('Book added successfully!');
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-600 mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to library
      </Link>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Add New Book</h2>
        <p className="text-sm text-slate-500 mt-1">Fill in the details below to add a book to your library.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
        <BookForm onSubmit={handleSubmit} buttonText="Add Book" onCancel={() => navigate('/')} />
      </div>
    </div>
  );
}

export default AddBook;
