'use client';

// SceneLang Studio — code that becomes video.
// Views: Studio (SceneLang + StyleKit editors), Learner, Marketplace, History.

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Clapperboard,
  BookOpen,
  Store,
  Sparkles,
  PlayCircle,
  Palette,
  UploadCloud,
  LayoutTemplate,
  Paperclip,
  History,
  X,
  Image as ImageIcon,
  FileText,
  Table2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/studio/code-editor';
import { Player } from '@/components/studio/player';
import { LearnView } from '@/components/studio/learn-view';
import { Marketplace, PublishDialog } from '@/components/studio/marketplace';
import { HistoryView } from '@/components/studio/history-view';
import { parseSceneLang } from '@/lib/scenelang/parser';
import { parseStyleKit } from '@/lib/scenelang/stylekit';
import { addImportToCode, setThemeInCode } from '@/lib/scenelang/themes';
import { loadInstalledStyles, saveInstalledStyle } from '@/lib/scenelang/market';
import { loadAssets, readFileAsAsset, removeAsset, saveAsset } from '@/lib/scenelang/assets';
import { getSession, listSessions, saveSession, type CodeSession } from '@/lib/scenelang/history';
import { SAMPLES } from '@/lib/scenelang/samples';
import { formatDuration } from '@/lib/scenelang/parser';
import type { AssetRef, ParseError } from '@/lib/scenelang/types';
import { cn } from '@/lib/utils';

type View = 'studio' | 'learn' | 'market' | 'history';

const SCENE_KEY = 'scenelang.scene';
const STYLE_KEY = 'scenelang.style';

