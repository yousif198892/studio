
"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWordsBySupervisor, Word, Unit, getUnitsBySupervisor } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/hooks/use-language";

export default function WordsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "sup1";
  const [words, setWords] = useState<Word[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if(isClient) {
      const supervisorWords = getWordsBySupervisor(userId);
      setWords(supervisorWords);
      
      const supervisorUnits = getUnitsBySupervisor(userId);
      setUnits(supervisorUnits);
    }

  }, [userId, isClient]);

  const handleDelete = (wordId: string) => {
    // Remove from component state
    const updatedWords = words.filter(w => w.id !== wordId);
    setWords(updatedWords);

    // Remove from localStorage
    const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
    const updatedStoredWords = storedWords.filter(w => w.id !== wordId);
    localStorage.setItem('userWords', JSON.stringify(updatedStoredWords));
  }
  
  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : "N/A";
  }

  if (!isClient) {
    return <div>{t('dashboard.loading')}</div>
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('wordsPage.title')}</h1>
          <p className="text-muted-foreground">{t('wordsPage.description')}</p>
        </div>
        <Button asChild>
            <Link href={`/dashboard/add-word?userId=${userId}`}>{t('wordsPage.addNew')}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('wordsPage.table.title')}</CardTitle>
          <CardDescription>
            {t('wordsPage.table.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  {t('wordsPage.table.image')}
                </TableHead>
                <TableHead>{t('wordsPage.table.word')}</TableHead>
                <TableHead>{t('wordsPage.table.definition')}</TableHead>
                <TableHead>{t('wordsPage.table.unit')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('wordsPage.table.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {words.map((word) => (
                <TableRow key={word.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Word image"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={word.imageUrl}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{word.word}</TableCell>
                  <TableCell>{word.definition}</TableCell>
                  <TableCell>{getUnitName(word.unitId)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/dashboard/edit-word/${word.id}?userId=${userId}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
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
                              <AlertDialogAction onClick={() => handleDelete(word.id)}>{t('wordsPage.deleteDialog.continue')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
