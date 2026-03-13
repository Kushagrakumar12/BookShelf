import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import BookList from './pages/BookList';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import BookDetail from './pages/BookDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50/80 flex flex-col">
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/add" element={<AddBook />} />
              <Route path="/edit/:id" element={<EditBook />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-200/60 bg-white/50 py-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">BookShelf &mdash; Your Personal Library Manager</p>
              <p className="text-xs text-slate-400">Built with React &amp; Tailwind</p>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
