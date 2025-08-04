
"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWordsForStudent, Word, Unit, getUnitsBySupervisor, getUserById } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";

export default function MyWordsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "user1";
  const [words, setWords] = useState<Word[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      const student = getUserById(userId);
      if (student?.supervisorId) {
        const studentWords = getWordsForStudent(userId);
        const learnedWords = studentWords.filter(w => w.strength > 0);
        setWords(learnedWords);
        const supervisorUnits = getUnitsBySupervisor(student.supervisorId);
        setUnits(supervisorUnits);
      }
    }
  }, [userId]);

  const updateWordInStorage = (updatedWord: Word) => {
    try {
      const student = getUserById(userId);
      if (!student?.supervisorId) return;

      const allWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
      const supervisorId = student.supervisorId;
      const otherSupervisorWords = allWords.filter(w => w.supervisorId !== supervisorId);
      const supervisorWords = allWords.filter(w => w.supervisorId === supervisorId);
      
      const wordIndex = supervisorWords.findIndex(w => w.id === updatedWord.id);
      
      if (wordIndex > -1) {
        supervisorWords[wordIndex] = updatedWord;
      }
      
      localStorage.setItem('userWords', JSON.stringify([...otherSupervisorWords, ...supervisorWords]));

    } catch (e) {
      console.error("Failed to update word in localStorage", e);
    }
  };

  const handleDelete = (wordId: string) => {
    const student = getUserById(userId);
    if (!student?.supervisorId) return;

    // Remove from component state
    const updatedWords = words.filter(w => w.id !== wordId);
    setWords(updatedWords);

    // Remove from localStorage
    const allWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
    const supervisorId = student.supervisorId;
    const otherSupervisorWords = allWords.filter(w => w.supervisorId !== supervisorId);
    let supervisorWords = allWords.filter(w => w.supervisorId === supervisorId);

    supervisorWords = supervisorWords.filter(w => w.id !== wordId);
    
    localStorage.setItem('userWords', JSON.stringify([...otherSupervisorWords, ...supervisorWords]));

    toast({ title: t('toasts.success'), description: t('toasts.deleteWordSuccess') });
  }

  const handleReschedule = (word: Word, days: number) => {
    const newNextReview = new Date();
    newNextReview.setDate(newNextReview.getDate() + days);

    const updatedWord: Word = { ...word, nextReview: newNextReview };

    const updatedWords = words.map(w => w.id === word.id ? updatedWord : w);
    setWords(updatedWords);

    updateWordInStorage(updatedWord);
    toast({ title: t('toasts.success'), description: t('toasts.rescheduleSuccess', word.word) });
  };
  
  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : "N/A";
  }

  const reviewOptions = [
    { label: "Tomorrow", days: 1 },
    { label: "After 2 days", days: 2 },
    { label: "After 3 days", days: 3 },
    { label: "After a week", days: 7 },
    { label: "After 2 weeks", days: 14 },
    { label: "After a month", days: 30 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('dashboard.student.learnedTitle')}</h1>
        <p className="text-muted-foreground">{t('wordsPage.myLearnedWordsDesc')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('wordsPage.table.title')}</CardTitle>
          <CardDescription>
            {t('dashboard.student.learnedDescription')}
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
                <TableHead><span className="sr-only">Actions</span></TableHead>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Reschedule Review</DropdownMenuLabel>
                        {reviewOptions.map(opt => (
                            <DropdownMenuItem key={opt.days} onClick={() => handleReschedule(word, opt.days)}>
                                {opt.label}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
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
