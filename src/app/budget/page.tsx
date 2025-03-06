"use client";

import { useUser } from '@clerk/nextjs';
import { AlertCircle } from 'lucide-react'
import React from 'react'

function budget() {

  const { isSignedIn } = useUser();

  if (!isSignedIn) return <div className="w-full h-screen bg-white dark:bg-gray-950 min-h-screen" />;
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <AlertCircle className="h-16 w-16 text-gray-500 dark:text-gray-400" />
      <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-4">Not Implemented Yet</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mt-2">This page is under construction. Please check back later.</p>
    </div>
  )
}

export default budget