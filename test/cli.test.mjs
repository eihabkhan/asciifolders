// End-to-end tests for the built CLI (run `pnpm build` first, or `pnpm test`).
// Each test builds a real folder in a temp dir and runs dist/bin.js with
// piped stdio, the way scripts and AI agents run it. No test uses --copy,
// so the clipboard is never touched.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BIN = fileURLToPath(new URL('../dist/bin.js', import.meta.url));
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

/** Runs the CLI with stdin left open (like an agent) and a hard timeout */
function run(args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [BIN, ...args], { cwd, stdio: 'pipe' });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Timed out (waiting on a prompt?)\nstdout:\n${stdout}\nstderr:\n${stderr}`));
    }, 10_000);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

/** Creates files and folders from { 'a/b.txt': 'content', 'empty/': null } */
async function fixture(files, name = 'project') {
  const root = path.join(await mkdtemp(path.join(tmpdir(), 'asciifolders-')), name);
  await mkdir(root, { recursive: true });
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, file);
    if (file.endsWith('/')) {
      await mkdir(target, { recursive: true });
    } else {
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, content ?? '');
    }
  }
  return root;
}

const tree = (...lines) => `${lines.join('\n')}\n`;

const PROJECT = {
  'README.md': '',
  'package.json': '{}',
  'src/index.ts': '',
  'src/utils/format.ts': '',
  '.env': '',
  'node_modules/react/index.js': '',
};

test('prints only the tree to stdout and never waits on a prompt without a terminal', async () => {
  const root = await fixture(PROJECT);
  const { code, stdout, stderr } = await run([], { cwd: root });

  assert.equal(code, 0);
  assert.equal(
    stdout,
    tree(
      'project',
      '├── README.md',
      '├── package.json',
      '└── src',
      '    ├── index.ts',
      '    └── utils',
      '        └── format.ts'
    )
  );
  assert.equal(stderr, '');
});

test('takes a folder argument, relative or absolute', async () => {
  const root = await fixture(PROJECT);
  const expected = tree('src', '├── index.ts', '└── utils', '    └── format.ts');

  assert.equal((await run(['src'], { cwd: root })).stdout, expected);
  assert.equal((await run([path.join(root, 'src')])).stdout, expected);
});

test('sorts entries and draws └── on the last visible one', async () => {
  // zeta.txt and node_modules sort last; node_modules must not steal └──
  const root = await fixture({ 'b.txt': '', 'a.txt': '', 'C.txt': '', 'node_modules/x.js': '' });
  const { stdout } = await run([root]);

  assert.equal(stdout, tree('project', '├── C.txt', '├── a.txt', '└── b.txt'));
});

test('respects .gitignore, including nested ones and ones above the folder', async () => {
  const root = await fixture({
    '.git/': null,
    '.gitignore': 'coverage/\n*.log\n',
    'coverage/lcov.info': '',
    'debug.log': '',
    'app.ts': '',
    'src/.gitignore': 'generated/\n',
    'src/generated/types.ts': '',
    'src/main.ts': '',
    'src/server.log': '',
  });

  assert.equal(
    (await run([root])).stdout,
    tree('project', '├── app.ts', '└── src', '    └── main.ts')
  );
  // Running on a subfolder still applies the repo root's .gitignore
  assert.equal((await run([path.join(root, 'src')])).stdout, tree('src', '└── main.ts'));
});

test('--no-gitignore lists ignored files again', async () => {
  const root = await fixture({ '.gitignore': '*.log\n', 'debug.log': '', 'app.ts': '' });

  assert.equal(
    (await run([root, '--no-gitignore'])).stdout,
    tree('project', '├── app.ts', '└── debug.log')
  );
});

test('--ignore skips matching files and folders, and can be repeated', async () => {
  const root = await fixture({
    'app.ts': '',
    'app.test.ts': '',
    'fixtures/data.json': '',
    'src/util.test.ts': '',
    'src/util.ts': '',
  });

  assert.equal(
    (await run([root, '-i', '*.test.ts', '--ignore', 'fixtures'])).stdout,
    tree('project', '├── app.ts', '└── src', '    └── util.ts')
  );
});

test('--all, --depth, --dirs-first and --style still work', async () => {
  const root = await fixture(PROJECT);

  assert.equal(
    (await run([root, '--all', '-d', '0'])).stdout,
    tree('project', '├── .env', '├── README.md', '├── package.json', '└── src')
  );
  assert.equal(
    (await run([root, '-df', '-s', 'pipes'])).stdout,
    tree(
      'project',
      '|--- src',
      '|   |--- utils',
      '|   |   └--- format.ts',
      '|   └--- index.ts',
      '|--- package.json',
      '└--- README.md'
    )
  );
});

test('errors go to stderr with a non-zero exit code', async () => {
  const root = await fixture(PROJECT);

  for (const args of [
    [path.join(root, 'missing')],
    [path.join(root, 'README.md')],
    [root, '--depth', 'two'],
    [root, '--style', 'dots'],
  ]) {
    const { code, stdout, stderr } = await run(args);
    assert.equal(code, 1, `exit code for ${args.join(' ')}`);
    assert.equal(stdout, '', `stdout for ${args.join(' ')}`);
    assert.match(stderr, /No such folder|Not a folder|--depth|--style/);
  }
});

test('--version prints the package version', async () => {
  const { code, stdout } = await run(['--version']);

  assert.equal(code, 0);
  assert.equal(stdout.trim(), pkg.version);
});
