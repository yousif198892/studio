import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const timezones = [
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Madrid",
    "Asia/Tokyo",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">ملفي الشخصي</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الشخصية</CardTitle>
            <CardDescription>
              قم بتحديث تفاصيلك الشخصية هنا.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://placehold.co/100x100.png" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
              <div className="grid gap-1.5">
                <Label htmlFor="picture">الصورة الشخصية</Label>
                <Input id="picture" type="file" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" defaultValue="Alex Johnson" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" defaultValue="alex@example.com" disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button>حفظ التغييرات</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>التفضيلات</CardTitle>
            <CardDescription>
              خصص تجربتك التعليمية.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">المنطقة الزمنية</Label>
              <Select defaultValue="America/New_York">
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنطقة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">حجم الخط</Label>
              <Select defaultValue="base">
                <SelectTrigger>
                  <SelectValue placeholder="اختر حجم الخط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">صغير</SelectItem>
                  <SelectItem value="base">افتراضي</SelectItem>
                  <SelectItem value="lg">كبير</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button>حفظ التفضيلات</Button>
          </CardFooter>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>إدارة الحساب</CardTitle>
            <CardDescription>
              قم بإدارة إعدادات حسابك وبياناتك.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">إعادة تعيين كلمة المرور</h3>
              <p className="text-sm text-muted-foreground">
                سيتم إرسال بريد إلكتروني إليك يحتوي على تعليمات لإعادة تعيين كلمة المرور الخاصة بك.
              </p>
            </div>
             <div>
              <h3 className="font-semibold text-destructive">حذف الحساب</h3>
              <p className="text-sm text-muted-foreground">
                حذف حسابك وجميع البيانات المرتبطة به بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">إعادة تعيين كلمة المرور</Button>
            <Button variant="destructive">حذف حسابي</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
