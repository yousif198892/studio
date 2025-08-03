import { AddWordForm } from "@/components/add-word-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AddWordPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Add New Word</h1>
      <p className="text-muted-foreground">
        Create a new vocabulary card for your students. The AI will generate distractor options automatically.
      </p>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Vocabulary Card</CardTitle>
          <CardDescription>
            Fill in the details for the new word.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddWordForm />
        </CardContent>
      </Card>
    </div>
  );
}
