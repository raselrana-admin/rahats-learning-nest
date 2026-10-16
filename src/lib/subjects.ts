export const SUBJECTS = [
  { id: "math", label: "Math", icon: "➗" },
  { id: "english", label: "English", icon: "🔤" },
  { id: "bangla", label: "Bangla", icon: "অ" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "coding", label: "Coding", icon: "💻" },
  { id: "gk", label: "General knowledge", icon: "🌍" },
  { id: "other", label: "Other", icon: "📌" },
] as const;

export type SubjectId = (typeof SUBJECTS)[number]["id"];

export const SUBJECT_IDS = SUBJECTS.map((s) => s.id) as SubjectId[];

export function getSubject(id: string) {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[SUBJECTS.length - 1];
}

export type LearningLink = {
  id: string;
  url: string;
  title: string;
  subject: SubjectId;
  note: string | null;
  learned: boolean;
  created_at: string;
};

export const LIMITS = { url: 2000, title: 120, note: 300 } as const;
