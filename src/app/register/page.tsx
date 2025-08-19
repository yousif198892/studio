
"use client";

import dynamic from 'next/dynamic'
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const RegisterForm = dynamic(
  () => import('@/components/register-form').then((mod) => mod.RegisterForm),
  { 
    ssr: false,
    loading: () => (
       <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Skeleton className="h-20 w-20 mx-auto mb-4" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full mx-auto mt-1" />
        </CardHeader>
        <CardContent className="grid gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    ),
  }
);

export default function RegisterPage() {
  return <RegisterForm />;
}
