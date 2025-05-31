export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <h2 className='text-2xl font-bold mb-4'>Page Not Found</h2>
      <p className='text-gray-600 mb-4'>The page you're looking for doesn't exist.</p>
      <a href='/' className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'>
        Go back home
      </a>
    </div>
  );
}
