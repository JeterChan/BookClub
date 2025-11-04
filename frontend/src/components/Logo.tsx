import { useNavigate } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/')}
      className={`flex items-center space-x-2 cursor-pointer ${className}`}
    >
      <div className="w-10 h-10 bg-gradient-to-br from-[#04c0f4] to-[#0398c4] rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
          />
        </svg>
      </div>
      <span className="text-xl font-bold text-gray-900">BookClub</span>
    </div>
  );
}
