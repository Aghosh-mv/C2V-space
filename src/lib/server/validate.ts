import { z } from 'zod';
import { parseSceneLang } from '@/lib/scenelang/parser';
import { parseStyleKit } from '@/lib/scenelang/stylekit';

// Every client is an anonymous id the browser generates once and keeps.
// A well-formed one is 8–64 chars of [A-Za-z0-9_-].
export const clientIdSchema = z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/);

export const kindSchema = z.enum(['style', 'template', 'effect', 'video']);

export const MAX_CODE_BYTES = 131_072; // 128 KB of code — far beyond any real scene

/** Guard against control characters smuggled into stored text. */
function noControlChars(s: string) {
  return !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s);
}

export const listingInputSchema = z.object({
  clientId: clientIdSchema,
  kind: kindSchema,
  title: z.string().trim().min(1, 'a name is required').max(80, 'keep the name under 80 characters').refine(noControlChars, 'control characters are not allowed'),
  author: z.string().trim().min(1, 'an author name is required').max(40, 'keep the author name under 40 characters').refine(noControlChars, 'control characters are not allowed'),
  description: z.string().trim().max(280, 'keep the description under 280 characters').refine(noControlChars, 'control characters are not allowed'),
  price: z.number().int().min(0).max(999),
  code: z.string().min(1, 'the listing has no code').max(MAX_CODE_BYTES, 'code over 128 KB — split it up').refine(noControlChars, 'control characters are not allowed'),
});

export type ListingInput = z.infer<typeof listingInputSchema>;

export const syncInputSchema = z.object({
  clientId: clientIdSchema,
  sceneCode: z.string().max(MAX_CODE_BYTES),
  styleCode: z.string().max(MAX_CODE_BYTES),
});

export const sessionInputSchema = z.object({
  clientId: clientIdSchema,
  kind: z.enum(['scene', 'style']),
  code: z.string().trim().min(1).max(MAX_CODE_BYTES).refine(noControlChars, 'control characters are not allowed'),
});

export const purchaseInputSchema = z.object({ clientId: clientIdSchema });

/**
 * Server-side acceptance check for a listing. The parsers are pure
 * TypeScript, so the server can genuinely reject broken code instead of
 * trusting the client. Effects are free-standing fragments appended to
 * existing code, so they only get the basic checks (they cannot be parsed
 * in isolation); styles and templates are fully parsed.
 */
export function validateListingCode(kind: ListingInput['kind'], code: string): string | null {
  if (kind === 'style') {
    const result = parseStyleKit(code);
    if (!result.name) return 'StyleKit code needs a name line:  style my-look';
    if (!result.tokens) return 'StyleKit code has no base — declare bg and ink';
    if (result.errors.length > 0) return `StyleKit code does not parse: ${result.errors[0].message}`;
    return null;
  }
  if (kind === 'template' || kind === 'video') {
    const result = parseSceneLang(code);
    if (!result.spec || result.spec.scenes.length === 0) {
      return 'SceneLang code has no scenes — declare at least one:  scene intro (3s)';
    }
    // the "no theme declared" notice is advisory (bare render is allowed);
    // anything else is a real parse error
    const hard = result.errors.find((e) => !/no theme declared/i.test(e.message));
    if (hard) return `SceneLang code does not parse: ${hard.message}`;
    return null;
  }
  return null; // effect packs: fragments, basic size/char checks only
}

/** Flatten a ZodError into one readable line for the API error shape. */
export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'invalid input';
}
