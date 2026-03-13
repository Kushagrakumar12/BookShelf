import { useState } from 'react';
import { GENRES } from '../utils/bookHelpers';

function BookForm({ initialData, onSubmit, buttonText, onCancel }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    author: initialData?.author || '',
    description: initialData?.description || '',
    publishedYear: initialData?.publishedYear || '',
    genre: initialData?.genre || 'Uncategorized',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.author || !formData.publishedYear) {
      setError('Title, Author, and Published Year are required.');
      return;
    }

    const year = Number(formData.publishedYear);
    if (year < 1 || year > new Date().getFullYear() + 5) {
      setError(`Published Year must be between 1 and ${new Date().getFullYear() + 5}.`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        publishedYear: year,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200/60 text-red-600 px-4 py-3 rounded-xl text-sm animate-fade-in">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g. The Great Gatsby"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Author <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g. F. Scott Fitzgerald"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Published Year <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            name="publishedYear"
            value={formData.publishedYear}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. 2024"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Genre
          </label>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className={`${inputClass} cursor-pointer`}
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`${inputClass} resize-vertical`}
          placeholder="Write a brief description of the book..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 px-5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm shadow-violet-200/50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : buttonText || 'Submit'}
        </button>
      </div>
    </form>
  );
}

export default BookForm;
