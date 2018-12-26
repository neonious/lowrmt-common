import { setSession, clearSession } from "./session";
import { HandlerEventHub } from "../../common/handlerEvent";
import { postJson } from "../../http/mcHttp";
import { beforeLogin, afterLogin, beforeLogout, afterLogout } from './events';

let _isLoggedIn = false;

export async function tryLogin(password: string) {
  const result = await postJson<
    | {
        session: string;
        err?: false;
      }
    | {
        err: "PASSWORD_INVALID";
      }
  >({
    noSession: true,
    url: "/api/Login",
    json: { password }
  });
  if (!result.err) {
    await beforeLogin.fire(result.session);
    setSession(result.session);
    await afterLogin.fire(result.session);
    _isLoggedIn = true;
    return true;
  }
  return false;
}

export async function setWasLoggedIn(session: string) {
  await beforeLogin.fire(session);
  setSession(session);
  await afterLogin.fire(session);
  _isLoggedIn = true;
}

export async function logout(logoutClientOnly = false) {
  if (_isLoggedIn) {
    await beforeLogout.fire(void 0); // later
    if (!logoutClientOnly)
      await postJson({
        url: "/api/Logout"
      });
    clearSession();
    await afterLogout.fire(void 0);
    _isLoggedIn = false;
  }
}
