import { motion } from 'framer-motion';

export default function ArtistCredit({ artist, title, source }) {
  if (!artist && !title) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="mt-3"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e2d2e]/10 backdrop-blur-sm">
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          <path 
            d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" 
            stroke="#1e2d2e" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            opacity="0.6"
          />
        </svg>
        <div className="text-[#1e2d2e]/70 font-hanken text-xs leading-tight">
          {title && <span className="font-medium">{title}</span>}
          {title && artist && <span> · </span>}
          {artist && <span>{artist}</span>}
          {source && (
            <>
              <span className="mx-1">·</span>
              <span className="opacity-60">{source}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

