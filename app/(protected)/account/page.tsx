'use client';

import { useState } from 'react';

const accountOptions = ['Profile', 'Email', 'Password', 'Notifications', 'Appearance'] as const;

type AccountOption = (typeof accountOptions)[number];

const AccountPage = () => {
  const [selected, setSelected] = useState<AccountOption>('Profile');

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
      <div>
        <p>{selected}</p>
        <p>This setting is not available yet.</p>
      </div>
    </div>
  );
};

export default AccountPage;
