
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TestTube2, Bold, Italic, Underline, Palette } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TENSE_NAME = "Present Simple";
const STORAGE_KEY = `grammar_explanation_${TENSE_NAME.replace(/\s/g, '_')}`;

export default function PresentSimplePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [explanation, setExplanation] = useState("");
    const { toast } = useToast();
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedExplanation = localStorage.getItem(STORAGE_KEY);
        if (savedExplanation) {
            setExplanation(savedExplanation);
        }
    }, []);

    const handleSave = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            localStorage.setItem(STORAGE_KEY, content);
            setExplanation(content);
            toast({
                title: "Success!",
                description: "Explanation for Present Simple has been saved."
            });
        }
    }
    
    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{TENSE_NAME} Tense</h1>
            <p className="text-muted-foreground">
                Provide an explanation for your students and create a test.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manual Explanation</CardTitle>
                            <CardDescription>
                                Write a clear explanation of the {TENSE_NAME} tense. This will be shown to students.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="explanation" className="sr-only">Explanation</Label>
                                 <div className="border rounded-md">
                                    <div className="p-2 border-b flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('bold')}}><Bold className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('italic')}}><Italic className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('underline')}}><Underline className="h-4 w-4"/></Button>
                                        <Select onValueChange={(color) => handleFormat('foreColor', color)}>
                                            <SelectTrigger className="w-[120px] h-9 ml-2">
                                                 <Palette className="h-4 w-4 mr-2" />
                                                <SelectValue placeholder="Color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="black">Black</SelectItem>
                                                <SelectItem value="red">Red</SelectItem>
                                                <SelectItem value="blue">Blue</SelectItem>
                                                <SelectItem value="green">Green</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div
                                        ref={editorRef}
                                        id="explanation"
                                        contentEditable={true}
                                        dangerouslySetInnerHTML={{ __html: explanation }}
                                        onBlur={(e) => setExplanation(e.currentTarget.innerHTML)}
                                        className="prose max-w-none prose-sm sm:prose-base min-h-[300px] w-full rounded-md p-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        suppressContentEditableWarning={true}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSave}>Save Explanation</Button>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Test</CardTitle>
                            <CardDescription>
                                After reading your explanation, students can test their knowledge. The quiz is generated dynamically by AI.
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
        </div>
    );
}
