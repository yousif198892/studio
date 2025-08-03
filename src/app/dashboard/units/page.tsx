
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

export default function UnitsPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") || "sup1";
    const [units, setUnits] = useState<Unit[]>([]);

    useEffect(() => {
        // This now runs only on the client, preventing hydration errors
        if (userId) {
            const supervisorUnits = getUnitsBySupervisor(userId);
            setUnits(supervisorUnits);
        }
    }, [userId]);

    const handleUnitAdded = (newUnit: Unit) => {
      setUnits(prev => {
        const updatedUnits = [...prev, newUnit];
        localStorage.setItem('userUnits', JSON.stringify(updatedUnits.filter(u => u.supervisorId === userId)));
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
            <h1 className="text-3xl font-bold font-headline">My Units</h1>
            <p className="text-muted-foreground">Manage your vocabulary units.</p>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Units</CardTitle>
                            <CardDescription>A list of all your vocabulary units.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Unit Name</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {units.map((unit) => (
                                        <TableRow key={unit.id}>
                                            <TableCell className="font-medium">{unit.name}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the unit "{unit.name}".
                                                            Any words in this unit will need to be reassigned.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(unit.id)}>Continue</AlertDialogAction>
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
                            <CardTitle>Add New Unit</CardTitle>
                             <CardDescription>Create a new unit to categorize your words.</CardDescription>
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
