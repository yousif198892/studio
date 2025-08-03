
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

export default function WordsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "sup1";
  const [words, setWords] = useState<Word[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    // This code now runs only on the client, preventing hydration errors
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


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">كلماتي</h1>
          <p className="text-muted-foreground">إدارة قائمة المفردات الخاصة بك.</p>
        </div>
        <Button asChild>
            <Link href={`/dashboard/add-word?userId=${userId}`}>إضافة كلمة جديدة</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المفردات</CardTitle>
          <CardDescription>
            قائمة كاملة بجميع الكلمات التي أضفتها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  صورة
                </TableHead>
                <TableHead>الكلمة</TableHead>
                <TableHead>التعريف</TableHead>
                <TableHead>الوحدة</TableHead>
                <TableHead>
                  <span className="sr-only">الإجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {words.map((word) => (
                <TableRow key={word.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="صورة الكلمة"
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
                              <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف الكلمة بشكل دائم
                                "{word.word}" من قائمتك.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(word.id)}>متابعة</AlertDialogAction>
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
