import type { ComponentType } from "react";
import type { SurveyQuestion, SurveyQuestionType } from "@/types";
import { NpsQuestion } from "./nps-question";
import { StarsQuestion } from "./stars-question";
import { LikertQuestion } from "./likert-question";
import { FreetextQuestion } from "./freetext-question";
import { SingleChoiceQuestion } from "./single-choice-question";
import { YesNoQuestion } from "./yes-no-question";

export type QuestionProps = {
  question: SurveyQuestion;
  value: number | string | boolean | undefined;
  onChange: (value: number | string | boolean) => void;
  color: string;
};

export const QUESTION_COMPONENTS: Record<SurveyQuestionType, ComponentType<QuestionProps>> = {
  nps: NpsQuestion,
  enps: NpsQuestion,
  stars: StarsQuestion,
  likert: LikertQuestion,
  freetext: FreetextQuestion,
  "single-choice": SingleChoiceQuestion,
  "yes-no": YesNoQuestion,
};
