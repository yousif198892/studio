
"use client";

import { useEffect, useState } from "react";
import { getMessages, Message } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const allMessages = getMessages();
    setMessages(allMessages);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Inbox</h1>
      <p className="text-muted-foreground">
        Messages from users requesting supervisor access.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Received Messages</CardTitle>
          <CardDescription>
            Review the requests below and create accounts for approved
            supervisors in the Admins tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="font-medium">{message.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {message.email}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{message.message}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
