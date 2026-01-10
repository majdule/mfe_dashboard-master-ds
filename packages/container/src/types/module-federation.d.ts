declare module 'marketing/MarketingApp' {
  import { MountFunction } from './mount';
  export const mount: MountFunction;
}

declare module 'auth/AuthApp' {
  import { MountFunction } from './mount';
  export const mount: MountFunction;
}

declare module 'dashboard/DashboardApp' {
  import { VueMountFunction } from './mount';
  export const mount: VueMountFunction;
}
