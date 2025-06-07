import { ExtensionType } from "pixi.js";
import type {
  Application,
  ApplicationOptions,
  ExtensionMetadata,
  ResizePluginOptions,
} from "pixi.js";

import { resize } from "./resize";

// Custom utility type:
export type DeepRequired<T> = Required<{
  [K in keyof T]: DeepRequired<T[K]>;
}>;

/**
 * Application options for the CreationResizePlugin.
 */
export interface CreationResizePluginOptions extends ResizePluginOptions {
  /** Options for controlling the resizing of the application */
  resizeOptions?: {
    pixelWidth?: number;
    pixelHeight?: number;
  };
}

/**
 * Middleware for Application's resize functionality.
 *
 * Adds the following methods to Application:
 * * Application#resizeTo
 * * Application#resize
 * * Application#queueResize
 * * Application#cancelResize
 * * Application#resizeOptions
 */
export class CreationResizePlugin {
  /** @ignore */
  public static extension: ExtensionMetadata = ExtensionType.Application;

  private static resizeId: number | null;
  private static resizeTo: Window | HTMLElement | null;
  private static cancelResize: (() => void) | null;

  /**
   * Initialize the plugin with scope of application instance
   * @param {object} [options] - See application options
   */
  public static init(options: ApplicationOptions): void {
    const app = this as unknown as Application;

    Object.defineProperty(
      app,
      "resizeTo",
      /**
       * The HTML element or window to automatically resize the
       * renderer's view element to match width and height.
       */
      {
        set(dom: Window | HTMLElement) {
          globalThis.removeEventListener("resize", app.queueResize);
          this._resizeTo = dom;
          if (dom) {
            globalThis.addEventListener("resize", app.queueResize);
            app.resize();
          }
        },
        get() {
          return this._resizeTo;
        },
      },
    );

    /**
     * Resize is throttled, so it's safe to call this multiple times per frame and it'll
     * only be called once.
     */
    app.queueResize = (): void => {
      if (!this.resizeTo) {
        return;
      }

      this.cancelResize!();

      // Throttle resize events per raf
      this.resizeId = requestAnimationFrame(() => app.resize!());
    };

    /**
     * Execute an immediate resize on the renderer, this is not
     * throttled and can be expensive to call many times in a row.
     * Will resize only if `resizeTo` property is set.
     */
    app.resize = (): void => {
      if (!this.resizeTo) {
        return;
      }

      // clear queue resize
      this.cancelResize!();

      let canvasWidth: number;
      let canvasHeight: number;

      // Resize to the window
      if (this.resizeTo === globalThis.window) {
        canvasWidth = globalThis.innerWidth;
        canvasHeight = globalThis.innerHeight;
      }
      // Resize to other HTML entities
      else {
        const { clientWidth, clientHeight } = this.resizeTo as HTMLElement;

        canvasWidth = clientWidth;
        canvasHeight = clientHeight;
      }

      const { width, height, x, y, scale } = resize(
        canvasWidth,
        canvasHeight,
        app.resizeOptions.pixelWidth,
        app.resizeOptions.pixelHeight,
      );

      app.renderer.canvas.style.width = `${canvasWidth}px`;
      app.renderer.canvas.style.height = `${canvasHeight}px`;
      window.scrollTo(0, 0);

      // Apply global scale and position to the stage or root container
      app.stage.scale.set(scale);
      app.stage.position.set(x, y);

      app.renderer.resize(width, height);
    };

    this.cancelResize = (): void => {
      if (this.resizeId) {
        cancelAnimationFrame(this.resizeId);
        this.resizeId = null;
      }
    };
    this.resizeId = null;
    this.resizeTo = null;
    app.resizeOptions = {
      pixelHeight: 72,
      pixelWidth: 128,
    };
    app.resizeTo =
      options.resizeTo || (null as unknown as Window | HTMLElement);
  }

  /**
   * Clean up the ticker, scoped to application
   */
  public static destroy(): void {
    const app = this as unknown as Application;

    globalThis.removeEventListener("resize", app.queueResize);
    this.cancelResize!();
    this.cancelResize = null;
    app.queueResize = null as unknown as () => void;
    app.resizeTo = null as unknown as Window | HTMLElement;
    app.resize = null as unknown as () => void;
  }
}
