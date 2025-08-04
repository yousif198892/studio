
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

export default function MyWordsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "user1";
  const [words, setWords] = useState<Word[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [supervisorId, setSupervisorId] = useState<string | undefined>();
  const { t } = useLanguage();

  useEffect(() => {
    if (userId) {
      const student = getUserById(userId);
      if (student?.supervisorId) {
        setSupervisorId(student.supervisorId);
        const studentWords = getWordsForStudent(userId);
        const learnedWords = studentWords.filter(w => w.strength > 0);
        setWords(learnedWords);
        const supervisorUnits = getUnitsBySupervisor(student.supervisorId);
        setUnits(supervisorUnits);
      }
    }
  }, [userId]);
  
  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : "N/A";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('dashboard.student.learnedTitle')}</h1>
        <p className="text-muted-foreground">{t('wordsPage.description')}</p>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
