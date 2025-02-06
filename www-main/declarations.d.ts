declare module 'mux-embed';
declare namespace Intl {
  class ListFormat {
    constructor(locales?: string | string[], options?: Intl.ListFormatOptions);
    public format: (items: string[]) => string;
  }
}
