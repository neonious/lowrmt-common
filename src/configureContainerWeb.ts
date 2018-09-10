import { ConfigureOptions, configureContainer } from "./configureContainer";
import { Container } from "inversify/dts/container/container";
import { HttpHandler } from "./services/http/handler/handler";
import { TYPES } from "./types";
import { WebsocketFactory } from "./hooks/websocketFactory/websocketFactory";
import { WebsocketFactoryWeb } from "./hooks/websocketFactory/web";
import { HttpHandlerWeb } from "./services/http/handler/web";

export function configureContainerForWeb(container: Container, options: ConfigureOptions) {
    container.bind<WebsocketFactory>(TYPES.WebsocketFactory).to(WebsocketFactoryWeb);
    container.bind<HttpHandler>(TYPES.HttpHandler).to(HttpHandlerWeb);

    configureContainer(container as any/*else lowrmt repo will give compile error*/, options);
}