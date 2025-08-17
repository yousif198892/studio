import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function AboutPage() {
    const appVersion = "0.1.0"; // Static version

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">About LinguaLeap</h1>
            <p className="text-muted-foreground">
                The people and technology behind your learning experience.
            </p>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                        <Logo className="w-10 h-10 text-primary" />
                        <span>LinguaLeap</span>
                    </CardTitle>
                    <CardDescription>
                        Hello!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-base leading-relaxed">
                    <p>
                       I am Yousif, an English teacher passionate about leveraging technology to make language learning more accessible and effective. This application is a product of that passion, designed to be a tool I can use with my own students.
                    </p>
                    <p>
                       To bring this vision to life, I collaborated with Gemini, a large-scale AI from Google. Gemini handled the application development, from coding the interface to integrating the smart features that power the quizzes and learning systems.
                    </p>
                     <p className="text-sm text-muted-foreground pt-4 border-t">
                       Remember you can always message us if you have any suggestions or reporting a bug from the sign-up page.
                    </p>
                    <div className="pt-4 border-t">
                        <p className="text-muted-foreground">With regards,</p>
                        <p className="font-headline text-xl">Yousif</p>
                    </div>
                </CardContent>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        App Version: {appVersion}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}