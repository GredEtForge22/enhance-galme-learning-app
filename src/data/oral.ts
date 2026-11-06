export type OralExercise = {
  id: string;
  title: string;
  audioSrc: string;
  prompt: string;
  options: string[];
  answer: string;
  transcript?: string;
};

export const ORAL_EXERCISES: OralExercise[] = [
  {
    id: "se-presenter-01",
    title: "Se présenter",
    audioSrc: "/audio/galme/se-presenter-01.mp3",
    prompt: "Comment s'appelle la personne ?",
    options: [
      "Sacha",
      "Léa",
      "Noé",
      "La personne ne dit pas son prénom",
    ],
    answer: "Sacha",
    transcript: "zhoyama, ena kala Sacha",
  },
];
