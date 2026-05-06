# File Viewer Implementation

This document describes the File Viewer as it exists on the `nav-2` branch. It is written for branch work: where the viewer is mounted, how a file becomes a tab, how content is fetched and saved, which component renders each file type, and where the important edge cases live.

## High-Level Shape

The File Viewer is the file-tab experience inside the Pace files panel. It is not a standalone page component. A file is opened into the shared dynamic-tabs system, and the active file tab is rendered inside `FilesPanelBody`.

Core layers:

| Layer | Main files | Responsibility |
| --- | --- | --- |
| App provider | `components/layouts/LayoutWrapper.tsx` | Mounts `PaceProvider`, then `FileViewerProvider`, then file tree/upload providers. |
| Panel selection | `components/files-panel/FilesPanelBody.tsx` | Chooses file, agent, task, or empty panel content based on active tab type. |
| Tab state | `components/dynamic-tabs/useDynamicTabs.ts`, `store/slices/dynamic-tabs.slice.ts` | Opens/closes/renames tabs, persists tabs per conversation in session storage, maps tabs to URLs. |
| File viewer state | `context/FileViewerContext.tsx` | Stores editable file contents by conversation and path, including dirty/original state. |
| File lifecycle hook | `hooks/useFileViewer.ts` | Fetches file metadata/content, builds media URLs, autosaves edits, polls for external changes. |
| Viewer shell | `components/file-viewer/FileTabsContainer.tsx`, `FileViewerTab.tsx`, `FileViewerHeader.tsx`, `FileViewerContent.tsx` | Mounts active/previous tabs, portals the header, and selects the correct renderer. |
| Concrete viewers | `components/file-viewer/viewers/*` | Renders image, audio, video, PDF, markdown, code, HTML, spreadsheet, docx, and pptx previews. |

## Provider and State Scope

`LayoutWrapper` mounts providers in this order:

1. `PaceProvider`
2. `FileViewerProvider`
3. `FileTreeNavigationProvider`
4. `FileUploadProvider`
5. remaining app providers

This matters because `FileViewerProvider` reads `activeConversationId` from `usePaceConversationContext()`. Editable file state is bucketed by conversation id:

```ts
type FileStatesByConversation = Map<string, Map<string, FileState>>;
```

If there is no active conversation, the provider uses `__none__`. The `/chat/files` listing page uses the dedicated `FILES_LISTING_CONVERSATION_ID` value, so file tabs and file contents opened from the Files page are isolated from normal chat conversations.

The stored `FileState` contains:

| Field | Meaning |
| --- | --- |
| `content` | Current editable content shown in the editor. |
| `originalContent` | Last loaded or last saved content. Used for dirty checks. |
| `isDirty` | `content !== originalContent`. |
| `mtime_ms` | Last known server modification timestamp. Used by polling and save state. |

`FileViewerContext` exposes:

| Method | Used for |
| --- | --- |
| `getFileState(path)` | Read the current in-memory editable state. |
| `initFileState(path, content, mtime)` | Initialize a file once. Does not overwrite existing state. |
| `forceUpdateFileState(path, content, mtime)` | Replace state from the server, used when polling detects external changes. |
| `updateFileContent(path, content)` | Apply editor changes and mark dirty. |
| `markFileSaved(path, newMtime)` | Move current content into `originalContent` and clear dirty. |
| `removeFileState(path)` | Drop state when a tab closes. |
| `updateFileStatePath(oldPath, newPath)` | Move state during file rename. |
| `updateFileStatePathsForFolder(oldFolder, newFolder)` | Move state for every open file under a renamed/moved folder. |

The path-update methods intentionally update both React state and an internal ref synchronously. That keeps immediate reads from seeing the old path during optimistic rename or folder move operations.

## Opening a File

There are several entry points, but they all end up calling `useDynamicTabs({ type: TAB_TYPE.FILE }).openTab(...)`.

Common entry points:

