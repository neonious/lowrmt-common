import { injectable } from 'inversify';

export interface SessionService {
    getSessionOrDefault(): string | null;
    getSession(): string;
    setSession(session: string): void;
    clearSession(): void;
}

@injectable()
export class SessionServiceImpl implements SessionService {
    private session: string | null = null;

    getSessionOrDefault(): string | null {
        return this.session;
    }

    getSession(): string {
        if (!this.session) {
            throw new Error('Session does not exist.');
        }
        return this.session;
    }

    setSession(session: string): void {
        this.session = session;
    }

    clearSession(): void {
        this.session = null;
    }
} 