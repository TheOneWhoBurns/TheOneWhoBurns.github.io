import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div
        className="absolute inset-0 w-full h-full blur-3xl"
        style={{
          background: 'linear-gradient(135deg, #1a0a00 0%, #ff8c42 25%, #0a0a0a 50%, #e67a35 75%, #0f0805 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 12s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Background;