| Entry point | Behavior |
| --- | --- |
| `FileTreeNode` double click / action | Opens `node.path` with `node.name`. |
| `FilesPanelContent.handleSelectFile` | Opens a file from the right-side file tree and collapses the expanded chat sidebar back to sidebar mode if needed. |
| `FileListingPage.handleSelectFile` | Opens the tab while staying on `/chat/files` by passing a custom tab path. |
| Chat references / task output files | Components such as `ChatHomePage`, `ChatSidebarContent`, `TaskContentInner`, and `useAutoOpenAgentFiles` can open file tabs. |

For normal chat file tabs, `buildTabRoute()` produces:

```text
/chat?f=<encoded-file-path>
```

For `/chat/files`, `FileListingPage` passes:

```text
/chat/files?f=<encoded-file-path>
```

The tab id is the file path. The tab name is normally the basename. The dynamic tab slice adds a separate `stableKey` with `crypto.randomUUID()`. The viewer uses `stableKey` as the React key so a rename can keep the same mounted tab instance while changing the tab id/path.

## Dynamic Tabs and URL Sync

`useDynamicTabs` wraps Redux tab actions and URL navigation.

The Redux slice stores tabs per active conversation:

```ts
{
  activeConversationId,
  byConversation: {
    [conversationId]: {
      tabs,
      activeTabId,
      panelState
    }
  }
}
```

The slice persists `byConversation` to session storage using `SESSION_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS_BY_CONVERSATION`. It also stores panel state such as panel width, tree column width, tree sidebar open state, files panel expansion, and word wrap.

`useTabRouter` keeps tabs and URLs synchronized:

| Action | What happens |
| --- | --- |
| Open tab | Dispatches `openTab`, marks it active, navigates to the tab path. |
| Switch tab | Sets active tab and navigates to the stored path. |
| URL contains `?f=` with no existing tab | Creates a tab from the URL and uses the path basename as default name. |
| Close active tab | Picks the next target with browser-like ordering, or navigates to `/chat` when no tab remains. |
| Rename tab | Updates id/name/path and uses `replace` navigation when the renamed tab is active. |
| Folder move | Updates every tab whose id equals or starts with the moved folder path. |

`FileTabsContainer` passes file-specific callbacks into `useDynamicTabs`:

```ts
useDynamicTabs({
  type: TAB_TYPE.FILE,
  onTabClose: removeFileState,
  onTabUpdate: updateFileStatePath,
  onFolderMove: updateFileStatePathsForFolder,
});
```

That is the bridge between tab identity and editable content state.

## Rendering a File Tab

`FilesPanelBody` renders `FileTabsContainer` only when `hasActiveFileTab` is true.

`FileTabsContainer`:

1. Reads all open file tabs and the active tab from `useDynamicTabs`.
2. Calls `useMountedTabs(tabs, activeTab?.stableKey)`.
3. Shows the Zamp loader when there are no hydrated/open tabs.
4. Renders each mounted tab inside `TabWrapper`.

`useMountedTabs` implements "mount on first activation" with a cap of 5 mounted tabs. This avoids mounting every persisted tab on page load, while keeping recently viewed tabs alive so editor/viewer state does not churn on every tab switch.

`FileViewerTab` owns per-tab view modes:

| State | Default | Applies to |
| --- | --- | --- |
| `markdownViewMode` | `milkdown` | Markdown files below the large-file threshold. |
| `htmlViewMode` | `preview` | HTML files. |
| `spreadsheetViewMode` | `table` | Text spreadsheets such as CSV/TSV/TAB. |

It calls `useFileViewer()` and derives flags for the header:

| Flag | Meaning |
| --- | --- |
| `isMarkdown` | Markdown and not larger than `MILKDOWN_SIZE_LIMIT`. |
| `isHtml` | HTML category. |
| `isTextSpreadsheet` | Spreadsheet category with `csv`, `tsv`, or `tab` extension. |

The header is rendered with `createPortal()` into the file panel header slot from `useFilesPanelHeaderSlot()`. Only the active tab portals a header.

