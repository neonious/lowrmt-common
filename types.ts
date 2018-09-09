import { keys } from 'ts-transformer-keys';
import { chain } from 'lodash';

type Types =
    'Container' |
    'HttpService' |
    'AuthenticationService' |
    'HttpApiService' |
    'SessionService' |
    'TimeoutService' |
    'SocketPoolFactory' |
    'WebdavService' |
    'DownloadProgressStatus' |
    'ConsoleMessages' |
    'ConsoleMessageFormatter' |

    'AuthenticationEvents' |
    'TimeoutMiddleware' |
    'SessionMiddleware' |
    'LoadingMiddleware' |
    'ForbiddenMiddleware' |
    'BrokenMiddleware' |
    'ForbiddenHandler' |
    'DownloadProgressHandler' |

    'WebsocketFactory' |
    'HttpHandler' |
    'BrokenHandler' |
    'HostPrefixHandler' |
    'HttpLoadingHandler' |
    'TimeoutHandler' |

    'ObservableSocketFactory' |
    'ForbiddenTimeoutSocketMethodFactory' |
    'SocketPoolFactorySocketFactory';

const typeKeys = keys<{ [K in Types]: void }>();
const TYPES = chain(typeKeys).keyBy().mapValues(k => Symbol.for(k)).value() as any as { [K in Types]: symbol };

export { TYPES };