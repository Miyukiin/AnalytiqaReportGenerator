"use client"; // This marks the file as a client component

import { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';

interface SampleData {
  message: string;
}

export default function SamplePage() {
  const [data, setData] = useState<SampleData | null>(null);

  useEffect(() => {
    axios
      .get<SampleData>('https://miyukiin.pythonanywhere.com/api/sample/')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-teal-500 text-gray-300 flex items-center justify-center">
      <Head>
        {/* Set the favicon for the tab */}
        <link rel="icon" href="/TabIcon.png" />
        <title>Sample Page</title> {/* You can also set the title here */}
      </Head>
            
      <div className="bg-white text-teal-700 shadow-lg rounded-lg p-8 max-w-md">
        <h1 className="text-xl font-bold mb-6">Tailwind CSS + API Integration</h1>
        <p className="text-3xl mb-4">
          {data ? `Message from API: ${data.message}` : 'Loading...'}
        </p>
        <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-teal-700 transition ease-in-out duration-200">
          Click Me
        </button>
      </div>
    </div>
  );
}
