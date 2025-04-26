import React from 'react';

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="fadein mx-8">{children}</div>;
};

export default PrivateLayout;
