import { JSONSchema7 } from "json-schema";
import { once } from "lodash";
import { HttpMethods } from "./httpApiMethods";
import { McHttpJsonOptions, postJson } from "./mcHttp";

type AdditionApiOptions = Partial<McHttpJsonOptions>;

export type HttpApiService = methods;

const getInfo = once(async () => {
  const obj = (await import("./schema.json")) as JSONSchema7;

  const noInputOrOutput = [];
  const onlyInput = [];
  const onlyOutput = [];
  const inputAndOutput = [];
  const noSession = new Set<string>();

  const props = obj.properties!;
  const propKeys = Object.keys(props) as (keyof HttpMethods)[];
  for (const method of propKeys) {
    const def = props[method];
    if (typeof def !== "boolean") {
      if (def.type === "undefined") {
        noInputOrOutput.push(method);
      } else {
        const subprops = def.properties!;
        if (subprops["input"]) {
          if (subprops["output"]) {
            inputAndOutput.push(method);
          } else {
            onlyInput.push(method);
          }
        } else {
          onlyOutput.push(method);
        }
        if (subprops["noSession"]) {
          noSession.add(method);
        }
      }
    }
  }

  const noParameterKeys = new Set(noInputOrOutput.concat(onlyOutput));
  return { noParameterKeys, noSession };
});

type methods = {
  [K in keyof HttpMethods]: HttpMethods[K] extends undefined
    ? (options?: AdditionApiOptions) => void
    : HttpMethods[K] extends { input: any; output: any }
    ? (
        params: HttpMethods[K]["input"],
        options?: AdditionApiOptions
      ) => HttpMethods[K]["output"]
    : HttpMethods[K] extends { input: any }
    ? (params: HttpMethods[K]["input"], options?: AdditionApiOptions) => void
    : HttpMethods[K] extends { output: any }
    ? (options?: AdditionApiOptions) => HttpMethods[K]["output"]
    : never
};

export const httpApi = new Proxy(
  {},
  {
    get: function(target, method: string) {
      return async function(paramsOpts?: any, _options?: AdditionApiOptions) {
        const { noParameterKeys, noSession } = await getInfo();
        const params = noParameterKeys.has(method) ? undefined : paramsOpts;
        const opts = noParameterKeys.has(method) ? paramsOpts : _options;

        return await postJson({
          ...opts,
          json: params,
          url: `/api/${method}`,
          noSession: noSession.has(method)
        });
      };
    }
  }
) as methods;
