export interface Student {
  id: string;
  name: string;
  initial: string;
  avatarColor: string;
  level: string;
}

export const STUDENTS: Student[] = [
  { id: "s1", name: "山田 花子", initial: "山", avatarColor: "hsl(25, 90%, 55%)", level: "初級" },
  { id: "s2", name: "佐々木 翔", initial: "佐", avatarColor: "hsl(140, 60%, 42%)", level: "中級" },
  { id: "s3", name: "高橋 健一", initial: "高", avatarColor: "hsl(270, 60%, 55%)", level: "上級" },
  { id: "s4", name: "中村 美咲", initial: "中", avatarColor: "hsl(0, 70%, 55%)", level: "初級" },
  { id: "s5", name: "小林 大輔", initial: "小", avatarColor: "hsl(200, 70%, 50%)", level: "中級" },
  { id: "s6", name: "渡辺 優子", initial: "渡", avatarColor: "hsl(320, 60%, 50%)", level: "初級" },
];

export const getStudentById = (id: string): Student | undefined =>
  STUDENTS.find((s) => s.id === id);

export const getStudentByName = (name: string): Student | undefined =>
  STUDENTS.find((s) => s.name === name || s.name.replace(" ", "") === name);
