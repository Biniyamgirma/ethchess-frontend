"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentAdminAccess } from "@/lib/api/admin";
import {
  broadcastClubMessage,
  getClubMessageBroadcasts,
  getClubMessageRecipientCount,
} from "@/lib/api/club-messages";

export default function BroadcastMessagePage() {
  const [content, setContent] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const adminAccess = useQuery({
    queryKey: ["current-admin-access"],
    queryFn: getCurrentAdminAccess,
  });
  const canBroadcast = (adminAccess.data?.admin_level ?? 0) > 10;
  const recipients = useQuery({
    queryKey: ["club-message-recipient-count"],
    queryFn: getClubMessageRecipientCount,
    enabled: canBroadcast,
  });
  const broadcasts = useQuery({
    queryKey: ["club-message-broadcasts"],
    queryFn: getClubMessageBroadcasts,
    enabled: canBroadcast,
    refetchInterval: (query) =>
      query.state.data?.some((message) => message.status === "sending")
        ? 3000
        : false,
  });
  const send = useMutation({
    mutationFn: broadcastClubMessage,
    onSuccess: async (result) => {
      setContent("");
      setConfirmOpen(false);
      toast.success(`Message ${result.id} queued for ${result.recipient_count} members.`);
      await queryClient.invalidateQueries({ queryKey: ["club-message-broadcasts"] });
      await queryClient.invalidateQueries({
        queryKey: ["club-message-recipient-count"],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (adminAccess.isPending) return <Skeleton className="h-80" />;
  if (adminAccess.isError) {
    return (
      <p role="alert" className="rounded-xl border border-destructive/40 p-5 text-sm">
        Could not verify broadcast permissions: {adminAccess.error.message}
      </p>
    );
  }
  if (!canBroadcast) {
    return (
      <p role="alert" className="rounded-xl border p-5 text-sm">
        Broadcast messaging is available only to administrators with a role
        level above 10.
      </p>
    );
  }

  const canSubmit = content.trim().length > 0 && content.length <= 4096;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Broadcast Message</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Send a saved message directly to members who have linked Telegram.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose a club message</CardTitle>
          <CardDescription>
            Messages are sent as plain text. Maximum length: 4096 characters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="club-broadcast-content">Message</Label>
          <Textarea
            id="club-broadcast-content"
            value={content}
            maxLength={4096}
            rows={7}
            placeholder="Write an announcement for club members..."
            aria-describedby="club-broadcast-count"
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p id="club-broadcast-count" className="text-xs text-muted-foreground">
              {content.length} / 4096 characters
            </p>
            {recipients.isError ? (
              <p role="alert" className="text-sm text-destructive">
                Could not count Telegram members: {recipients.error.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {recipients.isPending
                  ? "Counting Telegram members..."
                  : `${recipients.data ?? 0} members will receive this message.`}
              </p>
            )}
            <Button
              type="button"
              disabled={
                !canSubmit ||
                recipients.isPending ||
                recipients.isError ||
                send.isPending
              }
              onClick={() => setConfirmOpen(true)}
            >
              Send to all members
            </Button>
          </div>
          {send.isError ? (
            <p role="alert" className="text-sm text-destructive">
              Could not start broadcast: {send.error.message}
            </p>
          ) : null}
          {send.isSuccess ? (
            <p role="status" className="text-sm text-primary">
              Broadcast queued. Delivery progress will appear in history.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-3" aria-labelledby="broadcast-history-title">
        <div>
          <h2
            id="broadcast-history-title"
            className="font-heading text-xl font-bold"
          >
            Broadcast history
          </h2>
          <p className="text-sm text-muted-foreground">
            Delivery totals update when each broadcast finishes.
          </p>
        </div>
        {broadcasts.isPending ? (
          <div className="space-y-3" aria-label="Loading broadcast history">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : null}
        {broadcasts.isError ? (
          <p role="alert" className="rounded-xl border border-destructive/40 p-5 text-sm">
            Could not load broadcast history: {broadcasts.error.message}
          </p>
        ) : null}
        {broadcasts.data?.length === 0 ? (
          <p className="rounded-xl border p-5 text-sm text-muted-foreground">
            No broadcasts have been sent yet.
          </p>
        ) : null}
        {broadcasts.data?.map((message) => (
          <Card key={message.id}>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(message.createdAt), "PPpp")}
                </p>
                <span className="rounded-full border px-2.5 py-1 text-xs font-medium capitalize">
                  {message.status}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <p className="text-xs text-muted-foreground">
                {message.success_count} sent · {message.failure_count} failed ·{" "}
                {message.total_recipients} recipients
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this message to all members?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the message to {recipients.data ?? 0} Telegram
              accounts. The message will be saved and cannot be sent again from
              this broadcast record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={send.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={send.isPending}
              onClick={(event) => {
                event.preventDefault();
                send.mutate(content.trim());
              }}
            >
              {send.isPending ? "Queuing..." : "Confirm send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
