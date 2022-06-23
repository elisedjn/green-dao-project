import React from 'react';
import './Subtitle.scss';

type SubtitleProps = {
  children: React.ReactNode;
};

const Subtitle: React.FC<SubtitleProps> = ({ children }) => {
  return (
    <div className='subtitle'>
      <h3>{children}</h3>
    </div>
  );
};

export default Subtitle;
