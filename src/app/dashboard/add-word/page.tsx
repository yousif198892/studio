import { AddWordForm } from "@/components/add-word-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

export default function AddWordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const userId = searchParams?.userId;
  if (!userId) {
    redirect("/login");
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">إضافة كلمة جديدة</h1>
      <p className="text-muted-foreground">
        أنشئ بطاقة مفردات جديدة لطلابك. سيقوم الذكاء الاصطناعي بإنشاء خيارات مضللة تلقائيًا.
      </p>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>بطاقة مفردات جديدة</CardTitle>
          <CardDescription>
            املأ تفاصيل الكلمة الجديدة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddWordForm />
        </CardContent>
      </Card>
    </div>
  );
}
