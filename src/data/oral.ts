export type OralExercise = {
  id: string;
  title: string;
  audio: string;
  transcript: string;
  questions: {
    prompt: string;
    options: string[];
    answer: number;
  }[];
};