## File Loading and Saving

`useFileViewer` is the lifecycle hook. It receives:

```ts
{
  filePath,
  isActive,
  onSaveSuccess,
  onSaveError,
  onLoadError
}
```

It derives:

| Value | Source |
| --- | --- |
| `fileCategory` | `getFileCategory(filePath)` based on extension. |
| `fileExtension` | `getFileExtension(filePath)`. |
| `isTextSpreadsheet` | Spreadsheet with `csv`, `tsv`, or `tab`. |
| `isEditable` | Code, markdown, HTML, or text spreadsheet. |
| `mediaUrl` | `/files/<encoded-path>?raw=true&v=<mtime>` for non-editable files. |

Editable file loading:

1. If there is already state in `FileViewerContext`, do nothing.
2. If the file is not editable, do nothing here.
3. Fetch metadata with `readFile`.
4. Fetch raw text with `readFileContent`.
5. Initialize context state with content and `mtime_ms`.
6. If the API returns not found, set `isFileNotFound`.
7. Other errors are reported via `onLoadError`.

Non-editable/media loading:

1. Fetch metadata immediately, even before the tab becomes active.
2. Store `mediaMtime`.
3. Build `mediaUrl` using `getMediaUrl(filePath)`.
4. Add `&v=<mtime>` so media viewers refresh when the file changes.

Pending creation:

Both editable and media initial loads check `isFileCreationPending(filePath)`. If a path is still being created, the hook waits for `onFileCreated(filePath, callback)` before loading. This prevents a newly-created file tab from immediately reading a path that the backend has not finished creating.

Autosave:

1. Editors call `updateContent(newContent)`.
2. `updateFileContent()` updates context state and recomputes `isDirty`.
3. `scheduleAutoSave()` debounces for `AUTO_SAVE_DELAY_MS = 1000`.
4. `saveFile()` reads the latest state from context.
5. If a save is already in progress, it sets `pendingSaveRef`.
6. `writeFile({ path, content })` writes the latest content.
7. On success, `markFileSaved(path, result.mtime_ms)` clears dirty state.
8. If edits happened during the save, another save is scheduled immediately after the first completes.

Current save conflict note: the API type supports `expectedMtimeMs`, but `useFileViewer` does not pass it to `writeFile`. External changes are handled by polling only when the file is not dirty.

## Polling and External Changes

`useFileViewer` polls every `POLL_INTERVAL_MS = 3000`, but only for the active tab.

Editable polling:

1. Requires file path, editable category, active tab, and not-found false.
2. Skips if a poll is already running.
3. Reads current context state.
4. Skips if state is missing or dirty.
5. Fetches metadata.
6. If `metadata.mtime_ms !== currentState.mtime_ms`, fetches content and calls `forceUpdateFileState()`.
7. If not found, stops polling and sets `isFileNotFound`.

Media polling:

1. Requires non-editable file, active tab, and not-found false.
2. Fetches metadata every 3 seconds.
3. If mtime changes, updates `mediaMtime`.
4. The changed `mediaMtime` changes `mediaUrl`, forcing viewers keyed by URL to reload.

This design avoids overwriting unsaved edits because editable polling does not refresh when `isDirty` is true. It also means there is currently no visible conflict-resolution UI in the File Viewer despite conflict-related constants existing in `files.constants.ts`.

## Header Behavior

`FileViewerHeader` contains:

| UI | Implementation |
| --- | --- |
| Breadcrumb path | `FilePathBreadcrumb`, with collapsed middle folders when there are more than two folders. Clicking folders reveals them in the file tree. |
| More menu | `FileViewerHeaderMenu`. |
| Chat with file | Sets pending file references, seeds a chat draft, and routes to `/chat`. |
| Toggle file tree | Shows/hides the tree sidebar, hidden on the dedicated files page. |
| Rename dialog | `RenameFileDialog`. |
| Delete dialog | `DeleteConfirmationDialog`. |

More menu actions:

