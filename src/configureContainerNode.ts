import { Container, interfaces } from "inversify";
import { HttpHandler } from "./services/http/handler/handler";
import { TYPES } from "./types";
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
import { ConfigureOptions, configureContainer } from "./configureContainer";
import { HttpService } from "./services/http/http";
import { WebsocketFactory } from "./hooks/websocketFactory/websocketFactory";
import { WebsocketFactoryNode } from "./hooks/websocketFactory/node";
import { HttpHandlerNode } from "./services/http/handler/node";

export function configureContainerForNode(container: Container, options: ConfigureOptions) {
    container.bind<WebsocketFactory>(TYPES.WebsocketFactory).to(WebsocketFactoryNode);
    container.bind<HttpHandler>(TYPES.HttpHandler).to(HttpHandlerNode);

    configureContainer(container, options);
}