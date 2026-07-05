import { router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/design-system/components/ui/button";

/** Posts a kudo for a work via Inertia; the redirect re-renders with the new count. */
export default function KudosButton({ workId }: { workId: number }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="default"
      size="sm"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        router.post("/kudos", { kudo: { commentable_id: workId, commentable_type: "Work" } }, {
          preserveScroll: true,
          onFinish: () => setBusy(false),
        });
      }}
    >
      ♥ Give Kudos
    </Button>
  );
}
