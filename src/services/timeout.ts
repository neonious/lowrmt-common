import { TimeoutHandler } from "../hooks/timeout";
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

export interface TimeoutService {
    setTimeout(id: string, timeout: boolean): void;
}

@injectable()
export class TimeoutServiceImpl implements TimeoutService {

    private size = 0;
    private timeouts: Dict<boolean> = {};

    constructor(
        @inject(TYPES.TimeoutHandler) private timeoutHandler: TimeoutHandler
    ) { }

    setTimeout(id: string, timeout: boolean) {

        if (timeout) {
            if (!this.timeouts[id]) {
                this.timeouts[id] = true;
                this.size++;
                if (this.size === 1)
                    this.timeoutHandler.setTimeout(true);
            }
        } else {
            if (this.timeouts[id]) {
                delete this.timeouts[id];
                this.size--;
                if (this.size === 0)
                    this.timeoutHandler.setTimeout(false);
            }
        }
    }
}