export default function Page() {
  const [view, setView] = useState<View>('studio');
  const [sceneCode, setSceneCode] = useState('');
  const [styleCode, setStyleCode] = useState('');
  const [debouncedScene, setDebouncedScene] = useState('');
  const [debouncedStyle, setDebouncedStyle] = useState('');
  const [editorTab, setEditorTab] = useState<'scene' | 'style'>('scene');
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('');
  const [publishKind, setPublishKind] = useState<'style' | 'template' | 'video'>('style');
  const [publishOpen, setPublishOpen] = useState(false);
  const [styleVersion, setStyleVersion] = useState(0);
  const [assets, setAssets] = useState<AssetRef[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<CodeSession[]>([]);
  const [sessionVersion, setSessionVersion] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sceneRef = useRef(sceneCode);
  const styleRef = useRef(styleCode);
  useEffect(() => {
    sceneRef.current = sceneCode;
    styleRef.current = styleCode;
  }, [sceneCode, styleCode]);

  /* ------------------------- load & persist code ------------------------ */

  useEffect(() => {
    const id = setTimeout(() => {
      // re-register installed marketplace styles so `import` / theme lines resolve after a reload
      for (const s of loadInstalledStyles()) parseStyleKit(s.code);
      setAssets(loadAssets());
      setSessions(listSessions());
      const s = window.localStorage.getItem(SCENE_KEY);
      const st = window.localStorage.getItem(STYLE_KEY);
      if (s) {
        setSceneCode(s);
        setDebouncedScene(s);
      }
      if (st) {
        setStyleCode(st);
        setDebouncedStyle(st);
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      // resolve  inimportcode :session-id  — pull a saved session into the editor
      const m = sceneCode.match(/^\s*inimportcode\s*:\s*([\w-]+)/m);
      if (m) {
        const session = getSession(m[1]);
        if (session && session.kind === 'scene') {
          setSceneCode(session.code);
          setDebouncedScene(session.code);
          setImportError(null);
          toast.success(`Pulled session ${session.id} from History — iterate away`);
          return;
        }
        setImportError(
          session
            ? `session ${m[1]} is style code — open the StyleKit tab and paste it there`
            : `no session "${m[1]}" in History — open the History tab and copy an id`,
        );
      } else {
        setImportError(null);
        setDebouncedScene(sceneCode);
        window.localStorage.setItem(SCENE_KEY, sceneCode);
      }
    }, 320);
    return () => clearTimeout(id);
  }, [sceneCode]);

  useEffect(() => {
    const id = setTimeout(() => {
      const m = styleCode.match(/^\s*inimportcode\s*:\s*([\w-]+)/m);
      if (m) {
        const session = getSession(m[1]);
        if (session && session.kind === 'style') {
          setStyleCode(session.code);
          setDebouncedStyle(session.code);
          setImportError(null);
          toast.success(`Pulled session ${session.id} from History — iterate away`);
          return;
        }
        setImportError(
          session
            ? `session ${m[1]} is scene code — open the SceneLang tab and paste it there`
            : `no session "${m[1]}" in History — open the History tab and copy an id`,
        );
      } else {
        setImportError(null);
        setDebouncedStyle(styleCode);
        window.localStorage.setItem(STYLE_KEY, styleCode);
        const result = parseStyleKit(styleCode);
        if (result.name && result.tokens) {
          saveInstalledStyle({ name: result.name, code: styleCode });
          setStyleVersion((v) => v + 1);
        }
      }
    }, 320);
    return () => clearTimeout(id);
  }, [styleCode]);

  // auto-snapshot both editors into History every 6 seconds when they change
  useEffect(() => {
    const id = setInterval(() => {
      let changed = false;
      if (sceneRef.current.trim() && saveSession('scene', sceneRef.current)) changed = true;
      if (styleRef.current.trim() && saveSession('style', styleRef.current)) changed = true;
      if (changed) {
        setSessions(listSessions());
        setSessionVersion((v) => v + 1);
      }
    }, 6000);
    return () => clearInterval(id);
  }, []);

  /* --------------------------- style pipeline --------------------------- */

  const styleResult = useMemo(() => parseStyleKit(debouncedStyle), [debouncedStyle]);

  const installedStyles = useMemo(() => {
    void styleVersion;
    return loadInstalledStyles().map((s) => s.name);
  }, [styleVersion]);

  const assetNames = useMemo(() => assets.map((a) => a.name), [assets]);

  /* --------------------------- scene pipeline --------------------------- */

  const { spec, errors } = useMemo(() => {
    const result = parseSceneLang(debouncedScene, installedStyles, assetNames);
    const all: ParseError[] = [...result.errors];
    if (importError) all.push({ line: 0, message: importError });
    return { spec: result.spec, errors: all };
  }, [debouncedScene, installedStyles, assetNames, importError]);

  /* ------------------------------ assets -------------------------------- */

  const onFilesPicked = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const lower = file.name.toLowerCase();
      try {
        if (/\.(scenelang|slang|scene)$/.test(lower)) {
          const text = await file.text();
          setSceneCode((c) => (c ? c.replace(/\n*$/, '\n\n') : '') + text);
          toast.success(`${file.name} appended to your SceneLang code`);
        } else if (/\.(stylekit|style)$/.test(lower)) {
          const text = await file.text();
          setStyleCode((c) => (c ? c.replace(/\n*$/, '\n\n') : '') + text);
          setEditorTab('style');
          toast.success(`${file.name} appended to your StyleKit code`);
        } else {
          const asset = await readFileAsAsset(file);
          saveAsset(asset);
          setAssets(loadAssets());
          const hint =
            asset.kind === 'image'
              ? 'use it with:  image ' + asset.name
              : asset.kind === 'csv'
                ? 'use it with:  bars from ' + asset.name
                : 'use it with:  lines ' + asset.name;
          toast.success(`${file.name} imported — ${hint}`);
        }
      } catch {
        toast.error(`Could not import ${file.name}`);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAssetByName = (name: string) => {
    setAssets(removeAsset(name));
    toast.success(`${name} removed from your assets`);
  };

  /* ------------------------------- actions ------------------------------ */

  const applyStyleToVideo = () => {
    if (!styleResult.name) {
      toast.error('Your StyleKit code needs a name:  style my-look');
      return;
    }
    const withTheme = setThemeInCode(sceneCode, styleResult.name);
    setSceneCode(addImportToCode(withTheme, styleResult.name));
    toast.success(`Theme switched to “${styleResult.name}”`);
  };

  const importStyle = (code: string, _name: string) => {
    const result = parseStyleKit(code);
    if (result.name && result.tokens) {
      saveInstalledStyle({ name: result.name, code });
      setStyleVersion((v) => v + 1);
      setStyleCode(code);
      setEditorTab('style');
      const withTheme = setThemeInCode(sceneCode, result.name);
      setSceneCode(addImportToCode(withTheme, result.name));
      setView('studio');
      toast.success(`Style “${result.name}” imported and applied to your video`);
    } else {
      toast.error('That style code could not be parsed.');
    }
  };

  const loadTemplate = (code: string) => {
    setSceneCode(code);
    setView('studio');
    setEditorTab('scene');
    toast.success('Template loaded — make it yours');
  };

  const loadIntoEditor = (code: string, lang: 'scene' | 'style') => {
    if (lang === 'style') {
      setStyleCode(code);
      setEditorTab('style');
    } else {
      setSceneCode(code);
      setEditorTab('scene');
    }
    setView('studio');
  };

  const onExportingChange = (busy: boolean, label: string) => {
    setExporting(busy);
    setExportLabel(label);
  };

  const activeCode = editorTab === 'scene' ? sceneCode : styleCode;

  const compilerChip =
    spec.scenes.length > 0
      ? `${spec.scenes.length} scene${spec.scenes.length > 1 ? 's' : ''} · ${formatDuration(spec.totalMs)} · ${
          errors.length === 0 ? 'ready' : `${errors.length} issue${errors.length > 1 ? 's' : ''}`
        }`
      : editorTab === 'style'
        ? 'styles have no base — declare bg and ink'
        : 'blank canvas — write your first scene';

  const activeSceneError = errors.find((e) => e.line === 0);

  /* -------------------------------- render ------------------------------ */

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6fa]">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
          <button type="button" onClick={() => setView('studio')} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-teal-400 text-white shadow-md">
              <Clapperboard className="h-5 w-5" />
            </span>
            <span className="hidden text-[15.5px] font-semibold tracking-tight text-zinc-900 sm:block">
              SceneLang Studio
            </span>
          </button>

          <nav className="ml-2 flex rounded-full border bg-white p-1 shadow-sm" aria-label="Main navigation">
            {(
              [
                ['studio', 'Studio', PlayCircle],
                ['learn', 'Learner', BookOpen],
                ['market', 'Marketplace', Store],
                ['history', 'History', History],
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all',
                  view === v ? 'bg-violet-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-900',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span
              className={cn(
                'hidden rounded-full px-3 py-1 font-mono text-[11.5px] md:block',
                errors.length === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
              )}
            >
              {compilerChip}
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {view === 'studio' && (
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 lg:flex-row">
            {/* editors */}
            <section className="flex min-h-[420px] w-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm lg:h-[calc(100vh-7.5rem)] lg:w-[44%]">
              <div className="flex items-center gap-2 border-b px-3 py-2.5">
                <div className="flex rounded-full bg-zinc-100 p-0.5">
                  {(
                    [
                      ['scene', 'SceneLang', LayoutTemplate],
                      ['style', 'StyleKit', Palette],
                    ] as const
                  ).map(([t, label, Icon]) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditorTab(t)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-all',
                        editorTab === t ? 'bg-white text-violet-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-800',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="ml-auto flex items-center gap-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.txt,.csv,.tsv,.scenelang,.slang,.scene,.stylekit,.style"
                    className="hidden"
                    onChange={(e) => onFilesPicked(e.target.files)}
                    aria-hidden="true"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-3.5 w-3.5" /> Import
                  </Button>
                  {editorTab === 'scene' ? (
                    <>
                      <select
                        aria-label="Load an example"
                        defaultValue=""
                        onChange={(e) => {
                          const s = SAMPLES.find((x) => x.id === e.target.value);
                          if (s) {
                            loadIntoEditor(s.code, 'scene');
                            toast.success(`Loaded “${s.title}”`);
                          }
                          e.target.value = '';
                        }}
                        className="cursor-pointer rounded-full border bg-white px-3 py-1.5 text-[12px] text-zinc-600 hover:border-violet-300"
                      >
                        <option value="" disabled>
                          Examples…
                        </option>
                        {SAMPLES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-full"
                        onClick={() => {
                          setPublishKind('template');
                          setPublishOpen(true);
                        }}
                      >
                        <UploadCloud className="h-3.5 w-3.5" /> Sell
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-full" onClick={applyStyleToVideo}>
                        <Sparkles className="h-3.5 w-3.5" /> Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-full"
                        onClick={() => {
                          setPublishKind('style');
                          setPublishOpen(true);
                        }}
                      >
                        <UploadCloud className="h-3.5 w-3.5" /> Sell
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {activeSceneError && (
                <div className="border-b bg-violet-50 px-4 py-2 text-[12.5px] text-violet-800">
                  {activeSceneError.message}
                </div>
              )}

              <div className="relative flex min-h-0 flex-1 flex-col">
                {activeCode.trim() === '' && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/95 p-6 text-center">
                    <p className="text-[15px] font-semibold text-zinc-800">
                      {editorTab === 'scene' ? 'A blank canvas. Nothing written — your move.' : 'A blank style. Declare everything yourself.'}
                    </p>
                    <p className="max-w-sm text-[12.5px] leading-relaxed text-zinc-500">
                      {editorTab === 'scene'
                        ? 'Start from four lines, browse the premade catalog, or learn in the library. Nothing is pre-installed here — or just click through and type.'
                        : 'Styles have no default base — declare bg and ink, then add accents, fonts, atmosphere.'}
                    </p>
                    <div className="pointer-events-auto flex flex-wrap justify-center gap-2">
                      <Button
                        size="sm"
                        className="rounded-full bg-violet-600 text-white hover:bg-violet-700"
                        onClick={() => setView('market')}
                      >
                        Browse the catalog
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => setView('learn')}>
                        Open the Learner
                      </Button>
                      {editorTab === 'scene' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setSceneCode(
                              'video 1280x720 30fps\ntheme aurora\n\nscene hello (4s)\n  transition crossfade 0.85s\n  title "Hello, video"\n    fade in 0.55s\n    rise 22 over 0.6s\n    stagger words by 90ms\n  subtitle "written in a handful of lines"\n    type on over 1.4s\n',
                            );
                            toast.success('Starter sketch loaded — now make it yours');
                          }}
                        >
                          Type a starter sketch
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {editorTab === 'scene' ? (
                  <CodeEditor code={sceneCode} onChange={setSceneCode} errors={errors} readOnly={exporting} language="scene" />
                ) : (
                  <CodeEditor code={styleCode} onChange={setStyleCode} errors={styleResult.errors} readOnly={exporting} language="style" />
                )}
              </div>

              {/* assets row */}
              {assets.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 border-t bg-teal-50/50 px-3 py-2">
                  <span className="text-[10.5px] font-semibold tracking-wide text-teal-800 uppercase">your files</span>
                  {assets.slice(0, 8).map((a) => (
                    <span
                      key={a.name}
                      className="flex items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-[11px] text-zinc-600"
                      title={a.kind}
                    >
                      {a.kind === 'image' ? <ImageIcon className="h-3 w-3 text-teal-600" /> : a.kind === 'csv' ? <Table2 className="h-3 w-3 text-teal-600" /> : <FileText className="h-3 w-3 text-teal-600" />}
                      {a.name}
                      <button
                        type="button"
                        onClick={() => removeAssetByName(a.name)}
                        aria-label={`Remove ${a.name}`}
                        className="text-zinc-300 hover:text-rose-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {assets.length > 8 && <span className="text-[11px] text-zinc-400">+{assets.length - 8} more</span>}
                </div>
              )}

              <p className="border-t bg-zinc-50/70 px-4 py-2 text-[11.5px] text-zinc-400">
                {editorTab === 'scene'
                  ? 'SceneLang v2 — every action on its own line. Space plays, ↑↓ flip slides, snapshots auto-save to History (inimportcode :id pulls them back).'
                  : 'StyleKit — no default base: declare bg and ink, then shape the feel. Apply to paint your video, or Sell to list it.'}
              </p>
            </section>

            {/* player */}
            <section className="flex min-h-[420px] w-full flex-col rounded-3xl border bg-white p-4 shadow-sm lg:h-[calc(100vh-7.5rem)] lg:flex-1">
              <Player spec={spec} exporting={exporting} exportLabel={exportLabel} assets={assets} onExportingChange={onExportingChange} />
            </section>
          </div>
        )}

        {view === 'learn' && <LearnView onLoadCode={loadIntoEditor} />}

        {view === 'market' && (
          <Marketplace onImportStyle={importStyle} onLoadTemplate={loadTemplate} assets={assets} />
        )}

        {view === 'history' && (
          <HistoryView
            sessions={sessions}
            version={sessionVersion}
            onLoad={(code, kind) => {
              loadIntoEditor(code, kind);
              toast.success(`Session loaded into the ${kind === 'scene' ? 'SceneLang' : 'StyleKit'} editor`);
            }}
          />
        )}
      </main>

      <footer className="mt-auto border-t bg-white/70 py-4">
        <p className="text-center text-[12px] text-zinc-400">
          SceneLang Studio — you write the code, the compiler films it. Two languages · a learner · a marketplace · your files.
        </p>
      </footer>

      {/* dialogs */}
      <PublishDialog
        key={publishKind}
        open={publishOpen}
        onOpenChange={setPublishOpen}
        kind={publishKind}
        code={publishKind === 'style' ? styleCode : sceneCode}
        onPublished={() => setView('market')}
      />
    </div>
  );
}
