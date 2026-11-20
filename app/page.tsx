import { loadHome } from '@/actions/loadHome';
import StoreBrowserTimezone from '@/app/StoreBrowserTimezone';
import { ReviewStreak } from '@/component-library/review-streak';
import { ReviewYearHeatmap } from '@/component-library/review-year-grid';
import { Card, CardHeader, CardTitle, CardContent } from '@/component-library/card';

const HomePage = async () => {
  const home = await loadHome();

  return (
    <div className="fadein mx-8">
      <StoreBrowserTimezone stored={home.timezone} />
      <p>Practiced verses: {home.practicedVerses}</p>
      <p>Completed review sessions: {home.completedReviewSessions}</p>
      <Card className="mt-8 border-none bg-transparent text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        <CardHeader>
          <CardTitle>Daily Review</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewStreak days={home.streak.days} />
        </CardContent>
      </Card>
      <Card className="mt-8 border-none bg-transparent text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        <CardHeader>
          <CardTitle>Verses Reviewed</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewYearHeatmap />
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
