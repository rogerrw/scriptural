import Link from 'next/link';
import { loadReviewSession } from '@/actions/loadReviewSession';
import { parseReviewSessionRequest } from '@/lib/reviewSession';
import ReviewSession from './ReviewSession';

type SearchParams = { [key: string]: string | string[] | undefined };

const ReviewPage = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  const reviewSession = await loadReviewSession(parseReviewSessionRequest(await searchParams));

  if (reviewSession.status === 'no-verses') {
    return (
      <div className="fadein flex flex-col items-center gap-4 py-16">
        <p>You have no saved verses.</p>
        <Link href="/search" className="underline">
          Search for a verse
        </Link>
      </div>
    );
  }

  if (reviewSession.status === 'nothing-due') {
    return (
      <div className="fadein flex flex-col items-center gap-4 py-16">
        <p>Nothing is due.</p>
        {reviewSession.soonestDue === null ? null : (
          <p className="font-mono">Next due {reviewSession.soonestDue}</p>
        )}
      </div>
    );
  }

  return (
    <ReviewSession
      sessionId={reviewSession.sessionId}
      verses={reviewSession.verses}
      finished={reviewSession.finished}
    />
  );
};

export default ReviewPage;
