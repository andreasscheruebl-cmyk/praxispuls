"use client";

import { useState, useRef } from "react";
import { getOnboardingTemplates } from "@/actions/templates";
import { getSubCategory } from "@/lib/industries";
import { getTerminology } from "@/lib/terminology";
import type { OnboardingTemplate, IndustryCategory, IndustrySubCategory, IndustrySelection } from "@/types";

const STEP_TITLES: Record<1 | 2 | 3, string> = {
  1: "Branche wählen",
  2: "Einrichtung benennen",
  3: "Umfrage-Template",
};

export function useLocationSetup() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [industry, setIndustry] = useState<IndustrySelection | null>(null);
  const [name, setName] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const submittingRef = useRef(false);
  const templateRequestCounter = useRef(0);

  // Terminology derived from selected sub-category
  const sub = industry ? getSubCategory(industry.subCategory) : null;
  const terminology = sub ? getTerminology(sub.defaultRespondentType) : null;
  const stepTitle = STEP_TITLES[step];

  async function loadTemplates(category: IndustryCategory, subCategory: IndustrySubCategory) {
    const requestId = ++templateRequestCounter.current;
    setTemplatesLoading(true);
    try {
      const result = await getOnboardingTemplates(category, subCategory);
      if (requestId !== templateRequestCounter.current) return; // stale response
      if ("error" in result) {
        console.error("[loadTemplates]", result.error);
        setError(result.error ?? "Unbekannter Fehler");
        setTemplates([]);
      } else {
        setTemplates(result.templates);
        if (result.templates.length > 0) {
          setTemplateId(result.templates[0]!.id);
        }
      }
    } catch (err) {
      if (requestId !== templateRequestCounter.current) return; // stale response
      console.error("[loadTemplates]", err);
      setError("Templates konnten nicht geladen werden");
      setTemplates([]);
    } finally {
      if (requestId === templateRequestCounter.current) {
        setTemplatesLoading(false);
      }
    }
  }

  function handleIndustryChange(selection: IndustrySelection) {
    setIndustry(selection);
    setTemplateId(null);
    setError(null);
    // loadTemplates handles errors internally via try-catch + setError
    void loadTemplates(selection.category, selection.subCategory);
  }

  async function handleComplete(onSuccess: () => void) {
    if (loading || submittingRef.current) return;
    submittingRef.current = true;
    if (!industry || !templateId || name.trim().length < 2) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.");
      submittingRef.current = false;
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industryCategory: industry.category,
          industrySubCategory: industry.subCategory,
          googlePlaceId: googlePlaceId || undefined,
          templateId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Fehler beim Einrichten. Bitte versuchen Sie es erneut.");
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("[handleComplete] submit failed:", err);
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }

  function resetForm() {
    setStep(1);
    setIndustry(null);
    setName("");
    setGooglePlaceId("");
    setTemplateId(null);
    setTemplates([]);
    setError(null);
    setLoading(false);
    setTemplatesLoading(false);
  }

  return {
    step,
    setStep,
    loading,
    templatesLoading,
    error,
    industry,
    name,
    setName,
    googlePlaceId,
    setGooglePlaceId,
    templateId,
    setTemplateId,
    templates,
    terminology,
    stepTitle,
    handleIndustryChange,
    handleComplete,
    resetForm,
  };
}
