export const STUDENT_SESSION_KEY = "guava-campo-student-session-v1";

export type StudentSession = {
  cpf: string;
  dataNascimento: string;
  signedAt: string;
  privacyAcceptedAt?: string;
  privacyPolicyVersion?: string;
};

export function saveStudentSession(session: Omit<StudentSession, "signedAt">) {
  if (typeof window === "undefined") return;

  const value: StudentSession = {
    ...session,
    signedAt: new Date().toISOString(),
  };

  localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(value));
}

export function loadStudentSession(): StudentSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STUDENT_SESSION_KEY);
    return raw ? (JSON.parse(raw) as StudentSession) : null;
  } catch {
    return null;
  }
}

export function clearStudentSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STUDENT_SESSION_KEY);
}
