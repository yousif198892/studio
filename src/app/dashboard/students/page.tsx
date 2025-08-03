
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStudentsBySupervisorId, getUserById } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Image from "next/image";
import { useLanguage } from "@/hooks/use-language";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userId = searchParams?.get('userId') as string || "sup1";
  const user = getUserById(userId);
  const students = getStudentsBySupervisorId(userId);
  
  if (!isClient) {
      return <div>{t('dashboard.loading')}</div>
  }

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">{t('studentsPage.title')}</h1>
        <p className="text-muted-foreground">{t('studentsPage.description', user?.name || '')}</p>
        <Card>
            <CardHeader>
                <CardTitle>{t('studentsPage.allStudents.title')}</CardTitle>
                <CardDescription>{t('studentsPage.allStudents.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>{t('dashboard.supervisor.myStudents.name')}</TableHead>
                        <TableHead>{t('dashboard.supervisor.myStudents.email')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="hidden sm:table-cell">
                                    <Image
                                    alt="Student avatar"
                                    className="aspect-square rounded-full object-cover"
                                    height="64"
                                    src={student.avatar}
                                    width="64"
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
