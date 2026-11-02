'use client';

// SceneLang Studio — code that becomes video.
// Views: Studio (SceneLang + StyleKit editors), Learner, Marketplace.

import { useEffect, useMemo, useState } from 'react';
import {
  Clapperboard,
  BookOpen,
  Store,
  Sparkles,
  Wand2,
  PlayCircle,
  Palette,
  UploadCloud,
  LayoutTemplate,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/studio/code-editor';
import { Player } from '@/components/studio/player';
import { LearnView } from '@/components/studio/learn-view';
import { Marketplace, PublishDialog } from '@/components/studio/marketplace';
import { AiDialog } from '@/components/studio/ai-dialog';
import { parseSceneLang } from '@/lib/scenelang/parser';
import { parseStyleKit } from '@/lib/scenelang/stylekit';
import { addImportToCode, setThemeInCode } from '@/lib/scenelang/themes';
import { loadInstalledStyles, saveInstalledStyle } from '@/lib/scenelang/market';
import { WELCOME_SAMPLE, SAMPLES } from '@/lib/scenelang/samples';
import { formatDuration } from '@/lib/scenelang/parser';
import { cn } from '@/lib/utils';

type View = 'studio' | 'learn' | 'market';

const DEFAULT_STYLE = `// StyleKit — the language of looks.
// Edit a value and watch the preview restyle instantly.

style my-look
base aurora
bg #fafafc -> #edeaf7
ink #16161d
accents #16161d, #7c6cf0, #2bb59a, #f2925c
font sans
tracking 1
vignette 0.08
orbs 7`;

const SCENE_KEY = 'scenelang.scene';
const STYLE_KEY = 'scenelang.style';

export default function Page() {
  const [view, setView] = useState<View>('studio');
  const [sceneCode, setSceneCode] = useState(WELCOME_SAMPLE);
  const [styleCode, setStyleCode] = useState(DEFAULT_STYLE);
  const [debouncedScene, setDebouncedScene] = useState(WELCOME_SAMPLE);
  const [debouncedStyle, setDebouncedStyle] = useState(DEFAULT_STYLE);
  const [editorTab, setEditorTab] = useState<'scene' | 'style'>('scene');
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [publishKind, setPublishKind] = useState<'style' | 'template' | 'video'>('style');
  const [publishOpen, setPublishOpen] = useState(false);
  const [styleVersion, setStyleVersion] = useState(0);

  /* ------------------------- load & persist code ------------------------ */

  useEffect(() => {
    const id = setTimeout(() => {
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
      setDebouncedScene(sceneCode);
      window.localStorage.setItem(SCENE_KEY, sceneCode);
    }, 280);
    return () => clearTimeout(id);
  }, [sceneCode]);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedStyle(styleCode);
      window.localStorage.setItem(STYLE_KEY, styleCode);
      const result = parseStyleKit(styleCode);
      if (result.name && result.tokens) {
        saveInstalledStyle({ name: result.name, code: styleCode });
        setStyleVersion((v) => v + 1);
      }
    }, 280);
    return () => clearTimeout(id);
  }, [styleCode]);

  /* --------------------------- style pipeline --------------------------- */

  const styleResult = useMemo(() => parseStyleKit(debouncedStyle), [debouncedStyle]);

  const installedStyles = useMemo(() => {
    void styleVersion;
    // built-ins + marketplace-installed styles are already registered in themes
    return loadInstalledStyles().map((s) => s.name);
  }, [styleVersion]);

  /* --------------------------- scene pipeline --------------------------- */

  const { spec, errors } = useMemo(
    () => parseSceneLang(debouncedScene, installedStyles),
    [debouncedScene, installedStyles],
  );

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

  const loadIntoScene = (code: string) => {
    setSceneCode(code);
    setView('studio');
    setEditorTab('scene');
  };

  const onExportingChange = (busy: boolean, label: string) => {
    setExporting(busy);
    setExportLabel(label);
  };

  const compilerChip =
    spec.scenes.length > 0
      ? `${spec.scenes.length} scene${spec.scenes.length > 1 ? 's' : ''} · ${formatDuration(spec.totalMs)} · ${
          errors.length === 0 ? 'ready' : `${errors.length} issue${errors.length > 1 ? 's' : ''}`
        }`
      : 'write a scene to begin';

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
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all',
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
            <Button
              onClick={() => setAiOpen(true)}
              className="gap-1.5 rounded-full bg-violet-600 text-white shadow-sm hover:bg-violet-700"
              size="sm"
            >
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">AI write</span>
            </Button>
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
                  {editorTab === 'scene' ? (
                    <>
                      <select
                        aria-label="Load an example"
                        defaultValue=""
                        onChange={(e) => {
                          const s = SAMPLES.find((x) => x.id === e.target.value);
                          if (s) {
                            loadIntoScene(s.code);
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

              {editorTab === 'scene' ? (
                <CodeEditor code={sceneCode} onChange={setSceneCode} errors={errors} readOnly={exporting} language="scene" />
              ) : (
                <CodeEditor code={styleCode} onChange={setStyleCode} errors={styleResult.errors} readOnly={exporting} language="style" />
              )}

              <p className="border-t bg-zinc-50/70 px-4 py-2 text-[11.5px] text-zinc-400">
                {editorTab === 'scene'
                  ? 'SceneLang → video. Space plays, ↑↓ flip slides, every edit recompiles instantly.'
                  : 'StyleKit → the look. Press Apply to use this style in your video, or Sell to list it.'}
              </p>
            </section>

            {/* player */}
            <section className="flex min-h-[420px] w-full flex-col rounded-3xl border bg-white p-4 shadow-sm lg:h-[calc(100vh-7.5rem)] lg:flex-1">
              <Player spec={spec} exporting={exporting} exportLabel={exportLabel} onExportingChange={onExportingChange} />
            </section>
          </div>
        )}

        {view === 'learn' && <LearnView onLoadCode={loadIntoScene} />}

        {view === 'market' && (
          <Marketplace onImportStyle={importStyle} onLoadTemplate={loadTemplate} />
        )}
      </main>

      <footer className="mt-auto border-t bg-white/70 py-4">
        <p className="text-center text-[12px] text-zinc-400">
          SceneLang Studio — you write the code, the compiler films it. Two languages · a learner · a marketplace.
        </p>
      </footer>

      {/* dialogs */}
      <AiDialog open={aiOpen} onOpenChange={setAiOpen} currentCode={sceneCode} onCode={loadIntoScene} />
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
