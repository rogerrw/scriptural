import VerseTyper from '@/component-library/verseTyper';
import React from 'react';

const HomePage = () => {
  return (
    <div>
      <VerseTyper verseText={`Your word is a lamp to my feet and a light to my path.`} />
    </div>
  );
};

export default HomePage;
