interface SkeletonLoaderProps {
  count?: number;
  darkMode: boolean;
  type?: 'card' | 'table' | 'chart';
}

export function SkeletonLoader({
  count = 3,
  darkMode,
  type = 'card'
}: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-2xl p-6 border ${
              darkMode ? 'border-gray-700' : 'border-slate-200'
            } animate-pulse`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`} />
              <div className={`w-12 h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`} />
            </div>
            <div className={`w-24 h-8 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`} />
            <div className={`w-32 h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${darkMode ? 'bg-gray-700' : 'bg-slate-50'} border-b ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className={`h-4 rounded ${darkMode ? 'bg-gray-600' : 'bg-slate-300'} animate-pulse`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: count }).map((_, rowIdx) => (
                <tr key={rowIdx} className={`border-b ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                  {Array.from({ length: 6 }).map((_, colIdx) => (
                    <td key={colIdx} className="px-6 py-4">
                      <div className={`h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-slate-200'} animate-pulse`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
        <div className={`w-32 h-6 rounded mb-6 ${darkMode ? 'bg-gray-700' : 'bg-slate-200'} animate-pulse`} />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-24 h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-slate-200'} animate-pulse`} />
              <div className={`flex-1 h-8 rounded ${darkMode ? 'bg-gray-700' : 'bg-slate-200'} animate-pulse`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
