import { SessionService } from "./session";
import { Subject, Observable } from "rxjs";
import { HttpApiService } from "../http/api";
import { AuthenticationEvents, AuthenticationEventsImpl } from "../../hooks/authentication";
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

export interface AuthenticationService {
    tryLogin(password: string): Promise<boolean>;
    logout(invalidSession?: boolean): Promise<void>;
    setWasLoggedIn(session: string): void;
}

@injectable()
export class AuthenticationServiceImpl implements AuthenticationService {

    private _isLoggedIn = false;

    constructor(
        @inject(TYPES.HttpApiService) private httpApiService: HttpApiService,
        @inject(TYPES.SessionService) private sessionService: SessionService,
        @inject(TYPES.AuthenticationEvents) private authenticationEvents: AuthenticationEventsImpl) { }

    async tryLogin(password: string) {
        let result = await this.httpApiService.Login({ password });
        if (!result.err) {
            await this.authenticationEvents.beforeLogin.fire(result.session);
            this.sessionService.setSession(result.session);
            await this.authenticationEvents.afterLogin.fire(result.session);
            this._isLoggedIn = true;
            return true;
        }
        return false;
    }

    async setWasLoggedIn(session: string) {
        await this.authenticationEvents.beforeLogin.fire(session);
        this.sessionService.setSession(session);
        await this.authenticationEvents.afterLogin.fire(session);
        this._isLoggedIn = true;
    }

    async logout(logoutClientOnly = false) {
        if (this._isLoggedIn) {
            await this.authenticationEvents.beforeLogout.fire(void 0); // later
            if (!logoutClientOnly)
                await this.httpApiService.Logout();
            this.sessionService.clearSession();
            await this.authenticationEvents.afterLogout.fire(void 0);
            this._isLoggedIn = false;
        }
    }
}