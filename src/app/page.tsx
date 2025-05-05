'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Batch Processing</h1>
      <div className="space-x-4">
        <Link 
          href="/batch?type=small" 
          className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Small Batch
        </Link>
        <Link 
          href="/batch?type=big" 
          className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
        >
          Big Batch
        </Link>
      </div>
    </div>
  );
}
