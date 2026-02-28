"use client";

import { useState } from "react";
import {
  HeartPulse,
  Wrench,
  Sparkles,
  UtensilsCrossed,
  Dumbbell,
  Store,
  GraduationCap,
  Users,
  Scale,
  Puzzle,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { INDUSTRY_CATEGORIES, needsSecondLayer } from "@/lib/industries";
import type { IndustryCategory, IndustrySubCategory, IndustrySelection } from "@/types";

// ============================================================
// Icon mapping
// ============================================================

const CATEGORY_ICONS: Record<IndustryCategory, LucideIcon> = {
  gesundheit: HeartPulse,
  handwerk: Wrench,
  beauty: Sparkles,
  gastronomie: UtensilsCrossed,
  fitness: Dumbbell,
  einzelhandel: Store,
  bildung: GraduationCap,
  vereine: Users,
  beratung: Scale,
  individuell: Puzzle,
};

// ============================================================
// Props
// ============================================================

type IndustryPickerProps = {
  value: IndustrySelection | null;
  onChange: (selection: IndustrySelection) => void;
};

// ============================================================
// Component
// ============================================================

export function IndustryPicker({ value, onChange }: IndustryPickerProps) {
  const [expandedCategory, setExpandedCategory] = useState<IndustryCategory | null>(null);

  function handleCategoryClick(categoryId: IndustryCategory) {
    const category = INDUSTRY_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return;

    if (category.subCategories.length === 1) {
      // Single sub-category → select immediately
      onChange({
        category: categoryId,
        subCategory: category.subCategories[0]!.id,
      });
      setExpandedCategory(null);
      return;
    }

    if (needsSecondLayer(categoryId)) {
      // 3+ subs → show layer 2
      setExpandedCategory(categoryId);
    } else {
      // ≤2 subs → toggle inline expansion
      setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
    }
  }

  function handleSubCategoryClick(categoryId: IndustryCategory, subId: IndustrySubCategory) {
    onChange({ category: categoryId, subCategory: subId });
    setExpandedCategory(null);
  }

  // Layer 2: dedicated sub-category view for categories with 3+ subs
  const expandedCategoryData = expandedCategory
    ? INDUSTRY_CATEGORIES.find((c) => c.id === expandedCategory)
    : null;

  if (expandedCategoryData && needsSecondLayer(expandedCategory!)) {
    const Icon = CATEGORY_ICONS[expandedCategory!];
    return (
      <div className="space-y-4">
        <button
          onClick={() => setExpandedCategory(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{expandedCategoryData.label}</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {expandedCategoryData.subCategories.map((sub) => {
            const isSelected =
              value?.category === expandedCategory && value?.subCategory === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubCategoryClick(expandedCategory!, sub.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <p className="text-sm font-medium">{sub.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Layer 1: category grid
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {INDUSTRY_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          const isSelected = value?.category === cat.id;
          const isExpanded = expandedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : isExpanded
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
              }`}
            >
              <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inline sub-category picker for categories with ≤2 subs */}
      {expandedCategory && expandedCategoryData && !needsSecondLayer(expandedCategory) && (
        <div className="flex gap-2">
          {expandedCategoryData.subCategories.map((sub) => {
            const isSelected =
              value?.category === expandedCategory && value?.subCategory === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubCategoryClick(expandedCategory, sub.id)}
                className={`flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
