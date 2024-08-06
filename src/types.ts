export type Style = 'arrows' | 'pipes';

export interface Options {
  all: boolean;
  depth: string;
  style: Style;
  dirsFirst: boolean;
  autoCopy: boolean;
}
