
"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube2 } from 'lucide-react';
import Link from 'next/link';

const TENSE_NAME = "Present Simple";

export default function PresentSimplePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{TENSE_NAME} Tense</h1>
            <p className="text-muted-foreground">
                Preview the test for your students.
            </p>
            <div className="flex justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Student Test</CardTitle>
                        <CardDescription>
                            Students can test their knowledge with this quiz. The questions are generated dynamically by AI.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/grammar/present-simple/quiz?userId=${userId}`}>
                                <TestTube2 className="mr-2 h-4 w-4" />
                                Preview Test
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
