"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createTemplate, updateTemplate, deleteTemplate, getTemplateById } from "@/lib/db/queries/templates";
import { templateCreateSchema, templateUpdateSchema } from "@/lib/validations";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
}

function parseJsonField(formData: FormData, key: string): unknown {
  const raw = formData.get(key);
  if (typeof raw !== "string") return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export async function createTemplateAction(formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    industryCategory: formData.get("industryCategory"),
    industrySubCategory: formData.get("industrySubCategory") || undefined,
    respondentType: formData.get("respondentType"),
    category: formData.get("category"),
    questions: parseJsonField(formData, "questions"),
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : undefined,
  };

  const parsed = templateCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ungültige Eingabe" };
  }

  const slug = `custom_${generateSlug(parsed.data.name)}_${Date.now()}`;

  const template = await createTemplate({
    ...parsed.data,
    slug,
    isSystem: false,
  });

  revalidatePath("/admin/templates");
  return { success: true, template };
}

export async function updateTemplateAction(id: string, formData: FormData) {
  await requireAdmin();

  const existing = await getTemplateById(id);
  if (!existing) return { error: "Template nicht gefunden" };
  if (existing.isSystem) return { error: "System-Templates können nicht bearbeitet werden" };

  const raw = {
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    industryCategory: formData.get("industryCategory") || undefined,
    industrySubCategory: formData.get("industrySubCategory") || undefined,
    respondentType: formData.get("respondentType") || undefined,
    category: formData.get("category") || undefined,
    questions: parseJsonField(formData, "questions"),
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : undefined,
  };

  // Remove undefined values so partial update works
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined)
  );

  const parsed = templateUpdateSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ungültige Eingabe" };
  }

  await updateTemplate(id, parsed.data);

  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${id}`);
  return { success: true };
}

export async function deleteTemplateAction(id: string) {
  await requireAdmin();

  try {
    await deleteTemplate(id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Löschen fehlgeschlagen" };
  }

  revalidatePath("/admin/templates");
  return { success: true };
}
