import React from 'react';
import { useRouter } from 'next/router';

const LeftNavMenu: React.FC = () => {
  const router = useRouter();

  const handleTabClick = (tab: 'morse' | 'tesla-10K' | 'pinecone' | 'custom') => {
    router.push(`/${tab}`);
  };

  return (
    <>
      <button className="w-full p-2" onClick={() => handleTabClick('morse')}>
        Morse Chat
      </button>
      {/* <button className="w-full p-2" onClick={() => handleTabClick('tesla-10K')}>
        Tesla Earnings Chat
      </button> */}
      <button className="w-full p-2" onClick={() => handleTabClick('pinecone')}>
        Pinecone Docs Chat
      </button>
      {/* <button className="w-full p-2" onClick={() => handleTabClick('custom')}>
        Custom PDF Chat
      </button> */}
    </>
  );
};

export default LeftNavMenu;
