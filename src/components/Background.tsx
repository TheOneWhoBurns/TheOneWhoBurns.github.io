import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div
        className="absolute inset-0 w-full h-full"
        style={{ background: '#08080c' }}
      />
      <div
        className="absolute blur-3xl"
        style={{
          width: '70%',
          height: '120%',
          left: '-20%',
          top: '-10%',
          background: 'radial-gradient(ellipse 80% 60% at 30% 60%, #6b1f4a 0%, #3d1535 40%, transparent 70%)',
          animation: 'purpleFloat 60s ease-in-out infinite',
        }}
      />
      <div
        className="absolute blur-3xl"
        style={{
          width: '50%',
          height: '80%',
          left: '-15%',
          bottom: '-10%',
          background: 'radial-gradient(ellipse 70% 80% at 40% 70%, #c94218 0%, #8b2d1a 30%, transparent 60%)',
          animation: 'orangeFloat 70s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes purpleFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, -3%) scale(1.05); }
          66% { transform: translate(-3%, 5%) scale(0.95); }
        }
        @keyframes orangeFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, -5%) scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default Background;
