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
          width: '60%',
          height: '100%',
          left: '-15%',
          top: '0%',
          background: 'radial-gradient(ellipse 90% 70% at 25% 50%, #5c1a40 0%, #3a1230 45%, transparent 75%)',
          animation: 'purpleFloat 80s ease-in-out infinite',
        }}
      />
      <div
        className="absolute blur-3xl"
        style={{
          width: '80%',
          height: '50%',
          left: '-10%',
          top: '-5%',
          background: 'radial-gradient(ellipse 100% 80% at 30% 50%, #4a1535 0%, transparent 75%)',
          animation: 'purpleFloat 90s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute blur-3xl"
        style={{
          width: '45%',
          height: '90%',
          left: '-10%',
          bottom: '-5%',
          background: 'radial-gradient(ellipse 80% 90% at 35% 65%, #d94a1a 0%, #a33815 35%, transparent 65%)',
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
