let size = 0;
const timeouts: Dict<boolean> = {};

export function setTimeoutForId(id: string, timeout: boolean) {
  if (timeout) {
    if (!timeouts[id]) {
      timeouts[id] = true;
      size++;
      if (size === 1) handler && handler(true);
    }
  } else {
    if (timeouts[id]) {
      delete timeouts[id];
      size--;
      if (size === 0) handler && handler(false);
    }
  }
}

let handler: ((timeout: boolean) => void) | undefined;

export function setTimeoutHandler(callback: (timeout: boolean) => void) {
  handler = callback;
}
