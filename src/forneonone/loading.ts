// import { HttpMiddleware, BeforeMiddlewareOptions } from "../middleware";
// import { HttpLoadingHandler } from "../../../../hooks/httpLoading";
// import { injectable, inject } from 'inversify';
// import { TYPES } from '../../../../types';

// @injectable()
// export class LoadingMiddlewareImpl implements HttpMiddleware {
//     private loadingNum = 0;

//     constructor(
//         @inject(TYPES.HttpLoadingHandler) private loadingHandler: HttpLoadingHandler
//     ) { }

//     before() {
//         this.loadingNum++;
//         if (this.loadingNum === 1) {
//             this.loadingHandler.setLoadingState(true);
//         }
//     }
//     after() {
//         this.loadingNum--;
//         if (this.loadingNum === 0) {
//             this.loadingHandler.setLoadingState(false);
//         }
//     }
// }