
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function GrammarPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const tenses = [
        { name: "Present Simple", href: `/dashboard/grammar/present-simple?userId=${userId}` },
        { name: "Past Simple", href: `/dashboard/grammar/past-simple?userId=${userId}` },
        { name: "Present Continuous", href: `/dashboard/grammar/present-continuous?userId=${userId}` }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Grammar Hub</h1>
            <p className="text-muted-foreground">
                Manage and create grammar lessons for your students.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Tenses</CardTitle>
                    <CardDescription>Select a tense to view or edit its explanation and test.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {tenses.map((tense) => (
                            <Link href={tense.href} key={tense.name}>
                                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <span className="font-medium">{tense.name}</span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
