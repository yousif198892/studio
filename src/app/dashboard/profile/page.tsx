
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Word } from "@/lib/data";
import { getUserByIdFromClient } from "@/lib/client-data";
import { useToast } from "@/hooks/use-toast";
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

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [supervisor, setSupervisor] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId) {
      const foundUser = getUserByIdFromClient(userId);
      setUser(foundUser || null);
      if (foundUser) {
          setName(foundUser.name);
          if (foundUser.role === 'student' && foundUser.supervisorId) {
            const foundSupervisor = getUserByIdFromClient(foundUser.supervisorId);
            setSupervisor(foundSupervisor || null);
          }
      }
    }
  }, [searchParams]);

  const timezones = [
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Madrid",
    "Asia/Tokyo",
  ];

  const handleLanguageChange = (value: "en" | "ar") => {
    setLanguage(value);
  };
  
  const handleSaveChanges = () => {
      if (!user) return;
      
      const updatedUser = { ...user, name };
      
      const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = allUsers.findIndex((u:User) => u.id === user.id);
      
      if (userIndex > -1) {
        allUsers[userIndex] = { ...allUsers[userIndex], ...updatedUser };
      } else {
        // This handles updates for mock users who aren't in the 'users' list initially
        const mockUserIndex = allUsers.findIndex(u => u.id === user.id);
        if (mockUserIndex === -1) {
             allUsers.push(updatedUser);
        }
      }
      localStorage.setItem('users', JSON.stringify(allUsers));
      setUser(updatedUser);

      toast({
        title: t('toasts.success'),
        description: "Personal information saved!",
      });
  }
  
  const handleSavePreferences = () => {
       // In a real app, this would call a server action to update the user data.
      toast({
        title: t('toasts.success'),
        description: "Preferences saved!",
      });
  }

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePictureUpload = () => {
    if (!user || !previewImage) return;

    const updatedUser = { ...user, avatar: previewImage };
    
    // Read the latest user list from localStorage
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = allUsers.findIndex((u: User) => u.id === user.id);

    // Update the user in the list
    if (userIndex > -1) {
      allUsers[userIndex] = updatedUser;
    } else {
      // If user not in the list (e.g. a mock user), add them
      allUsers.push(updatedUser);
    }
    
    // Save the updated list back to localStorage
    localStorage.setItem('users', JSON.stringify(allUsers));
    
    // Update the state for immediate UI feedback
    setUser(updatedUser);
    setPreviewImage(null); // Clear the preview

    toast({
        title: t('toasts.success'),
        description: "Profile picture updated successfully!",
      });
  }

  const handleResetPassword = () => {
    toast({
        title: "Password Reset",
        description: "In a real application, an email would be sent to you with instructions to reset your password.",
    });
  }

  const handleDeleteAccount = () => {
    if (!user) return;
    
    try {
        // Remove from 'users' in localStorage
        let users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        users = users.filter(u => u.id !== user.id);
        localStorage.setItem("users", JSON.stringify(users));
        
        // If supervisor, delete their words.
        if (user.role === 'supervisor') {
            let allWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
            allWords = allWords.filter(w => w.supervisorId !== user.id);
            localStorage.setItem('userWords', JSON.stringify(allWords));
        }

        toast({
            title: "Account Deleted",
            description: "Your account has been permanently deleted.",
        });

        router.push("/login");

    } catch (error) {
         toast({
            title: "Error",
            description: "Could not delete your account. Please try again.",
            variant: "destructive"
        });
    }
  }

  if (!user) {
    return <div>{t('dashboard.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{t('profile.title')}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('profile.personalInfo.picture')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     <Avatar className="h-32 w-32">
                        <AvatarImage src={previewImage || user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Input id="picture" type="file" accept="image/*" onChange={handlePictureChange} className="max-w-xs" />
                </CardContent>
                <CardFooter>
                    <Button onClick={handlePictureUpload} disabled={!previewImage} className="w-full">Upload Picture</Button>
                </CardFooter>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>{t('profile.personalInfo.title')}</CardTitle>
                <CardDescription>
                {t('profile.personalInfo.description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="name">{t('profile.personalInfo.fullName')}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="email">{t('profile.personalInfo.email')}</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
                </div>
                {user.role === 'student' && supervisor && (
                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor</Label>
                    <Input id="supervisor" value={supervisor.name} disabled />
                  </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveChanges}>{t('profile.personalInfo.save')}</Button>
            </CardFooter>
            </Card>
        </div>
        <Card className="md:col-span-2 lg:col-span-3">
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
              <Select defaultValue={user.timezone}>
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
              <Select defaultValue={user.fontSize}>
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
            <Button onClick={handleSavePreferences}>{t('profile.preferences.save')}</Button>
          </CardFooter>
        </Card>
        <Card className="md:col-span-2 lg:col-span-3">
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
            <Button variant="outline" onClick={handleResetPassword}>{t('profile.account.resetPassword.button')}</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">{t('profile.account.deleteAccount.button')}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