| Action | Handler |
| --- | --- |
| View mode | Markdown, HTML, or text spreadsheet mode depending on file type. |
| Copy path | Uses `navigator.clipboard.writeText(filePath)`. |
| Enable word wrap | Toggles `wordWrapEnabled` in active conversation panel state. |
| Download | `useFileDownload().downloadFile({ path, fileName })`. |
| Rename | Opens `RenameFileDialog`. |
| Reference in Chat | Adds a pending mention insert and expands the chat sidebar when needed. |
| Delete | Opens confirmation, calls `deleteItem(filePath)`, closes tabs for that path, shows toast. |

Rename flow:

1. Opening the dialog refetches sibling names.
2. The dialog validates empty, unchanged, and duplicate names.
3. Submit closes the dialog immediately.
4. It builds the new path from the old parent and new name.
5. It optimistically calls `updateFileStatePath(filePath, newPath)`.
6. It optimistically calls `updateTab(filePath, newPath, newName)`.
7. It reveals the new path in the tree.
8. It calls `renameItem(filePath, newName, file metadata)`.
9. On failure, it captures the error, shows a toast, and rolls state and tab path back.

## File Type Routing

`getFileCategory()` maps extensions to `FILE_CATEGORY`.

| Category | Extensions / source | Viewer |
| --- | --- | --- |
| `IMAGE` | `IMAGE_EXTENSIONS` from `@zamp-platform/utils` | `ImageViewer` |
| `AUDIO` | `mp3`, `wav`, `flac`, `aac`, `m4a`, `ogg`, `wma`, `aiff` | `AudioViewer` |
| `VIDEO` | `VIDEO_EXTENSIONS` from `@zamp-platform/utils` | `VideoViewer` |
| `PDF` | `pdf` | `PdfViewer` |
| `MARKDOWN` | `md`, `mdx` | `MilkdownEditor` or `MonacoCodeEditor` |
| `HTML` | `html`, `htm`, `xhtml`, `shtml` | `HtmlPreviewViewer` or `MonacoCodeEditor` |
| `SPREADSHEET` | `csv`, `tsv`, `tab`, `xls`, `xlsx`, `xlsm`, `xlsb`, `ods` | `SpreadsheetViewer` or `MonacoCodeEditor` for text-source mode |
| `PRESENTATION` | `pptx`, `ppt` | `PresentationViewer`, with `.ppt` unsupported preview |
| `DOCUMENT` | `docx`, `doc` | `DocxViewer`, with `.doc` unsupported preview |
| `CODE` | `MONACO_EDITABLE_EXTENSIONS` | `MonacoCodeEditor` |
| `UNKNOWN` | Anything else | `UnsupportedFileView` |

`FileViewerContent` is the routing component. It lazy-loads heavier viewers with `clientOnly()`:

| Lazy viewer | Reason |
| --- | --- |
| `PdfViewer` | PDF library/browser-only rendering. |
| `MonacoCodeEditor` | Monaco browser runtime. |
| `MilkdownEditor` | Milkdown editor runtime. |
| `SpreadsheetViewer` | Worker/table stack. |
| `DocxViewer` | Fetch/blob/render library. |
| `PresentationViewer` | PPTX rendering library. |

Content-loading state is true when:

| Condition | Why |
| --- | --- |
| `isLoading && isEditable` | Editable content is being fetched by RTK Query. |
| Category is markdown, HTML, or code and `content === null` | Content-based viewers need text before rendering. |
| Text spreadsheet and `content === null` | Raw/table text spreadsheet parsing needs content. |

Media errors are kept in local `mediaError` state and reset when `filePath` or `mediaUrl` changes. `CommonWrapper` shows `FileViewerError` for load failures and the Zamp loader while loading.

## Concrete Viewers

### Monaco Code Editor

`MonacoCodeEditor` uses `@monaco-editor/react` and configures Monaco from the jsDelivr CDN:

```ts
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs',
  },
});
```

