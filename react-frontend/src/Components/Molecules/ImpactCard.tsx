import React from 'react';
import CircularProgressWithLabel from '../Atoms/CircularProgressWithLabel';
import './ImpactCard.scss';

type ImpactCardProps = {
  balance: number;
  members: number;
  projectsContributed: number;
  donators: number;
  alreadySent: number;
};

const ImpactCard: React.FC<ImpactCardProps> = ({
  balance,
  members,
  projectsContributed,
  donators,
  alreadySent,
}) => {
  return (
    <div className='impact-card'>
      <div className='first-line'>
        <div className='one-element'>
          <CircularProgressWithLabel maxValue={projectsContributed} />
          <h5>projects contributions</h5>
        </div>
        <div className='one-element'>
          <CircularProgressWithLabel maxValue={alreadySent} withETH />
          <h5>already distributed</h5>
        </div>
        <div className='one-element'>
          <CircularProgressWithLabel maxValue={balance} withETH />
          <h5>ready to be donated</h5>
        </div>
      </div>
      <div className='second-line'>
        <div className='one-element'>
          <CircularProgressWithLabel maxValue={members} />
          <h5>active members</h5>
        </div>
        <div className='one-element'>
          <CircularProgressWithLabel maxValue={donators} />
          <h5>anonymous donators</h5>
        </div>
      </div>
    </div>
  );
};

export default ImpactCard;
