
"use client"
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


export default function WordsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('wordsPage.title')}</h1>
          <p className="text-muted-foreground">{t('wordsPage.description')} </p>
        </div>
        <Button asChild>
            <Link href={`/dashboard/add-word?userId=${userId}`}>{t('wordsPage.addNew')}</Link>
        </Button>
      </div>

      <div className="text-center text-muted-foreground py-12">
        <p>You have not added any words yet.</p>
      </div>
    </div>
  );
}
