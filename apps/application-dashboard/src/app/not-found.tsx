export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <h2 className='mb-4 text-2xl font-bold'>Page Not Found</h2>
      <p className='mb-4 text-gray-600'>The page you're looking for doesn't exist.</p>
      <a href='/' className='rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'>
        Go back home
      </a>
    </div>
  );
}