It disables TypeScript/JavaScript semantic and syntax diagnostics, focuses on mount, prevents the browser default save shortcut, and uses the app theme to choose `vs-light` or `vs-dark`.

Editor options include minimap off, line numbers on, `wordWrap: 'on'`, automatic layout, 2-space tabs, bracket guides, smooth scrolling, and 16px vertical padding.

Important note: the header has a word-wrap toggle, but `MonacoCodeEditor` currently hard-codes `wordWrap: 'on'` and does not consume `wordWrapEnabled` from layout context.

### Milkdown Markdown Editor

`MilkdownEditor` wraps Milkdown Crepe. It:

1. Creates a `Crepe` instance with `defaultValue: content`.
2. Listens to `markdownUpdated`.
3. Calls `onChange(markdown)` for autosave.
4. Tracks editor content in a ref.
5. When the external `content` prop changes, calls `replaceAll(content)` if it differs from the editor's current content.

Markdown files larger than `MILKDOWN_SIZE_LIMIT = 75_000` bypass Milkdown and open in Monaco. For large markdown, the header does not show the markdown view-mode switch because `FileViewerTab` sets `isMarkdown` false when the file exceeds the limit.

There is also a `MarkdownPreview.tsx` component in the folder, but `FileViewerContent` currently does not use it. Markdown preview mode uses Milkdown, not this component.

### HTML Preview

`HtmlPreviewViewer` renders an iframe with:

```tsx
<iframe srcDoc={content} sandbox="allow-scripts" />
```

It disables pointer events while the files panel or sidebar is resizing, so iframe pointer capture does not break resize gestures. Empty content shows `FileViewerError` with title "No content to preview".

Security note: the sandbox only allows scripts. It does not allow same-origin, forms, or popups.

### Image Viewer

`ImageViewer` uses `next/image` with `unoptimized`. It:

1. Checks `isImageCached(src)` to avoid loader flashes.
2. Shows the Zamp loader while loading.
3. Renders the image contained within 80% of the available width/height.
4. Captures errors to Sentry and reports "The image could not be displayed".

### Audio and Video Viewers

`AudioViewer` and `VideoViewer` are custom media controls. They track playing state, current time, duration, loading, buffering, errors, and mute state. Both pause automatically when their tab becomes inactive.

This is why `FileViewerContent` handles audio/video specially with `ActiveMediaWrapper`: most content rendering is memoized without `isActive`, but media viewers need live active/inactive updates to pause playback.

Audio uses a hidden `<audio preload="metadata">` element with custom controls. Video uses a `<video preload="metadata" playsInline>` element, custom controls, click-to-toggle playback, and keyboard Space/Enter toggling on the video area.

### PDF Viewer

`PdfViewer` uses `@pdfslick/react` with:

```ts
scaleValue: 'page-fit'
annotationEditorMode: -1
getDocumentParams: { withCredentials: true }
```

It shows a floating black toolbar with download, previous/next page, page count, and zoom controls. Loading and PDF errors are handled locally; errors are captured to Sentry and passed up to `FileViewerContent`.

### Spreadsheet Viewer

`SpreadsheetViewer` handles both text spreadsheets and binary spreadsheet files.

Input source:

| File kind | Input |
| --- | --- |
| CSV/TSV/TAB table mode | `content` string from `useFileViewer`. |
| XLS/XLSX/XLSM/XLSB/ODS | `mediaUrl`, fetched as `ArrayBuffer`. |
| CSV/TSV/TAB raw mode | Monaco plain-text editor. |

Parsing runs in `spreadsheet.worker.ts` through `useSpreadsheetWorker()`. The worker supports `parse` and `switchSheet` messages. ArrayBuffers are transferred to the worker.

Table rendering uses:

| Library | Role |
| --- | --- |
| `@tanstack/react-table` | Columns, sorting, global filtering, resizing. |
| `@tanstack/react-virtual` | Row virtualization. |

Performance behavior:

