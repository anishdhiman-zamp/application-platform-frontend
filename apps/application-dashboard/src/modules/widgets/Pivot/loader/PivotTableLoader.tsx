const PivotTableLoader = () => {
  return (
    <div className='border-GRAY_400 h-full w-full animate-pulse overflow-hidden overflow-x-auto rounded-xl border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <table className='w-full border-collapse text-left'>
        <thead className='h-[84px]'>
          <tr className='border-GRAY_400 border-b'>
            {Array.from({ length: 6 }).map((_, i) => (
              <th
                key={i}
                className='border-r-0.5 border-GRAY_400 w-[170px] px-4 py-6 first:w-[380px] first:min-w-[380px] last:border-r-0'
              >
                <div className='bg-GRAY_50 h-4 w-24 rounded'></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 12 }).map((_, rowIndex) => (
            <tr key={rowIndex} className='border-b-0.5 border-GRAY_400 last:border-b-0'>
              {Array.from({ length: 6 }).map((_, colIndex) => (
                <td key={colIndex} className='border-r-0.5 border-GRAY_400 h-[42px] px-4 py-3 last:border-r-0'>
                  <div className='bg-GRAY_50 h-4 w-full rounded'></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PivotTableLoader;
