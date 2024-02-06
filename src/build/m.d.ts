/* tslint:disable */
/* eslint-disable */
/**
* @returns {Promise<any>}
*/
export function greet(): Promise<any>;
/**
*/
export class Model {
  free(): void;
/**
* @param {Uint8Array} weights
* @param {Uint8Array} tokenizer
* @param {Uint8Array} config
*/
  constructor(weights: Uint8Array, tokenizer: Uint8Array, config: Uint8Array);
/**
* @param {any} input
* @returns {any}
*/
  forward(input: any): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_model_free: (a: number) => void;
  readonly model_load: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly model_forward: (a: number, b: number, c: number) => void;
  readonly main: (a: number, b: number) => number;
  readonly greet: () => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h919bc8ff7907a860: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h4ec435f8440d057d: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
