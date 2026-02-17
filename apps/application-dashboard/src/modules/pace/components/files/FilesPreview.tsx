const FilesPreview = () => {
  return (
    <div className='w-3/5 overflow-y-auto p-3'>
      {/* Default View */}
      <div className='flex h-full flex-col items-center justify-start gap-y-8 p-3'>
        <div className='border-GRAY_400 rounded-xl border border-dashed p-1.5'>
          <div className='aspect-5/4 w-full overflow-hidden rounded-lg'>
            {/* Replace it with image kit image tag */}
            <img src='/images/files/file-empty-state.png' alt='File Empty State' className='size-full object-cover' />
          </div>
        </div>
        <p className='f-14-500 text-GRAY_700'>Your preview will appear here. Until then, breathe.</p>
      </div>

      {/* File Preview View */}
    </div>
  );
};

export default FilesPreview;
