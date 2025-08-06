
"use client"
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { getWordsBySupervisor, Word } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WordsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "sup1";
  const [words, setWords] = useState<Word[]>([]);
  const { toast } = useToast();

  const fetchWords = useCallback(() => {
    const supervisorWords = getWordsBySupervisor(userId);
    setWords(supervisorWords);
  }, [userId]);

  useEffect(() => {
    fetchWords();
    
    // This listener ensures the component re-renders if localStorage is changed.
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'userWords') {
            fetchWords();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [fetchWords]);

  const handleDeleteWord = (wordId: string) => {
    try {
        let storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
        const updatedWords = storedWords.filter(w => w.id !== wordId);
        localStorage.setItem('userWords', JSON.stringify(updatedWords));

        // Update state to reflect change immediately
        setWords(updatedWords.filter(w => w.supervisorId === userId));

        toast({
            title: t('toasts.success'),
            description: t('toasts.deleteWordSuccess'),
        });
    } catch (e) {
        toast({
            title: t('toasts.error'),
            description: "Could not delete the word.",
            variant: "destructive"
        });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('wordsPage.title')}</h1>
          <p className="text-muted-foreground">{t('wordsPage.description')} </p>
        </div>
        <Button asChild>
            <Link href={`/dashboard/add-word?userId=${userId}`}>{t('wordsPage.addNew')}</Link>
        </Button>
      </div>

      {words.length > 0 ? (
         <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t('wordsPage.table.image')}</TableHead>
                  <TableHead>{t('wordsPage.table.word')}</TableHead>
                  <TableHead>{t('wordsPage.table.definition')}</TableHead>
                  <TableHead className="text-right">{t('wordsPage.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell>
                      <Image
                        src={word.imageUrl}
                        alt={word.word}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{word.word}</TableCell>
                    <TableCell className="max-w-sm">{word.definition}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button asChild variant="outline" size="icon">
                            <Link href={`/dashboard/edit-word/${word.id}?userId=${userId}`}>
                                <Edit className="h-4 w-4"/>
                                <span className="sr-only">Edit</span>
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4"/>
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('wordsPage.deleteDialog.title')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('wordsPage.deleteDialog.description', word.word)}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>{t('wordsPage.deleteDialog.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteWord(word.id)}>
                                    {t('wordsPage.deleteDialog.continue')}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
         </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
            <p>You have not added any words yet.</p>
        </div>
      )}
    </div>
  );
}
