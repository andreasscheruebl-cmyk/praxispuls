"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteTemplateAction } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function TemplateDeleteButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Template wirklich löschen? Dies kann nicht rückgängig gemacht werden.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteTemplateAction(templateId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Template gelöscht");
        router.push("/admin/templates");
      }
    });
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="mr-1 h-4 w-4" />
      {isPending ? "Lösche..." : "Löschen"}
    </Button>
  );
}
