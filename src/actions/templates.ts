"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireAuthForAction } from "@/lib/auth";
import { createTemplate, updateTemplate, deleteTemplate, getTemplateById, getTemplatesForPractice } from "@/lib/db/queries/templates";
import { templateCreateSchema, templateUpdateSchema, INDUSTRY_CATEGORY_IDS, INDUSTRY_SUB_CATEGORY_IDS } from "@/lib/validations";
import type { OnboardingTemplate, IndustryCategory, IndustrySubCategory } from "@/types";

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
  return JSON.parse(raw);
}

export async function createTemplateAction(formData: FormData) {
  await requireAdmin();

  try {
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
      return { error: parsed.error.errors[0]?.message ?? "Ungültige Eingabe", code: "VALIDATION_ERROR" };
    }

    const slug = `custom_${generateSlug(parsed.data.name)}_${Date.now()}`;

    const template = await createTemplate({
      ...parsed.data,
      slug,
      isSystem: false,
    });

    revalidatePath("/admin/templates");
    return { success: true, template };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { error: "Ungültige JSON-Daten in Fragen", code: "VALIDATION_ERROR" };
    }
    console.error("[createTemplateAction]", error);
    return { error: "Template konnte nicht erstellt werden", code: "INTERNAL_ERROR" };
  }
}

export async function updateTemplateAction(id: string, formData: FormData) {
  await requireAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    return { error: "Ungültige Template-ID", code: "BAD_REQUEST" };
  }

  const existing = await getTemplateById(id);
  if (!existing) return { error: "Template nicht gefunden", code: "NOT_FOUND" };
  if (existing.isSystem) return { error: "System-Templates können nicht bearbeitet werden", code: "FORBIDDEN" };

  try {
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

    // Strip undefined values so partial update works
    const cleaned = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined)
    );

    const parsed = templateUpdateSchema.safeParse(cleaned);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Ungültige Eingabe", code: "VALIDATION_ERROR" };
    }

    await updateTemplate(id, parsed.data);

    revalidatePath("/admin/templates");
    revalidatePath(`/admin/templates/${id}`);
    return { success: true };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { error: "Ungültige JSON-Daten in Fragen", code: "VALIDATION_ERROR" };
    }
    console.error("[updateTemplateAction]", error);
    return { error: "Aktualisierung fehlgeschlagen", code: "INTERNAL_ERROR" };
  }
}

export async function deleteTemplateAction(id: string) {
  await requireAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    return { error: "Ungültige Template-ID", code: "BAD_REQUEST" };
  }

  try {
    await deleteTemplate(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("nicht gefunden")) {
      return { error: message, code: "NOT_FOUND" };
    }
    if (message.includes("System-Template")) {
      return { error: message, code: "FORBIDDEN" };
    }
    console.error("[deleteTemplateAction]", error);
    return { error: "Löschen fehlgeschlagen", code: "INTERNAL_ERROR" };
  }

  revalidatePath("/admin/templates");
  return { success: true };
}

// ============================================================
// ONBOARDING (authenticated, non-admin)
// ============================================================

const onboardingFilterSchema = z.object({
  industryCategory: z.enum(INDUSTRY_CATEGORY_IDS),
  industrySubCategory: z.enum(INDUSTRY_SUB_CATEGORY_IDS).optional(),
});

export async function getOnboardingTemplates(
  industryCategory: IndustryCategory,
  industrySubCategory?: IndustrySubCategory,
) {
  const auth = await requireAuthForAction();
  if (auth.error) {
    return { error: auth.error, code: auth.code };
  }

  const parsed = onboardingFilterSchema.safeParse({ industryCategory, industrySubCategory });
  if (!parsed.success) {
    return { error: "Ungültige Branche", code: "VALIDATION_ERROR" };
  }

  try {
    const templates = await getTemplatesForPractice(
      parsed.data.industryCategory,
      parsed.data.industrySubCategory,
    );

    const customerTemplates: OnboardingTemplate[] = templates
      .filter((t) => t.category === "customer")
      .map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        questionCount: Array.isArray(t.questions) ? t.questions.length : 0,
      }));

    return { templates: customerTemplates };
  } catch (error) {
    console.error("[getOnboardingTemplates]", error);
    return { error: "Templates konnten nicht geladen werden", code: "INTERNAL_ERROR" };
  }
}
