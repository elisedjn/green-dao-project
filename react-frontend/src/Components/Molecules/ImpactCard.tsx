import React, { useContext } from 'react';
import { DAOImpact } from '../../utils/types';
import CircularProgressWithLabel from '../Atoms/CircularProgressWithLabel';
import './ImpactCard.scss';

const ImpactCard: React.FC<DAOImpact> = ({
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
          <h5>projects contributed to</h5>
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
