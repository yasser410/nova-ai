import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="voice-wave">
        <span style={{ height: '4px' }} />
        <span style={{ height: '8px' }} />
        <span style={{ height: '12px' }} />
        <span style={{ height: '8px' }} />
        <span style={{ height: '4px' }} />
      </div>
      <span className="text-sm text-slate-400">جاري المعالجة...</span>
    </div>
  );
};
