
"use client";

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton';

const LandingPage = dynamic(
  () => import('@/components/landing-page').then((mod) => mod.LandingPage),
  { 
    ssr: false,
    loading: () => <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm fixed w-full top-0 z-50">
        <Skeleton className="h-8 w-24" />
        <div className="ms-auto flex items-center gap-4 sm:gap-6">
           <Skeleton className="h-8 w-20" />
           <Skeleton className="h-10 w-20" />
           <Skeleton className="h-10 w-24" />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full pt-24 md:pt-32 lg:pt-40">
           <div className="container px-4 md:px-6 space-y-10 xl:space-y-16">
              <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
                <div className='space-y-4'>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-8 w-full mt-4" />
                   <Skeleton className="h-8 w-full" />
                  <div className="space-x-4 mt-6">
                     <Skeleton className="h-12 w-48" />
                  </div>
                </div>
                <div className="flex justify-center">
                   <Skeleton className="h-[625px] w-[500px] rounded-xl" />
                </div>
              </div>
            </div>
        </section>
      </main>
    </div>
  }
);

export default function Home() {
  return <LandingPage />;
}
