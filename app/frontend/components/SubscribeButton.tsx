import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/design-system/components/ui/button";

/** Subscribe to a work's updates (logged-in only). Hidden for guests. */
export default function SubscribeButton({ workId }: { workId: number }) {
  const currentUser = (usePage().props as { currentUser?: { login: string } | null }).currentUser;
  const [busy, setBusy] = useState(false);
  if (!currentUser) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        router.post(
          `/users/${currentUser.login}/subscriptions`,
          { subscription: { subscribable_id: workId, subscribable_type: "Work" } },
          { preserveScroll: true, onFinish: () => setBusy(false) },
        );
      }}
    >
      + Subscribe
    </Button>
  );
}
