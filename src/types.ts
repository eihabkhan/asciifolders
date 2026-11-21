export type Style = 'arrows' | 'pipes';

export interface Options {
  all: boolean;
  depth: string;
  style: Style;
  dirsFirst: boolean;
  copy: boolean;
  /** false with --no-prompt */
  prompt: boolean;
  /** false with --no-gitignore */
  gitignore: boolean;
  ignore: string[];
}
