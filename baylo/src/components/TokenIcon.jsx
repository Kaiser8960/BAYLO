const TokenIcon = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 400 400" 
      className={className}
    >
      {/* Outer gold ring */}
      <path 
        d="M200,50 C300,50 380,130 380,230 C380,330 300,410 200,410 C100,410 20,330 20,230 C20,130 100,50 200,50 Z" 
        fill="#fbc34e"
      />
      {/* Inner darker gold ring */}
      <path 
        d="M200,80 C280,80 350,150 350,230 C350,310 280,380 200,380 C120,380 50,310 50,230 C50,150 120,80 200,80 Z" 
        fill="#e5a533"
      />
      {/* Inner light center with star */}
      <circle cx="200" cy="230" r="80" fill="#e4edf1" />
      <path 
        d="M200,180 L210,210 L240,210 L215,230 L225,260 L200,240 L175,260 L185,230 L160,210 L190,210 Z" 
        fill="#fbc34e"
      />
    </svg>
  );
};

export default TokenIcon;
