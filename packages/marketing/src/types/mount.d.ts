export interface NavigationOptions {
  pathname: string;
}

export interface MountOptions {
  initialPath?: string;
  onNavigate?: (options: NavigationOptions) => void;
  onSignIn?: () => void;
}

export interface MountResult {
  onParentNavigate: (options: NavigationOptions) => void;
}

export interface VueMountResult {
  onParentNavigate: () => void;
  unmount: () => void;
}

export type MountFunction = (
  el: HTMLElement,
  options?: MountOptions
) => MountResult;

export type VueMountFunction = (el: HTMLElement | null) => VueMountResult;
