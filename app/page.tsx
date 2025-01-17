import VerseTyper from '@/component-library/verseTyper';
import React from 'react';

const HomePage = () => {
  return (
    <div>
      <VerseTyper
        verseText={`Then I saw thrones, and seated on them were those to whom the authority to judge was committed. Also I saw the souls of those who had been beheaded for the testimony of Jesus and for the word of God, and those who had not worshiped the beast or its image and had not received its mark on their foreheads or their hands. They came to life and reigned with Christ for a thousand years.`}
      />
    </div>
  );
};

export default HomePage;
