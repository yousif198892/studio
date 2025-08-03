
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStudentsBySupervisorId, getUserById, mockUsers } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Image from "next/image";

export default function StudentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const userId = searchParams?.userId as string || "sup1";
  const user = getUserById(userId);
  const students = getStudentsBySupervisorId(userId);

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">طلابي</h1>
        <p className="text-muted-foreground">مرحبًا، {user?.name}. إليك طلابك.</p>
        <Card>
            <CardHeader>
                <CardTitle>جميع الطلاب</CardTitle>
                <CardDescription>قائمة الطلاب تحت إشرافك.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">صورة</span>
                        </TableHead>
                        <TableHead>الاسم</TableHead>
                        <TableHead>البريد الإلكتروني</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="hidden sm:table-cell">
                                    <Image
                                    alt="الصورة الرمزية للطالب"
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
