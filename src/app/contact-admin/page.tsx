

"use client";

import dynamic from 'next/dynamic'
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ContactAdminForm = dynamic(
  () => import('@/components/contact-admin-form').then((mod) => mod.ContactAdminForm),
  { 
    ssr: false,
    loading: () => (
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader className="text-center">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full mx-auto mt-1" />
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
           <div className="grid gap-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    ),
  }
);

export default function ContactAdminPage() {
  return <ContactAdminForm />;
}
