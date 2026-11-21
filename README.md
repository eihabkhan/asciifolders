<div align="center">

<img src=".github/assets/mascot.svg" width="120" alt="The AsciiFolders mascot: a deadpan folder sticker" />

# AsciiFolders

Turn any folder into a tidy little tree.

[![npm version](https://img.shields.io/npm/v/asciifolders?color=1fe0cc&label=npm)](https://www.npmjs.com/package/asciifolders)
[![license](https://img.shields.io/npm/l/asciifolders?color=1fe0cc)](LICENSE)

[Website](https://asciifolders.com) · [Docs](https://asciifolders.com/docs) · [Playground](https://asciifolders.com/playground)

</div>

AsciiFolders is a tiny CLI that prints an ASCII tree of any directory. Run it in a project and you get a neat map of every file and folder, ready to copy and share.

```shell
npx asciifolders
```

```
my-cool-project
├── README.md
├── next.config.ts
├── package.json
├── public
│   └── favicon.ico
├── src
│   ├── app
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components
│       └── Button.tsx
└── tsconfig.json
```

## Requirements

> [!NOTE]
> AsciiFolders requires [Node.js](https://nodejs.org/en) 20.9.0 or later.

## Usage

There's nothing to install. `cd` into the folder you want to map and run it with your package manager's runner:

| Package manager | Command             |
| --------------- | ------------------- |
| npm             | `npx asciifolders`  |
| pnpm            | `pnpx asciifolders` |
| bun             | `bunx asciifolders` |

AsciiFolders prints the tree, then asks whether to copy it to your clipboard. Pass `--copy` to skip the question and copy it right away.

## Options

| Option                | Description                                                        | Default  |
| --------------------- | ------------------------------------------------------------------ | -------- |
| `-a, --all`           | Include hidden files and folders, the ones that start with a dot.  | `false`  |
| `-d, --depth <depth>` | How many levels of folders to descend into. `0` prints only the top level. | `5`      |
| `-s, --style <style>` | The connectors used to draw the tree: `arrows` or `pipes`.         | `arrows` |
| `-df, --dirs-first`   | List directories before files at every level.                      | `false`  |
| `-c, --copy`          | Copy the tree to your clipboard right away, without asking.        | `false`  |
| `-h, --help`          | Print the list of options and exit.                                |          |

## Examples

Only the top level:

```shell
npx asciifolders --depth 0
```

```
my-cool-project
├── README.md
├── next.config.ts
├── package.json
├── public
├── src
└── tsconfig.json
```

Pipes instead of arrows, copied straight to the clipboard:

```shell
npx asciifolders --style pipes --copy
```

```
my-cool-project
|--- README.md
|--- next.config.ts
|--- package.json
|--- public
|   └--- favicon.ico
|--- src
|   |--- app
|   |   |--- layout.tsx
|   |   └--- page.tsx
|   └--- components
|       └--- Button.tsx
└--- tsconfig.json
```

Everything, including dotfiles, with folders listed first:

```shell
npx asciifolders --all --dirs-first
```

## Ignored folders

Dependency and build folders are always skipped, even with `--all`: `node_modules`, `.git`, `dist`, `vendor`, `site-packages`, `gems` and `target`.

## Try it in your browser

Not ready to run it on your own files? The [playground](https://asciifolders.com/playground) lets you build a folder in a Finder-style window and watch the tree update as you go.

## Contributing

Contributions are welcome. Read the [contributing guidelines](CONTRIBUTING.md) first, then to try your changes locally:

1. Clone the repo and `cd` into it
2. Install dependencies with `pnpm install`
3. Make your changes
4. Run `pnpm build` to build the package (the build uses [Bun](https://bun.sh), so you'll need it installed)
5. Run `npm link` to make the `asciifolders` command available globally
6. Run `asciifolders` in any folder to test it

## Author

**Eihab Khan**

- Portfolio: [eihabkhan.com](https://eihabkhan.com)
- GitHub: [@eihabkhan](https://github.com/eihabkhan)
- X: [@itseihab](https://x.com/itseihab)

## License

Released under the [MIT License](LICENSE).
