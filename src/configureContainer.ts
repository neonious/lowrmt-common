import { Container, interfaces } from "inversify";
import { HttpHandler } from "./services/http/handler/handler";
import { TYPES } from "./types";
import { HttpService, HttpServiceImpl } from "./services/http/http";
import { AuthenticationService, AuthenticationServiceImpl } from "./services/authentication/authentication";
import { HttpApiService, HttpApiServiceImpl } from "./services/http/api";
import { SessionService, SessionServiceImpl } from "./services/authentication/session";
import { TimeoutService, TimeoutServiceImpl } from "./services/timeout";
import { SocketMethodFactory, SocketMethodFactoryImpl } from "./clientServerApi/webSocket/socketMethodFactory";
import { AutoClosingJsonForbiddenTimeoutHandlingSocketImpl } from "./clientServerApi/webSocket/autoClosingJsonForbiddenTimeoutHandlingSocket";
import { HostPrefixHandler } from "./hooks/hostPrefix";
import { ForbiddenHandler, ForbiddenHandlerImpl } from "./hooks/forbidden";
import { ObservableSocketImpl } from "./clientServerApi/webSocket/observableSocket";
import { ForbiddenTimeoutHandlingSocketImpl } from "./clientServerApi/webSocket/forbiddenTimeoutHandlingSocket";
import { SocketPoolFactory } from "./clientServerApi/webSocket/socketPool";
import { AuthenticationEvents, AuthenticationEventsImpl } from "./hooks/authentication";
import { WebsocketFactory } from "./hooks/websocketFactory/websocketFactory";
import { TimeoutMiddlewareImpl, TimeoutMiddleware } from "./services/http/middleware/types/timeout";
import { WebdavServiceImpl, WebdavService } from "./services/http/webdav";
import { SessionMiddlewareImpl } from "./services/http/middleware/types/session";
import { LoadingMiddlewareImpl } from "./services/http/middleware/types/loading";
import { BrokenMiddlewareImpl } from "./services/http/middleware/types/broken";
import { DownloadProgressStatus, DownloadProgressStatusImpl } from "./services/http/progressStatus";
import { ForbiddenMiddlewareImpl } from "./services/http/middleware/types/forbidden";
import { DownloadProgressHandler } from "./hooks/downloadProgressHandler";
import { HttpLoadingHandler } from "./hooks/httpLoading";
import { TimeoutHandler } from "./hooks/timeout";
import { BrokenHandler } from './hooks/broken';
import { ConsoleMessages } from "./services/consoleMessage/messages";
import { ConsoleMessageFormatter } from "./services/consoleMessage/formatter";

export type ConfigureOptions = DownloadProgressHandler & HostPrefixHandler & TimeoutHandler & HttpLoadingHandler & BrokenHandler;

export function configureContainer(container: Container, options: ConfigureOptions) {

    container.bind<Container>(TYPES.Container).toConstantValue(container);
    container.bind<BrokenHandler>(TYPES.BrokenHandler).toConstantValue(options);
    container.bind<HttpLoadingHandler>(TYPES.HttpLoadingHandler).toConstantValue(options);
    container.bind<TimeoutHandler>(TYPES.TimeoutHandler).toConstantValue(options);
    container.bind<HostPrefixHandler>(TYPES.HostPrefixHandler).toConstantValue(options);
    container.bind<DownloadProgressHandler>(TYPES.DownloadProgressHandler).toConstantValue(options);

    container.bind<HttpService>(TYPES.HttpService).to(HttpServiceImpl);
    container.bind<AuthenticationService>(TYPES.AuthenticationService).to(AuthenticationServiceImpl);
    container.bind<HttpApiService>(TYPES.HttpApiService).to(HttpApiServiceImpl as any);
    container.bind<SessionService>(TYPES.SessionService).to(SessionServiceImpl);
    container.bind<TimeoutService>(TYPES.TimeoutService).to(TimeoutServiceImpl);
    container.bind<SocketPoolFactory>(TYPES.SocketPoolFactory).to(SocketPoolFactory);
    container.bind<WebdavService>(TYPES.WebdavService).to(WebdavServiceImpl);
    container.bind<DownloadProgressStatus>(TYPES.DownloadProgressStatus).to(DownloadProgressStatusImpl);
    container.bind<ConsoleMessages>(TYPES.ConsoleMessages).to(ConsoleMessages);
    container.bind<ConsoleMessageFormatter>(TYPES.ConsoleMessageFormatter).to(ConsoleMessageFormatter);

    container.bind<AuthenticationEvents>(TYPES.AuthenticationEvents).to(AuthenticationEventsImpl);
    container.bind<TimeoutMiddleware>(TYPES.TimeoutMiddleware).to(TimeoutMiddlewareImpl);
    container.bind<SessionMiddlewareImpl>(TYPES.SessionMiddleware).to(SessionMiddlewareImpl);
    container.bind<LoadingMiddlewareImpl>(TYPES.LoadingMiddleware).to(LoadingMiddlewareImpl);
    container.bind<ForbiddenMiddlewareImpl>(TYPES.ForbiddenMiddleware).to(ForbiddenMiddlewareImpl);
    container.bind<BrokenMiddlewareImpl>(TYPES.BrokenMiddleware).to(BrokenMiddlewareImpl);
    container.bind<ForbiddenHandler>(TYPES.ForbiddenHandler).to(ForbiddenHandlerImpl);

    container.bind<(url: string) => ObservableSocketImpl>(TYPES.ObservableSocketFactory).toFactory(context =>
        (url: string) => {
            return new ObservableSocketImpl(
                url,
                context.container.get<WebsocketFactory>(TYPES.WebsocketFactory)
            )
        }
    )

    container.bind<SocketMethodFactory<ForbiddenTimeoutHandlingSocketImpl>>(TYPES.ForbiddenTimeoutSocketMethodFactory).toDynamicValue(context =>
        new SocketMethodFactoryImpl<ForbiddenTimeoutHandlingSocketImpl>(
            url => new ForbiddenTimeoutHandlingSocketImpl(
                url,
                context.container.get<ForbiddenHandler>(TYPES.ForbiddenHandler),
                context.container.get<TimeoutService>(TYPES.TimeoutService),
                context.container.get<(url: string) => ObservableSocketImpl>(TYPES.ObservableSocketFactory),
            ),
            context.container.get<SessionService>(TYPES.SessionService),
            context.container.get<HostPrefixHandler>(TYPES.HostPrefixHandler)
        )
    );

    container.bind<SocketMethodFactory>(TYPES.SocketPoolFactorySocketFactory).toDynamicValue(context =>
        new SocketMethodFactoryImpl(
            url => new AutoClosingJsonForbiddenTimeoutHandlingSocketImpl(
                url,
                context.container.get<ForbiddenHandler>(TYPES.ForbiddenHandler),
                context.container.get<TimeoutService>(TYPES.TimeoutService),
                context.container.get<(url: string) => ObservableSocketImpl>(TYPES.ObservableSocketFactory),
            ),
            context.container.get<SessionService>(TYPES.SessionService),
            context.container.get<HostPrefixHandler>(TYPES.HostPrefixHandler)
        )
    );
}