'use client';

import { useState } from 'react';
import { updateReviewSettings } from '@/actions/reviewSettings';
import { FormError, FormSuccess } from '@/app/ui/formMessage';
import { Button } from '@/component-library/button';
import { Input } from '@/component-library/input';
import { Label } from '@/component-library/label';
import { REVIEW_LIMIT_MAX, REVIEW_LIMIT_MIN } from '@/lib/reviewSettings';

const accountOptions = [
  'Review',
  'Profile',
  'Email',
  'Password',
  'Notifications',
  'Appearance',
] as const;

type AccountOption = (typeof accountOptions)[number];

type AccountSectionsProps = {
  reviewLimit: number;
  timezone: string | null;
};

const ReviewSection = ({ reviewLimit, timezone }: AccountSectionsProps) => {
  const [limit, setLimit] = useState(String(reviewLimit));
  const [zone, setZone] = useState(timezone ?? '');
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  return (
    <div id="review-settings" className="flex flex-col gap-4">
      <FormError message={error} />
      <FormSuccess message={success} />
      <div>
        <Label htmlFor="reviewLimit">Verses per review session</Label>
        <Input
          id="reviewLimit"
          type="number"
          min={REVIEW_LIMIT_MIN}
          max={REVIEW_LIMIT_MAX}
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="timezone">Timezone</Label>
        <Input
          id="timezone"
          value={zone}
          onChange={(event) => setZone(event.target.value)}
          placeholder="America/Los_Angeles"
        />
      </div>
      <Button
        className="self-start"
        disabled={saving}
        onClick={() => {
          setSaving(true);
          void updateReviewSettings({
            reviewLimit: Number(limit),
            timezone: zone === '' ? undefined : zone,
          }).then((result) => {
            setSaving(false);
            setError('error' in result ? result.error : undefined);
            setSuccess('success' in result ? result.success : undefined);
          });
        }}
      >
        Save
      </Button>
    </div>
  );
};

const AccountSections = ({ reviewLimit, timezone }: AccountSectionsProps) => {
  const [selected, setSelected] = useState<AccountOption>('Review');

  return (
    <div className="fadein flex gap-8">
      <nav className="flex w-48 flex-col gap-1">
        {accountOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelected(option)}
            className={`px-3 py-2 text-left ${selected === option ? 'font-medium' : 'opacity-60'}`}
          >
            {option}
          </button>
        ))}
      </nav>
      <div className="flex flex-col gap-4">
        <p>{selected}</p>
        {selected === 'Review' ? (
          <ReviewSection reviewLimit={reviewLimit} timezone={timezone} />
        ) : (
          <p>This setting is not available yet.</p>
        )}
      </div>
    </div>
  );
};

export default AccountSections;
