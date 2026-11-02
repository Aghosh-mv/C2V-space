import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const GRAMMAR = `You write SceneLang — a plain-word language that compiles into rendered videos.

FULL GRAMMAR (only these lines are valid):
video <width>x<height> [<fps>fps]        e.g. video 1280x720 30fps  (or 720x1280 for vertical)
theme <name>                              aurora (soft premium, default) or swiss (clean minimal), or an imported style name
import <style-name>                       pulls in a marketplace style; place ABOVE the theme line
scene <name> (<seconds>s) [<enter>]       enter: fade | fade-up | slide-left | slide-right | zoom-in
  bg gradient <hex> -> <hex> [pulse]
  bg solid <hex>
  bg grid
  title "<text>" [kinetic|typewriter|pop|fade|fade-up]
  subtitle "<text>" [typewriter|fade|fade-up|pop]
  text "<text>" [fade|fade-up]
  bars {Label:12, Label:30} [grow]
  pie {Label:30, Label:70} [spin]
  image <url> [zoom-in|pan|fade]
  shape circle|ring|rect
  Comments start with //  (they are encouraged to label sections)

RULES:
- Output ONLY raw SceneLang code. No markdown fences, no explanations.
- 4-8 scenes, 2.5-5s each, unless the user asks otherwise.
- Default to theme aurora and video 1280x720 30fps unless asked.
- Style feel: smooth, swift, premium, light. NEVER dark neon, no glowing cyber colors.
- Bars/pie data must be plausible numbers.
- Only use image URLs the user explicitly provided; otherwise skip images.
- Write text in the same language the user writes in.
- Escape any double quote inside text as \\"`;

function stripFences(raw: string): string {
  const m = raw.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  const code = m ? m[1] : raw;
  return code.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { mode?: string; prompt?: string; currentCode?: string };
    const mode = body.mode ?? 'describe';
    const prompt = (body.prompt ?? '').slice(0, 4000);
    const currentCode = (body.currentCode ?? '').slice(0, 8000);

    let user: string;
    if (mode === 'outline') {
      user = `Convert this outline into a SceneLang video. Each heading/bullet group becomes one scene:\n\n${prompt}`;
    } else if (mode === 'improve') {
      user = `Rewrite and improve this SceneLang video: smoother pacing, cleaner wording, better scene flow. Keep the author's intent and language.\n\n${currentCode}`;
    } else {
      user = `Write a SceneLang video for this request:\n\n${prompt}`;
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: GRAMMAR },
        { role: 'user', content: user },
      ],
      thinking: { type: 'disabled' },
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const code = stripFences(raw);
    if (!code) {
      return NextResponse.json({ error: 'The AI returned an empty draft — try again.' }, { status: 502 });
    }
    return NextResponse.json({ code });
  } catch (err) {
    console.error('AI route error:', err);
    return NextResponse.json({ error: 'The AI writer is unavailable right now — try again in a moment.' }, { status: 500 });
  }
}