1. Initial render caps rows at `MAX_INITIAL_ROWS = 500`.
2. After paint, it expands to all rows using `requestIdleCallback` or a timeout fallback.
3. Rows are virtualized at `ROW_HEIGHT = 36`.
4. Sheet changes reset global filter and sorting.

The spreadsheet viewer has a toolbar with global search and row/column count, a virtualized table with sticky header and sticky row-number column, and footer sheet tabs when multiple sheets exist.

### DOCX Viewer

`DocxViewer` supports `.docx` preview and explicitly does not preview legacy `.doc`.

For `.docx`, it:

1. Fetches `mediaUrl` with `credentials: 'include'`.
2. Converts the response to a `Blob`.
3. Dynamically imports `docx-preview`.
4. Calls `renderAsync(blob, container, styleContainer, options)`.
5. Runs `fixSymbolFonts()` after render.
6. Aborts and clears DOM content on unmount or URL change.

For `.doc`, it renders an unsupported-format message instructing the user to download.

### Presentation Viewer

`PresentationViewer` supports `.pptx` preview and explicitly does not preview legacy `.ppt`.

For `.pptx`, it:

1. Fetches `mediaUrl` with `credentials: 'include'`.
2. Reads an `ArrayBuffer`.
3. Dynamically imports `@aiden0z/pptx-renderer`.
4. Opens the deck with fixed initial width and list render mode.
5. Uses windowed slide rendering with batch size 8 and initial 4 slides.
6. Scales the fixed-width inner container to fit the outer container on resize.
7. Destroys the viewer on cleanup.

Individual slide render errors are captured to Sentry but do not necessarily fail the whole viewer.

### Unsupported File View

`UnsupportedFileView` shows a large file icon, filename, and "Preview is not available for this file type." The header download action is still available, so unsupported files can be downloaded from the viewer header.

## API Surface

The File Viewer uses endpoints from `apis/filesystem.ts`:

| Endpoint hook | Method / URL purpose | Used by |
| --- | --- | --- |
| `useLazyReadFileQuery` | File metadata without raw content. | `useFileViewer` metadata and polling. |
| `useLazyReadFileContentQuery` | Raw text content via `?raw=true`, response as `text()`. | Editable files and text spreadsheets. |
| `useWriteFileMutation` | PUT file content. | Autosave. |
| `useDeleteFileMutation` indirectly | Delete action through `useFileActions`. | Header delete. |
| `useMoveFileMutation` indirectly | Rename/move through `useFileActions`. | Header rename and tree rename. |

Media viewers do not use RTK Query for bytes. They use `getMediaUrl(filePath)`, which returns:

```text
${API_DOMAIN}/files/<encoded path segments>?raw=true
```

`useFileViewer` appends `&v=<mtime>` for non-editable files when metadata is known.

## Error States

`FileViewerError` supports two configured types:

| Type | Title | Default description |
| --- | --- | --- |
| `not-found` | File not found | The file may have been moved or deleted. |
| `load-error` | Failed to load file | The file could not be loaded and may be corrupted or unsupported. |

Not-found behavior:

| File kind | Behavior |
| --- | --- |
| Editable | `FileViewerTab` renders `FileViewerError` when `isFileNotFound && isEditable`. |
| Media/non-editable | `FileViewerContent` usually shows load error when the concrete viewer reports an error. Metadata polling can also set `isFileNotFound`, but there is no top-level non-editable not-found branch in `FileViewerTab`. |

Sentry capture points:

| File | Captures |
| --- | --- |
| `FileViewerTab` | Save and load failures from `useFileViewer`. |
| `useFileViewerHeaderActions` | Delete failures. |
| `useFileViewerHeaderRename` | Rename failures. |
| `ImageViewer`, `AudioViewer`, `VideoViewer`, `PdfViewer`, `DocxViewer`, `PresentationViewer` | Viewer-specific loading/rendering errors. |

## Styling and Layout

The viewer fills the files panel:

```tsx
<div className="flex h-full w-full flex-col overflow-hidden">
  header portal
  <div className="min-h-0 flex-1 overflow-hidden">
    content
  </div>
</div>
```

