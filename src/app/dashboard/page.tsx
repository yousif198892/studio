import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStudentsBySupervisorId, getWordsForStudent, getUserById, mockUsers } from "@/lib/data";
import { BookOpen, Target, Users, KeyRound } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function Dashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const userId = searchParams?.userId as string || mockUsers[mockUsers.length - 1]?.id || "sup1";
  const user = getUserById(userId);

  if (user?.role === "student") {
    const words = getWordsForStudent(user.id);
    const wordsToReview = words.filter(w => w.nextReview <= new Date()).length;
    const wordsLearned = words.filter(w => w.strength > 0).length;

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Here's a summary of your learning progress. Keep up the great work!</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Words to Review
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wordsToReview}</div>
              <p className="text-xs text-muted-foreground">
                Ready for your next session
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wordsLearned}</div>
              <p className="text-xs text-muted-foreground">
                Total vocabulary words acquired
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user?.role === "supervisor") {
    const students = getStudentsBySupervisorId(user.id);
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Supervisor Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.name}.</p>
            <Card>
                <CardHeader>
                    <CardTitle>Your Supervisor ID</CardTitle>
                    <CardDescription>Share this ID with your students so they can connect with you.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <KeyRound className="h-8 w-8 text-primary"/>
                    <Badge variant="outline" className="text-lg py-2 px-4">{user.id}</Badge>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>My Students</CardTitle>
                    <CardDescription>A list of students under your supervision.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">
                                <span className="sr-only">Image</span>
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
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

  return <div>Loading...</div>
}