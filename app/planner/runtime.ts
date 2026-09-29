// The standalone Pages entry configures this before mounting the planner.
export const browserStorage = typeof window !== 'undefined' && Boolean((window as Window & {houzPages?: boolean}).houzPages);
export const assetUrl = (name: string) => `${browserStorage ? '/houz-planer/' : '/'}${name}`;
