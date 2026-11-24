import { learningLanguages, type LearningLanguage } from "../lessons/course";

export default function LearningLanguagePicker({
  language,
  onChange,
}: {
  language: LearningLanguage;
  onChange: (language: LearningLanguage) => void;
}) {
  return (
    <div className="segmented-control" role="group" aria-label="Learning language">
      {(Object.keys(learningLanguages) as LearningLanguage[]).map((value) => (
        <button key={value} type="button" aria-pressed={language === value} onClick={() => onChange(value)}>
          {learningLanguages[value]}
        </button>
      ))}
    </div>
  );
}
