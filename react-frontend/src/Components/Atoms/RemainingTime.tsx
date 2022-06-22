import React from 'react';
import './RemainingTime.scss';

const ONE_DAY = 24 * 3600 * 1000;
const ONE_HOUR = 3600 * 1000;
const ONE_MINUTE = 60 * 1000;
const ONE_SECOND = 1000;

const RemainingTime = ({ time, isVote }: { time: number; isVote: boolean }) => {
  const days = Math.floor(time / ONE_DAY);
  const hours = Math.floor((time - days * ONE_DAY) / ONE_HOUR);
  const minutes = Math.floor((time - days * ONE_DAY - hours * ONE_HOUR) / ONE_MINUTE);
  const seconds = Math.floor(
    (time - days * ONE_DAY - hours * ONE_HOUR - minutes * ONE_MINUTE) / ONE_SECOND
  );

  return (
    <div className='remaining-time'>
      <span>
        {days} days {hours} hours {minutes} minutes {seconds} seconds
      </span>{' '}
      {isVote
        ? 'until voting closes and the next round opens'
        : 'until proposals close and voting begins'}
    </div>
  );
};

export default RemainingTime;
