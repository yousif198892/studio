

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
import { Upload } from "@/components/ui/upload";
import { useLanguage } from "@/hooks/use-language";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Word, getAllUsers, getUserById, updateUserDB, deleteUserDB, getWordsBySupervisorDB, deleteWordDB } from "@/lib/data";
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
import { setHeroImage } from "@/lib/db";
import { cn } from "@/lib/utils";


export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [supervisor, setSupervisor] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [heroPreviewImage, setHeroPreviewImage] = useState<string | null>(null);
  const [isScaled, setIsScaled] = useState(false);

  // State for preferences
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedTimezone, setSelectedTimezone] = useState<string | undefined>();


  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId) {
      const fetchUser = async () => {
        const foundUser = await getUserById(userId);
        setUser(foundUser || null);
        if (foundUser) {
            setName(foundUser.name);
            setSelectedTimezone(foundUser.timezone);
            if (foundUser.role === 'student' && foundUser.supervisorId) {
              const foundSupervisor = await getUserById(foundUser.supervisorId);
              setSupervisor(foundSupervisor || null);
            }
        }
      }
      fetchUser();
    }
  }, [searchParams]);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);
  

  const timezones = [
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Madrid",
    "Asia/Tokyo",
  ];

  const handleLanguageChange = (value: "en" | "ar") => {
    setLanguage(value);
    setSelectedLanguage(value);
  };
  
  const handleSaveChanges = async () => {
      if (!user) return;
      
      const updatedUser: User = { ...user, name };
      await updateUserDB(updatedUser);
      setUser(updatedUser);

      toast({
        title: t('toasts.success'),
        description: "Personal information saved!",
      });
      
      window.dispatchEvent(new Event('storage'));
  }
  
  const handleSavePreferences = async () => {
      if (!user) return;
      
      const updatedUser: User = {
          ...user,
          timezone: selectedTimezone,
      };

      await updateUserDB(updatedUser);
      setUser(updatedUser);
      
      toast({
        title: t('toasts.success'),
        description: "Preferences saved!",
      });
      
      if (selectedLanguage) setLanguage(selectedLanguage);
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

  const handleHeroPictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
          const img = document.createElement("img");
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setHeroPreviewImage(dataUrl);
              }
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };


  const handlePictureUpload = async () => {
    if (!user || !previewImage) return;
    
    const updatedUser = { ...user, avatar: previewImage };
    await updateUserDB(updatedUser);
    setUser(updatedUser);
    setPreviewImage(null);

    toast({
        title: t('toasts.success'),
        description: "Profile picture updated successfully!",
      });

    // Manually trigger the storage event to update the layout
    window.dispatchEvent(new Event('storage'));
  }

  const handleHeroPictureUpload = async () => {
    if (!heroPreviewImage) {
        toast({
            title: "Error",
            description: "No image selected to upload.",
            variant: "destructive",
        });
        return;
    }
    
    try {
      await setHeroImage(heroPreviewImage);
      toast({
        title: "Success!",
        description: "Landing page hero image has been updated."
      });
      setHeroPreviewImage(null);
    } catch (error) {
        console.error("Failed to save hero image:", error);
        toast({
            title: "An Unknown Error Occurred",
            description: "Could not save the image. Please try again or check the browser console for details.",
            variant: "destructive",
        });
    }
  };

  const handleResetPassword = () => {
    toast({
        title: "Password Reset",
        description: "In a real application, an email would be sent to you with instructions to reset your password.",
    });
  }

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
        await deleteUserDB(user.id);
        
        if (user.role === 'supervisor') {
            const supervisorWords = await getWordsBySupervisorDB(user.id);
            for (const word of supervisorWords) {
                await deleteWordDB(word.id);
            }
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
      <style jsx>{`
        .profile-picture {
          width: 128px;
          height: 128px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: hsl(var(--muted));
        }

        .profile-picture img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(0.6);
          transition: transform 0.3s ease;
        }
        
        .profile-picture img.scaled {
           transform: scale(1.5);
        }
      `}</style>
      <h1 className="text-3xl font-bold font-headline">{t('profile.title')}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('profile.personalInfo.picture')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="profile-picture">
                        <img 
                          id="preview"
                          src={previewImage || user.avatar} 
                          alt="Profile Picture" 
                          className={cn(isScaled && "scaled")}
                        />
                    </div>
                     <Button variant="outline" onClick={() => setIsScaled(!isScaled)}>
                        {isScaled ? "Shrink" : "Enlarge"}
                     </Button>
                    <Input id="picture" type="file" accept="image/*" onChange={handlePictureChange} className="max-w-xs" />
                </CardContent>
                <CardFooter>
                    <Button onClick={handlePictureUpload} disabled={!previewImage} className="w-full">Upload Picture</Button>
                </CardFooter>
            </Card>

            {user.isMainAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Landing Page</CardTitle>
                  <CardDescription>Update the main hero image.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  {heroPreviewImage ? (
                    <img src={heroPreviewImage} alt="Hero preview" className="rounded-md object-cover w-full h-auto" />
                  ) : (
                    <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                      <Upload className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <Input id="hero-picture" type="file" accept="image/*" onChange={handleHeroPictureChange} className="max-w-xs" />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleHeroPictureUpload} disabled={!heroPreviewImage} className="w-full">Upload Hero Image</Button>
                </CardFooter>
              </Card>
            )}

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
               <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
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
              <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
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
