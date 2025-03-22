interface WorkerGlobalScopeEventMap {
  'error': ErrorEvent
  'languagechange': Event
  'offline': Event
  'online': Event
  'rejectionhandled': PromiseRejectionEvent
  'unhandledrejection': PromiseRejectionEvent
}

/**
* This Web Workers API interface is an interface representing the scope of any worker. Workers have no browsing context this scope contains the information usually conveyed by Window objects — in this case event handlers, the console or the associated WorkerNavigator object. Each WorkerGlobalScope has its own event loop.
*
* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope)
*/
export interface WorkerGlobalScope extends EventTarget, FontFaceSource, WindowOrWorkerGlobalScope {
  /**
   * Returns workerGlobal's WorkerLocation object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/location)
   */
  readonly location: WorkerLocation
  /**
   * Returns workerGlobal's WorkerNavigator object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/navigator)
   */
  readonly navigator: WorkerNavigator
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/error_event) */
  onerror: ((this: WorkerGlobalScope, ev: ErrorEvent) => any) | null
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/languagechange_event) */
  onlanguagechange: ((this: WorkerGlobalScope, ev: Event) => any) | null
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/offline_event) */
  onoffline: ((this: WorkerGlobalScope, ev: Event) => any) | null
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/online_event) */
  ononline: ((this: WorkerGlobalScope, ev: Event) => any) | null
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/rejectionhandled_event) */
  onrejectionhandled: ((this: WorkerGlobalScope, ev: PromiseRejectionEvent) => any) | null
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/unhandledrejection_event) */
  onunhandledrejection: ((this: WorkerGlobalScope, ev: PromiseRejectionEvent) => any) | null
  /**
   * Returns workerGlobal.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/self)
   */
  readonly self: WorkerGlobalScope & typeof globalThis
  /**
   * Fetches each URL in urls, executes them one-by-one in the order they are passed, and then returns (or throws if something went amiss).
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/importScripts)
   */
  importScripts(...urls: (string | URL)[]): void
  addEventListener<K extends keyof WorkerGlobalScopeEventMap>(type: K, listener: (this: WorkerGlobalScope, ev: WorkerGlobalScopeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
  removeEventListener<K extends keyof WorkerGlobalScopeEventMap>(type: K, listener: (this: WorkerGlobalScope, ev: WorkerGlobalScopeEventMap[K]) => any, options?: boolean | EventListenerOptions): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void
}

export declare var WorkerGlobalScope: {
  prototype: WorkerGlobalScope
  new(): WorkerGlobalScope
}

/**
* The absolute location of the script executed by the Worker. Such an object is initialized for each worker and is available via the WorkerGlobalScope.location property obtained by calling self.location.
*
* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation)
*/
interface WorkerLocation {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation/hash) */
  readonly hash: string
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation/host) */
  readonly host: string
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation/hostname) */
  readonly hostname: string
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation/href) */
  readonly href: string
  toString(): string
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation/origin) */
  readonly origin: string
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation/pathname) */
  readonly pathname: string
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation/port) */
  readonly port: string
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation/protocol) */
  readonly protocol: string
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerLocation/search) */
  readonly search: string
}

declare var WorkerLocation: {
  prototype: WorkerLocation
  new(): WorkerLocation
}

/**
* A subset of the Navigator interface allowed to be accessed from a Worker. Such an object is initialized for each worker and is available via the WorkerGlobalScope.navigator property obtained by calling window.self.navigator.
*
* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerNavigator)
*/
interface WorkerNavigator extends NavigatorBadge, NavigatorConcurrentHardware, NavigatorID, NavigatorLanguage, NavigatorLocks, NavigatorOnLine, NavigatorStorage {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerNavigator/mediaCapabilities) */
  readonly mediaCapabilities: MediaCapabilities
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WorkerNavigator/permissions) */
  readonly permissions: Permissions
}

declare var WorkerNavigator: {
  prototype: WorkerNavigator
  new(): WorkerNavigator
}
