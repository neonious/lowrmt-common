
declare module 'duk_debug' {


    export interface ExecStatus {
        readonly fileName: string;
        readonly funcName: string;
        readonly line: number;
        readonly state: 'connected' | 'paused' | 'running';
        readonly attached: boolean;
    }

    export interface OutputLine {
        readonly type: 'print' | 'alert' | 'log' | 'debugger-info' | 'debugger-debug';
        readonly message: string;
        readonly level: any;
    }

    export interface Callstack {
        readonly callstack: {
            readonly fileName: string;
            readonly lineNumber: number;
            readonly funcName: string;
        }[];
    }

    export interface Locals {
        readonly locals: VarPropsProp[];
        readonly level: number;
    }

    export interface Breakpoint {
        readonly fileName: string;
        readonly lineNumber: number;
    }

    export interface Breakpoints {
        readonly breakpoints: Breakpoint[]
    }

    export interface ExceptionStatus {
        readonly fatal: boolean;
        readonly msg: string;
        readonly fileName: string;
        readonly lineNumber: number;
    }

    export interface EvalResult {
        readonly error: string;
        readonly result: any;
    }

    export interface GetVarResult {
        readonly found: boolean;
        readonly result: any;
    }

    export interface VarPropsPropObject {
        readonly proptype: 'object';
        readonly key: string | number;
        readonly pointer: string;
        readonly type: 'object' | 'array' | 'function'
    }

    export interface VarPropsType {
        readonly proptype: 'buffer';
        readonly key: string | number;
        readonly type: 'buffer';
        readonly data: string;
    }

    export interface VarPropsUnknown {
        readonly proptype: 'unknown';
        readonly key: string | number;
        readonly pointer?: string;
        readonly name: string;
    }

    export interface VarPropsPropPrimitive {
        readonly proptype: 'primitive';
        readonly key: string | number;
        readonly value: any;
    }

    export type VarPropsProp = VarPropsPropPrimitive | VarPropsPropObject | VarPropsType | VarPropsUnknown;

    export interface VarProps {
        readonly pointer: string;
        readonly from: number;
        readonly props: VarPropsProp[];
    }

    export interface EmitFunctions {
        (key: 'varprops', options: {
            readonly pointer: string;
            readonly from: number;
            readonly to_not_incl: number;
        }): void;
        (key: 'delete-all-breakpoints'): void;
        (key: 'add-breakpoint', options: {
            readonly fileName: string;
            readonly lineNumber: number;
        }): void;
        (key: 'delete-breakpoint', options: {
            readonly fileName: string;
            readonly lineNumber: number;
        }): void;
        (key: 'stepinto'): void;
        (key: 'stepover'): void;
        (key: 'stepout'): void;
        (key: 'pause'): void;
        (key: 'resume'): void;
        (key: 'eval', options: {
            readonly input: string;
            readonly level: number;
        }): void;
        (key: 'getvar', options: {
            readonly varname: string;
        }): void;
        (key: 'putvar', options: {
            readonly varname: string;
            readonly varvalue: any;
        }): void;
        (key: 'toggle-breakpoint', options: {
            readonly fileName: string;
            readonly lineNumber: number;
        }): void;
        (key: 'getlocals', level?: number): void;
    }

    export interface EventTypes {
        'varprops-result': VarProps;
        'exec-status': ExecStatus;
        'output-lines': OutputLine[];
        'callstack': Callstack;
        'locals': Locals;
        'breakpoints': Breakpoints;
        'exception-status': ExceptionStatus;
        'eval-result': EvalResult;
        'getvar-result': GetVarResult;
    }

    export type OonFunctions2 = <K extends keyof EventTypes>(event: K, callback: (msg: EventTypes[K]) => void) => void;
    export type OffFunctions2 = (event: keyof EventTypes) => void;

    export interface Debugger {
        readonly on: OonFunctions2;
        readonly off: OffFunctions2;

        readonly emit: EmitFunctions;

        dispose(): void;
    }

    export function create(factory: {
        create: (method: string) => any
    }): Debugger;
    export function disableLogging(): void;
}
