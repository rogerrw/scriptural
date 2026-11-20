'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateReviewSettings } from '@/actions/reviewSettings';
import { FormError, FormSuccess } from '@/app/ui/formMessage';
import { Button } from '@/component-library/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/component-library/form';
import { Input } from '@/component-library/input';
import { REVIEW_LIMIT_MAX, REVIEW_LIMIT_MIN } from '@/lib/reviewSettings';
import { cn } from '@/lib/utils';

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

const ReviewSettingsFormSchema = z.object({
  reviewLimit: z.number().int().min(REVIEW_LIMIT_MIN).max(REVIEW_LIMIT_MAX),
  timezone: z.string(),
});

const ReviewSection = ({ reviewLimit, timezone }: AccountSectionsProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const form = useForm<z.infer<typeof ReviewSettingsFormSchema>>({
    resolver: zodResolver(ReviewSettingsFormSchema),
    defaultValues: { reviewLimit, timezone: timezone ?? '' },
  });

  const onSubmit = (values: z.infer<typeof ReviewSettingsFormSchema>) => {
    setSaving(true);
    void updateReviewSettings({
      reviewLimit: values.reviewLimit,
      timezone: values.timezone === '' ? undefined : values.timezone,
    }).then((result) => {
      setSaving(false);
      setError('error' in result ? result.error : undefined);
      setSuccess('success' in result ? result.success : undefined);
    });
  };

  return (
    <Form {...form}>
      <form id="review-settings" className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormError message={error} />
        <FormSuccess message={success} />
        <FormField
          control={form.control}
          name="reviewLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verses per review session</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={REVIEW_LIMIT_MIN}
                  max={REVIEW_LIMIT_MAX}
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="America/Los_Angeles" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="self-start" disabled={saving} type="submit">
          Save
        </Button>
      </form>
    </Form>
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
            className={cn('px-3 py-2 text-left', selected === option ? 'font-medium' : 'opacity-60')}
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
