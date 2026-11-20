import { NextRequest, NextResponse } from 'next/server';
import { fetchVerse } from '@/actions/fetchVerse';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const book = searchParams.get('book');
  const chapter = Number(searchParams.get('chapter'));
  const verse = Number(searchParams.get('verse'));
  const translation = searchParams.get('translation') ?? '';
  if (!book || !chapter || !verse || !translation) {
    return NextResponse.json('Required parameters: book, chapter, verse, translation', { status: 500 });
  }

  try {
    const result = await fetchVerse(book, chapter, verse, translation);
    return NextResponse.json({ id: result.id, [translation]: result.text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid verse';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
