import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const scanRoots = ['apps', 'packages'];
const codeExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const ignoredDirs = new Set(['node_modules', '.git', '.next', 'dist', 'coverage', '.turbo']);

const allowedPackageToAppAliasImports = new Map([
  ['packages/chat/src/components/ChatFeedback.tsx', ['@/types/common/mime']],
  ['packages/chat/src/components/ConnectedChatInput.tsx', ['@/apis/voiceAgents']],
  ['packages/chat/src/components/Message.tsx', ['@/types/commonTypes']],
  ['packages/chat/src/components/MessageContainer.tsx', ['@/modules/chatbot/PaceAvatar']],
  ['packages/chat/src/components/blocks/AgentBlock.tsx', ['@/constants/shortcuts']],
  ['packages/chat/src/components/blocks/HITLQuestionsBlock/useHITLQuestions.ts', ['@/constants/routeConfig']],
  [
    'packages/chat/src/components/blocks/TaskBlock.tsx',
    ['@/constants/routeConfig', '@/hooks/toolkit', '@/modules/pace/pace.utils', '@/store'],
  ],
  [
    'packages/chat/src/components/blocks/ToolCallBlock.tsx',
    ['@/modules/integrations/AllIntegrations/IntegrationCardV2', '@/types/api/integrations'],
  ],
  ['packages/chat/src/hooks/useChat.ts', ['@/app/_providers/sse-provider', '@/types/commonTypes']],
  ['packages/conversation-stream/src/components/ConnectedChatInput.tsx', ['@/apis/voiceAgents']],
  ['packages/conversation-stream/src/provider/ConversationProvider.tsx', ['@/app/_providers/sse-provider']],
  ['packages/conversation-stream/src/provider/TaskProvider.tsx', ['@/app/_providers/sse-provider']],
  [
    'packages/dataset-create-edit/components/BluePrintDataset.tsx',
    [
      '@/context/pendingDataset.context',
      '@/modules/data/data.constants',
      '@/types/commonTypes',
      '@/utils/events',
    ],
  ],
  ['packages/dataset-create-edit/components/DatasetColumDetails.tsx', ['@/modules/data/data.constants']],
  ['packages/tanstack-table/components/TanstackHeader.tsx', ['@/types/commonTypes']],
  ['packages/tanstack-table/components/TanstackRow.tsx', ['@/modules/process/process.types']],
  [
    'packages/tanstack-table/components/TanstackTable.tsx',
    [
      '@/components/common/skeletons/SkeletonElement',
      '@/components/common/table/CustomNoRowsOverlay',
      '@/components/common/tanstackTable/skeletons/SkeletonBody',
      '@/components/common/tanstackTable/skeletons/SkeletonHeader',
      '@/modules/process/process.types',
      '@/types/commonTypes',
    ],
  ],
  ['packages/tanstack-table/hooks/useInfiniteTableData.ts', ['@/types/commonTypes']],
  ['packages/tanstack-table/hooks/useTableState.ts', ['@/types/commonTypes']],
  ['packages/tanstack-table/hooks/useTableSync.ts', ['@/types/commonTypes']],
  ['packages/tanstack-table/types/index.ts', ['@/modules/process/process.types', '@/types/commonTypes']],
  ['packages/tanstack-table/utils/index.tsx', ['@/types/commonTypes']],
]);

const importRegexes = [
  /\bfrom\s+['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

const packageMetaCache = new Map();

const toPosixPath = (filePath) => filePath.split(path.sep).join('/');

const countNewlines = (text, endIndex) => text.slice(0, endIndex).split('\n').length;

const extractImports = (content) => {
  const imports = [];

  for (const regex of importRegexes) {
    for (const match of content.matchAll(regex)) {
      imports.push({
        specifier: match[1],
        line: countNewlines(content, match.index ?? 0),
      });
    }
  }

  return imports;
};

const matchesExportKey = (subpath, exportKey) => {
  if (exportKey === subpath) return true;
  if (!exportKey.includes('*')) return false;

  const [prefix, suffix] = exportKey.split('*');

  return subpath.startsWith(prefix) && subpath.endsWith(suffix ?? '') && subpath.length > prefix.length;
};

const getPackageMeta = async (packageName) => {
  if (packageMetaCache.has(packageName)) {
    return packageMetaCache.get(packageName);
  }

  const packageSegment = packageName.replace('@zamp-platform/', '');
  const packageJsonPath = path.join(rootDir, 'packages', packageSegment, 'package.json');

  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const meta = {
      name: packageJson.name,
      exports: packageJson.exports ?? null,
    };

    packageMetaCache.set(packageName, meta);

    return meta;
  } catch {
    packageMetaCache.set(packageName, null);

    return null;
  }
};

const isPublicPackageImport = async (specifier) => {
  if (!specifier.startsWith('@zamp-platform/')) return true;

  const segments = specifier.split('/');
  const packageName = segments.slice(0, 2).join('/');
  const subpath = segments.length === 2 ? '.' : `./${segments.slice(2).join('/')}`;
  const packageMeta = await getPackageMeta(packageName);

  if (!packageMeta?.exports) return true;
  if (typeof packageMeta.exports === 'string') return subpath === '.';

  const exportKeys = Object.keys(packageMeta.exports).filter((key) => key.startsWith('.'));

  if (exportKeys.length === 0) return subpath === '.';

  return exportKeys.some((exportKey) => matchesExportKey(subpath, exportKey));
};

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    if (!codeExtensions.has(path.extname(entry.name))) continue;

    files.push(fullPath);
  }

  return files;
};

const validateFile = async (filePath) => {
  const relativePath = toPosixPath(path.relative(rootDir, filePath));
  const content = await readFile(filePath, 'utf8');
  const fileErrors = [];

  for (const { specifier, line } of extractImports(content)) {
    if (relativePath.startsWith('packages/') && specifier.startsWith('@/')) {
      const allowedSpecifiers = allowedPackageToAppAliasImports.get(relativePath) ?? [];

      if (!allowedSpecifiers.includes(specifier)) {
        fileErrors.push(
          `${relativePath}:${line} imports app-only alias "${specifier}" from a shared package without an allowlist entry.`,
        );
      }
    }

    if (specifier.startsWith('@zamp-platform/') && !(await isPublicPackageImport(specifier))) {
      fileErrors.push(
        `${relativePath}:${line} imports non-exported package entrypoint "${specifier}". Use the package's public exports instead.`,
      );
    }
  }

  return fileErrors;
};

const main = async () => {
  const files = [];

  for (const scanRoot of scanRoots) {
    files.push(...(await collectFiles(path.join(rootDir, scanRoot))));
  }

  const errors = [];

  for (const filePath of files) {
    errors.push(...(await validateFile(filePath)));
  }

  if (errors.length > 0) {
    console.error('Architecture guard failed.\n');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`Architecture guard passed for ${files.length} source files.`);
};

await main();
