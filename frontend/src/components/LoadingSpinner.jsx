function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4 animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-violet-100 rounded-full" />
        <div className="w-12 h-12 border-4 border-transparent border-t-violet-600 rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-slate-500 text-sm font-medium">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
