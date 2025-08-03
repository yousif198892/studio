
"use client";

import { AddWordForm } from "@/components/add-word-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

export default function AddWordPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{t('addWord.title')}</h1>
      <p className="text-muted-foreground">
        {t('addWord.description')}
      </p>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('addWord.cardTitle')}</CardTitle>
          <CardDescription>
            {t('addWord.cardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddWordForm />
        </CardContent>
      </Card>
    </div>
  );
}
