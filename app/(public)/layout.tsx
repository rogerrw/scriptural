import React from 'react';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="fadein">{children}</div>;
};

export default PublicLayout;
