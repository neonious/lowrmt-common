let _session: string | null = null;

export function getSessionOrDefault(): string | null {
  return _session;
}

export function getSession(): string {
  if (!_session) {
    throw new Error("Session does not exist.");
  }
  return _session;
}

export function setSession(session: string): void {
  _session = session;
}

export function clearSession(): void {
  _session = null;
}
