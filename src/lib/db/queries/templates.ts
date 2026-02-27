import { db } from "@/lib/db";
import { surveyTemplates } from "@/lib/db/schema";
import type { NewSurveyTemplate } from "@/lib/db/schema";
import { eq, and, ilike, or, count } from "drizzle-orm";

// ============================================================
// FILTER
// ============================================================

interface TemplatesFilter {
  category?: "customer" | "employee";
  industryCategory?: string;
  industrySubCategory?: string;
  isSystem?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Get templates with search, filter, and pagination.
 */
export async function getTemplates(filter: TemplatesFilter = {}) {
  const { category, industryCategory, industrySubCategory, isSystem, search, page = 1, pageSize = 20 } = filter;

  const conditions = [];

  if (category) {
    conditions.push(eq(surveyTemplates.category, category));
  }
  if (industryCategory) {
    conditions.push(eq(surveyTemplates.industryCategory, industryCategory));
  }
  if (industrySubCategory) {
    conditions.push(eq(surveyTemplates.industrySubCategory, industrySubCategory));
  }
  if (isSystem !== undefined) {
    conditions.push(eq(surveyTemplates.isSystem, isSystem));
  }
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(surveyTemplates.name, pattern),
        ilike(surveyTemplates.description, pattern)
      )!
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ total: count() })
    .from(surveyTemplates)
    .where(where);

  const total = totalResult?.total ?? 0;
  const offset = (page - 1) * pageSize;

  const templates = await db.query.surveyTemplates.findMany({
    where,
    orderBy: [surveyTemplates.sortOrder, surveyTemplates.name],
    limit: pageSize,
    offset,
  });

  return { templates, total, page, pageSize };
}

// ============================================================
// SINGLE
// ============================================================

/**
 * Get a single template by ID.
 */
export async function getTemplateById(id: string) {
  return db.query.surveyTemplates.findFirst({
    where: eq(surveyTemplates.id, id),
  });
}

// ============================================================
// FOR PRACTICE (survey creation)
// ============================================================

/**
 * Get templates matching a practice's industry.
 * Returns templates for the specific sub-category + employee templates.
 */
export async function getTemplatesForPractice(
  industryCategory: string,
  industrySubCategory?: string
) {
  const conditions = [];

  if (industrySubCategory) {
    // Match specific sub-category OR employee templates
    conditions.push(
      or(
        eq(surveyTemplates.industrySubCategory, industrySubCategory),
        eq(surveyTemplates.category, "employee")
      )!
    );
  } else {
    // Match industry category OR employee templates
    conditions.push(
      or(
        eq(surveyTemplates.industryCategory, industryCategory),
        eq(surveyTemplates.category, "employee")
      )!
    );
  }

  return db.query.surveyTemplates.findMany({
    where: and(...conditions),
    orderBy: [surveyTemplates.sortOrder, surveyTemplates.name],
  });
}

// ============================================================
// CRUD (Admin)
// ============================================================

/**
 * Create a new template.
 */
export async function createTemplate(data: NewSurveyTemplate) {
  const [result] = await db
    .insert(surveyTemplates)
    .values(data)
    .returning();
  return result;
}

/**
 * Update an existing template.
 */
export async function updateTemplate(id: string, data: Partial<NewSurveyTemplate>) {
  const [result] = await db
    .update(surveyTemplates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(surveyTemplates.id, id))
    .returning();
  return result;
}

/**
 * Delete a template (only non-system templates).
 */
export async function deleteTemplate(id: string) {
  const template = await getTemplateById(id);
  if (!template) throw new Error("Template nicht gefunden");
  if (template.isSystem) throw new Error("System-Templates können nicht gelöscht werden");

  await db
    .delete(surveyTemplates)
    .where(eq(surveyTemplates.id, id));
}

/**
 * Count all templates (for admin stats).
 */
export async function getTemplateCount() {
  const [result] = await db
    .select({ total: count() })
    .from(surveyTemplates);
  return result?.total ?? 0;
}
