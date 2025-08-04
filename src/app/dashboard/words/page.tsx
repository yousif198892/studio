
"use client"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getWordsBySupervisor, Word, Unit, getUnitsBySupervisor } from "@/lib/data";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function WordsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "sup1";
  const [words, setWords] = useState<Word[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const { t } = useLanguage();

  useEffect(() => {
    const supervisorWords = getWordsBySupervisor(userId);
    setWords(supervisorWords);
    
    const supervisorUnits = getUnitsBySupervisor(userId);
    setUnits(supervisorUnits);
  }, [userId]);

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

  const filteredWords = selectedUnit === 'all' 
    ? words 
    : words.filter(word => word.unitId === selectedUnit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('wordsPage.table.title')}</h1>
          <p className="text-muted-foreground">{t('wordsPage.table.description')}</p>
        </div>
        <Button asChild>
            <Link href={`/dashboard/add-word?userId=${userId}`}>{t('wordsPage.addNew')}</Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="lesson-filter">Unit</Label>
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger id="lesson-filter">
                  <SelectValue placeholder="Filter by unit" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWords.map((word) => (
            <Card key={word.id} className="flex flex-col">
              <CardHeader className="p-0">
                  <div className="aspect-video relative bg-muted rounded-t-lg">
                     <Image
                        src={word.imageUrl}
                        alt={`Image for ${word.word}`}
                        fill
                        className="object-contain rounded-t-lg"
                      />
                  </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <h3 className="text-lg font-bold font-headline">{word.word}</h3>
                <p className="text-sm text-muted-foreground mt-1">{word.definition}</p>
                <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{getUnitName(word.unitId)}</Badge>
                    {word.lesson && <Badge variant="secondary">{word.lesson}</Badge>}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/dashboard/edit-word/${word.id}?userId=${userId}`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
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
                      <AlertDialogAction onClick={() => handleDelete(word.id)}>{t('wordsPage.deleteDialog.continue')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
