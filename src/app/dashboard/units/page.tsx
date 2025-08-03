
"use client";

import { AddUnitForm } from "@/components/add-unit-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUnitsBySupervisor, Unit } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { useLanguage } from "@/hooks/use-language";

export default function UnitsPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") || "sup1";
    const [units, setUnits] = useState<Unit[]>([]);
    const { t } = useLanguage();

    useEffect(() => {
        if (userId) {
            const supervisorUnits = getUnitsBySupervisor(userId);
            setUnits(supervisorUnits);
        }
    }, [userId]);

    const handleUnitAdded = (newUnit: Unit) => {
      setUnits(prev => {
        const updatedUnits = [...prev, newUnit];
        // In a real app, supervisorId would be part of the newUnit object from the server
        const storedUnits = JSON.parse(localStorage.getItem('userUnits') || '[]').filter((u: Unit) => u.supervisorId === userId);
        localStorage.setItem('userUnits', JSON.stringify([...storedUnits, newUnit]));
        return updatedUnits;
      });
    };

    const handleDelete = (unitId: string) => {
        // Prevent deleting units if words are associated with it in a real app
        const updatedUnits = units.filter(u => u.id !== unitId);
        setUnits(updatedUnits);

        const storedUnits: Unit[] = JSON.parse(localStorage.getItem('userUnits') || '[]');
        const updatedStoredUnits = storedUnits.filter(u => u.id !== unitId);
        localStorage.setItem('userUnits', JSON.stringify(updatedStoredUnits));
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{t('unitsPage.title')}</h1>
            <p className="text-muted-foreground">{t('unitsPage.description')}</p>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('unitsPage.allUnits.title')}</CardTitle>
                            <CardDescription>{t('unitsPage.allUnits.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('unitsPage.allUnits.name')}</TableHead>
                                        <TableHead><span className="sr-only">{t('unitsPage.allUnits.actions')}</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {units.map((unit) => (
                                        <TableRow key={unit.id}>
                                            <TableCell className="font-medium">{unit.name}</TableCell>
                                            <TableCell className="text-end">
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
                                                           {t('unitsPage.deleteDialog.description', unit.name)}
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('wordsPage.deleteDialog.cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(unit.id)}>{t('wordsPage.deleteDialog.continue')}</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('unitsPage.addUnit.title')}</CardTitle>
                             <CardDescription>{t('unitsPage.addUnit.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AddUnitForm onUnitAdded={handleUnitAdded} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