`FileViewerContent` uses `CommonWrapper` with:

| Prop | Value |
| --- | --- |
| `skeletonType` | `SkeletonTypes.CUSTOM` |
| `loader` | Zamp logo loader |
| `className` | `flex h-full w-full items-center justify-center` |
| `disableAnimation` | true |

Viewer-specific CSS:

| File | Purpose |
| --- | --- |
| `styles/milkdown-editor.css` | Milkdown editor layout and typography. |
| `styles/docx-viewer.css` | DOCX preview layout. |

## Important Change Points

Use these as the first places to look when changing behavior:

| Goal | Start here |
| --- | --- |
| Add support for a new file extension | `files.constants.ts`, `file-tree.utils.ts`, then `FileViewerContent.tsx`. |
| Change editable categories | `useFileViewer.isEditable` and `FileViewerContent`. Also update `isFileEditable()` if tree behavior should match. |
| Change autosave behavior | `useFileViewer.ts`, especially `AUTO_SAVE_DELAY_MS`, `saveFile()`, and `updateContent()`. |
| Add conflict handling | `useFileViewer.ts` save path and polling path. Consider using `expectedMtimeMs`. |
| Change tab persistence or conversation scoping | `dynamic-tabs.slice.ts`, `useDynamicTabs.ts`, `PaceProvider`, and `FileViewerContext.tsx`. |
| Change header actions | `FileViewerHeader.tsx`, `FileViewerHeaderMenu.tsx`, `useFileViewerHeaderActions.ts`. |
| Change rename behavior | `useFileViewerHeaderRename.ts` and tree rename hooks. |
| Change markdown behavior | `FileViewerContent.tsx`, `MilkdownEditor.tsx`, `MILKDOWN_SIZE_LIMIT`. |
| Change spreadsheet performance/parsing | `SpreadsheetViewer.tsx`, `useSpreadsheetWorker.ts`, `spreadsheet.worker.ts`. |
| Change media refresh behavior | `useFileViewer.mediaUrl`, media polling, and URL keys in `FileViewerContent`. |

## Current Sharp Edges

These are not necessarily bugs for this branch, but they are important if you are planning changes:

1. The word-wrap menu toggle is stored in panel state, but Monaco currently hard-codes `wordWrap: 'on'`.
2. `writeFile` supports `expectedMtimeMs`, but File Viewer autosave does not use it.
3. Dirty editable files are protected from polling overwrites, but there is no visible conflict-resolution workflow when the server changes while the user is editing.
4. Markdown's "Preview" mode is the editable Milkdown editor. The separate `MarkdownPreview.tsx` component is present but unused.
5. Large markdown files force Monaco source view and do not expose the markdown view-mode menu.
6. Non-editable not-found state is set by metadata polling, but the main `FileViewerTab` not-found branch only renders for editable files.
7. Monaco is loaded from a CDN, so code editing depends on external CDN availability unless this is changed.
8. HTML preview uses `srcDoc` with `sandbox="allow-scripts"`, so scripts can run inside the sandboxed iframe.
9. Closing a tab removes editable file state immediately. If a dirty autosave is still pending, the timer is cleared on unmount and unsaved in-memory changes can be lost.

## End-to-End Flow Summary

```text
User selects file
  -> openTab(file.path, file.name)
  -> dynamic tab stored in active conversation bucket
  -> URL becomes /chat?f=<path> or /chat/files?f=<path>
  -> FilesPanelBody sees active FILE tab
  -> FileTabsContainer renders mounted tabs
  -> FileViewerTab calls useFileViewer(filePath, isActive)
  -> useFileViewer derives category/editability
     -> editable: read metadata + text content into FileViewerContext
     -> non-editable: read metadata and build raw media URL
  -> FileViewerHeader portals into files panel header
  -> FileViewerContent selects concrete viewer
  -> edits call updateContent()
  -> autosave writes after 1 second debounce
  -> active tab polls every 3 seconds for server-side changes
```

