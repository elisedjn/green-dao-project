import React from 'react';
import ChainShotLogo from '../Atoms/ChainShotLogo';
import './Footer.scss';

const Footer: React.FC<{}> = () => {
  return (
    <div className='footer'>
      <div className='footer-links'>
        <h4>Brought to you by :</h4>
        <a target='_blank' href='https://github.com/CJ-Rose/' rel='noreferrer'>
          Colleen
        </a>
        <span> - </span>
        <a target='_blank' href='https://github.com/elisedjn/' rel='noreferrer'>
          Elise
        </a>
        <span> - </span>
        <a target='_blank' href='https://github.com/rbchapman/' rel='noreferrer'>
          Riley
        </a>
      </div>
      <div>
        <a target='_blank' href='https://www.chainshot.com/' rel='noreferrer'>
          <ChainShotLogo />
        </a>
      </div>
    </div>
  );
};

export default Footer;
