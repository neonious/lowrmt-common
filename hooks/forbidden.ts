import { AuthenticationService } from "../services/authentication/authentication";
import { injectable, inject, LazyServiceIdentifer, Container } from 'inversify';
import { TYPES } from '../types';

export interface ForbiddenHandler {
    onForbidden(): void;
}

@injectable()
export class ForbiddenHandlerImpl implements ForbiddenHandler {
    constructor(
        @inject(TYPES.Container)/*fixes circular dep. apimethods -> ...-> this-> authservice -> apimethods*/ private container: Container
    ) {
    }

    onForbidden(): void {
        const authService = this.container.get<AuthenticationService>(TYPES.AuthenticationService);
        authService.logout(true);
    }
}