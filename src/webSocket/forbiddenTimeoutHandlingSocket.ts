import { Observable } from "rxjs/Observable";
import { first } from "rxjs/operators/first";
import { map } from "rxjs/operators/map";
import { publish } from "rxjs/operators/publish";
import { refCount } from "rxjs/operators/refCount";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { Subject } from "rxjs/Subject";
import { v4 } from "uuid";
import { ObservableSocketImpl } from "../webSocket/observableSocket";
import { onForbidden } from "../hooks/forbidden";
import { setTimeoutForId } from "../services/timeout";

export class ForbiddenTimeoutHandlingSocketImpl {
  private static FORBIDDEN_CLOSE_CODE = 4000;

  private static MAX_TIME_NO_MSG_RECEIVED = 60_000;
  private static HEARTBEAT_SEND_INTERVAL = 10_000;

  private sendTimer?: any;
  private recTimer?: any;

  private onNewSocketSubject = new Subject<void>();
  readonly onNewSocket = this.onNewSocketSubject.asObservable();

  private afterSocketSubject = new Subject<void>();
  readonly afterSocket = this.afterSocketSubject.asObservable();

  private onOpenSubject = new ReplaySubject<void>(1);
  readonly onOpen = this.onOpenSubject.asObservable();

  private onMessageSubject = new Subject<string>();
  readonly onMessage2 = this.onMessageSubject.asObservable();

  readonly onMessage = new Observable<string>(subscriber => {
    const subscription = this.onMessage2
      .pipe(
        map(json => {
          try {
            const obj = JSON.parse(json);

            return obj;
          } catch (e) {
            if (e instanceof SyntaxError) {
              console.error("Original JSON: ", json);
            }
            throw e;
          }
        })
      )
      .subscribe(subscriber);
    return () => {
      subscription.unsubscribe();
      this.close();
    };
  })
    .pipe(publish())
    .pipe(refCount());

  private onErrorSubject = new Subject<void>();
  readonly onError = this.onErrorSubject.asObservable();

  private onCloseSubject = new Subject<number>();
  readonly onClose = this.onCloseSubject.asObservable();

  private isTimeout = false;
  public closed = false;

  public socket!: ObservableSocketImpl;

  protected id = v4();
  private createNewSocketTimeout?: any;

  constructor(private url: string) {
    this.createNewSocket();
  }

  send(data: unknown) {
    const json = JSON.stringify(data);
    this.sendRaw(json);
  }

  sendRaw(message: string) {
    this.socket.send(message);
    this.resetSendTimer();
  }

  close() {
    if (this.closed) return;
    this.closed = true;

    this.setTimeout(false);
    this.clearSendTimer();
    this.clearRecTimer();
    if (this.createNewSocketTimeout) clearTimeout(this.createNewSocketTimeout);

    this.socket.close();
  }

  private createNewSocket() {
    if (this.closed) return;
    const socket = new ObservableSocketImpl(this.url);

    socket.onOpen.pipe(first()).subscribe(
      () => {
        this.onOpenSubject.next(void 0);
        this.onNewSocketSubject.next();
      },
      this.onOpenSubject.error.bind(this.onOpenSubject),
      this.onOpenSubject.complete.bind(this.onOpenSubject)
    );

    socket.onMessage.subscribe(data => {
      this.setTimeout(false);
      this.resetRecTimer();

      if (data !== "")
        // ping
        this.onMessageSubject.next(data);
    }, this.onMessageSubject.error.bind(this.onMessageSubject));

    socket.onError.subscribe(
      this.onErrorSubject.next.bind(this.onErrorSubject),
      this.onErrorSubject.error.bind(this.onErrorSubject)
    );

    socket.onClose.subscribe(code => {
      this.afterSocketSubject.next();

      if (
        code !== ForbiddenTimeoutHandlingSocketImpl.FORBIDDEN_CLOSE_CODE &&
        !this.closed
      ) {
        this.clearSendTimer();
        this.clearRecTimer();
        console.log("Socket close: TIMEOUT!", this.url);
        this.setTimeout(true);
        if (this.createNewSocketTimeout)
          clearTimeout(this.createNewSocketTimeout);
        this.createNewSocketTimeout = setTimeout(() => {
          this.createNewSocket();
        }, 3000);
        return;
      }

      this.onCloseSubject.next();

      this.clearSendTimer();
      this.clearRecTimer();

      this.onNewSocketSubject.complete();
      this.afterSocketSubject.complete();
      this.onMessageSubject.complete();
      this.onErrorSubject.complete();
      this.onCloseSubject.complete();

      this.setTimeout(false);

      if (code === ForbiddenTimeoutHandlingSocketImpl.FORBIDDEN_CLOSE_CODE) {
        this.closed = true;
        onForbidden();
      }
    }, this.onCloseSubject.error.bind(this.onCloseSubject));

    this.socket = socket;
    this.resetRecTimer();
    this.resetSendTimer();
  }

  private clearRecTimer() {
    this.recTimer && clearTimeout(this.recTimer);
  }

  private setTimeout(timeout: boolean) {
    if (timeout !== this.isTimeout) {
      this.isTimeout = timeout;
      setTimeoutForId(this.id, timeout);
    }
  }

  private resetRecTimer() {
    this.clearRecTimer();
    this.recTimer = setTimeout(() => {
      this.socket.close();
      console.log(
        "Did not recieve something for",
        ForbiddenTimeoutHandlingSocketImpl.MAX_TIME_NO_MSG_RECEIVED,
        "ms: TIMEOUT!",
        this.url
      );
      this.setTimeout(true);
      this.createNewSocket();
    }, ForbiddenTimeoutHandlingSocketImpl.MAX_TIME_NO_MSG_RECEIVED);
  }

  private clearSendTimer() {
    this.sendTimer && clearTimeout(this.sendTimer);
  }

  private resetSendTimer() {
    this.clearSendTimer();
    this.sendTimer = setTimeout(() => {
      if (this.socket.readyState === 1) {
        // OPEN, merken: do not use e.g. Websocket.OPEN, is a function somehow
        this.socket.send("");
        this.resetSendTimer();
      }
    }, ForbiddenTimeoutHandlingSocketImpl.HEARTBEAT_SEND_INTERVAL);
  }
}
