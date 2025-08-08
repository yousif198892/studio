
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TestTube2, Bold, Italic, Underline, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify, CaseSensitive, Edit, Save } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const TENSE_NAME = "Present Simple";
const STORAGE_KEY = `grammar_explanation_${TENSE_NAME.replace(/\s/g, '_')}`;
const CONTENT_LIMIT = 2000000; // Approx 2MB to stay safely within localStorage limits

export default function PresentSimplePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [explanation, setExplanation] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();
    const editorRef = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState("");

    useEffect(() => {
        const savedExplanation = localStorage.getItem(STORAGE_KEY);
        const initialContent = savedExplanation || `<p>Provide a detailed explanation for the <strong>${TENSE_NAME}</strong> tense here. You can use formatting tools to structure your content.</p>`;
        setExplanation(initialContent);
        setContent(initialContent);
    }, []);

    const handleSave = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;

            if (newContent.length > CONTENT_LIMIT) {
                 toast({
                    title: "Error: Content Too Large",
                    description: `The explanation is too long. Please reduce its size. Limit: ${CONTENT_LIMIT} characters.`,
                    variant: "destructive",
                    duration: 10000,
                });
                return;
            }

            try {
                localStorage.setItem(STORAGE_KEY, newContent);
                setExplanation(newContent);
                setContent(newContent);
                setIsEditing(false);
                toast({
                    title: "Success!",
                    description: "Explanation for Present Simple has been saved."
                });
            } catch (error) {
                if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                     toast({
                        title: "Error: Storage Full",
                        description: "The explanation is too large to save. Please reduce its size or complexity.",
                        variant: "destructive",
                        duration: 10000,
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "An unknown error occurred while saving.",
                        variant: "destructive",
                    });
                }
                console.error("Failed to save to localStorage:", error);
            }
        }
    }
    
    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    }
    
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        // If we are cancelling an edit, revert the content
        if(isEditing) {
            if (editorRef.current) {
                editorRef.current.innerHTML = explanation;
            }
        }
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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Manual Explanation</CardTitle>
                                <CardDescription>
                                    {isEditing ? "Edit the explanation below." : "A clear explanation of the tense for students."}
                                </CardDescription>
                            </div>
                             <div>
                                {!isEditing ? (
                                    <Button variant="outline" onClick={handleEditToggle}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handleEditToggle}>Cancel</Button>
                                        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="border rounded-md">
                                {isEditing && (
                                    <div className="p-2 border-b flex items-center flex-wrap gap-1">
                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('bold')}} title="Bold"><Bold className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('italic')}} title="Italic"><Italic className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('underline')}} title="Underline"><Underline className="h-4 w-4"/></Button>
                                        
                                        <div className="h-6 border-l mx-2"></div>

                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('justifyLeft')}} title="Align Left"><AlignLeft className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('justifyCenter')}} title="Align Center"><AlignCenter className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('justifyRight')}} title="Align Right"><AlignRight className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onMouseDown={(e) => {e.preventDefault(); handleFormat('justifyFull')}} title="Align Justify"><AlignJustify className="h-4 w-4"/></Button>

                                        <div className="h-6 border-l mx-2"></div>

                                        <Select onValueChange={(size) => handleFormat('fontSize', size)}>
                                            <SelectTrigger className="w-[140px] h-9">
                                                 <CaseSensitive className="h-4 w-4 mr-2" />
                                                <SelectValue placeholder="Font Size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">Normal</SelectItem>
                                                <SelectItem value="5">Large</SelectItem>
                                                <SelectItem value="7">Heading</SelectItem>
                                                <SelectItem value="2">Small</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select>
                                            <SelectTrigger className="w-[120px] h-9 ml-2">
                                                 <Palette className="h-4 w-4 mr-2" />
                                                <SelectValue placeholder="Color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="black" onMouseDown={(e) => {e.preventDefault(); handleFormat('foreColor', 'black')}}>Black</SelectItem>
                                                <SelectItem value="red" onMouseDown={(e) => {e.preventDefault(); handleFormat('foreColor', 'red')}}>Red</SelectItem>
                                                <SelectItem value="blue" onMouseDown={(e) => {e.preventDefault(); handleFormat('foreColor', 'blue')}}>Blue</SelectItem>
                                                <SelectItem value="green" onMouseDown={(e) => {e.preventDefault(); handleFormat('foreColor', 'green')}}>Green</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <ScrollArea className="h-72">
                                    <div
                                        ref={editorRef}
                                        id="explanation"
                                        contentEditable={isEditing}
                                        dangerouslySetInnerHTML={{ __html: content }}
                                        className={cn(
                                            "prose max-w-none prose-sm sm:prose-base min-h-[300px] w-full p-4 text-base ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                            isEditing && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                            !isEditing && "bg-muted/50 select-text cursor-text"
                                        )}
                                        suppressContentEditableWarning={true}
                                    />
                                </ScrollArea>
                            </div>
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
