
"use client";

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react';

const LearnClientPage = dynamic(() => import('./learn-client-page'), { ssr: false })

function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Loading Learning Session...</p>
        </div>
    )
}

export default function LearnPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LearnClientPage />
    </Suspense>
  )
}
