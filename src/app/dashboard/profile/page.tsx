"use client";

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
import { useLanguage } from "@/hooks/use-language";

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const timezones = [
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Madrid",
    "Asia/Tokyo",
  ];

  const handleLanguageChange = (value: "en" | "ar") => {
    setLanguage(value);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{t('profile.title')}</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personalInfo.title')}</CardTitle>
            <CardDescription>
              {t('profile.personalInfo.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://placehold.co/100x100.png" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
              <div className="grid gap-1.5">
                <Label htmlFor="picture">{t('profile.personalInfo.picture')}</Label>
                <Input id="picture" type="file" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t('profile.personalInfo.fullName')}</Label>
              <Input id="name" defaultValue="Alex Johnson" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.personalInfo.email')}</Label>
              <Input id="email" type="email" defaultValue="alex@example.com" disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button>{t('profile.personalInfo.save')}</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.preferences.title')}</CardTitle>
            <CardDescription>
              {t('profile.preferences.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t('profile.preferences.language')}</Label>
               <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('profile.preferences.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t('profile.preferences.timezone')}</Label>
              <Select defaultValue="America/New_York">
                <SelectTrigger>
                  <SelectValue placeholder={t('profile.preferences.selectTimezone')} />
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
              <Label htmlFor="font-size">{t('profile.preferences.fontSize')}</Label>
              <Select defaultValue="base">
                <SelectTrigger>
                  <SelectValue placeholder={t('profile.preferences.selectFontSize')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">{t('profile.preferences.fontSmall')}</SelectItem>
                  <SelectItem value="base">{t('profile.preferences.fontDefault')}</SelectItem>
                  <SelectItem value="lg">{t('profile.preferences.fontLarge')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button>{t('profile.preferences.save')}</Button>
          </CardFooter>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('profile.account.title')}</CardTitle>
            <CardDescription>
              {t('profile.account.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">{t('profile.account.resetPassword.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('profile.account.resetPassword.description')}
              </p>
            </div>
             <div>
              <h3 className="font-semibold text-destructive">{t('profile.account.deleteAccount.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('profile.account.deleteAccount.description')}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">{t('profile.account.resetPassword.button')}</Button>
            <Button variant="destructive">{t('profile.account.deleteAccount.button')}</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
