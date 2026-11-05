import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-teal-400 text-white shadow-md">
        <Clapperboard className="h-6 w-6" />
      </span>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">This page never got rendered</h1>
      <p className="max-w-md text-[13.5px] leading-relaxed text-zinc-500">
        There is no scene at this address. The studio, though, is exactly where you left it.
      </p>
      <Button asChild className="rounded-full bg-violet-600 text-white hover:bg-violet-700">
        <Link href="/">Open the studio</Link>
      </Button>
    </div>
  );
}
