import React from 'react';
import './Footer.scss';
import { Link } from 'react-router-dom';

// type FooterType = {
//   children: Link;
// };

const Footer: React.FC<{}> = () => {
  return (
    <div className='footer'>
      <div className='footer-links'>
        <h4>Brought to you by:</h4>
          <a target="_blank" href="https://github.com/CJ-Rose/" rel='noreferrer'>
            Colleen
          </a>
          <a target="_blank" href="https://github.com/elisedjn/" rel='noreferrer'>
            Elise
          </a>
          <a target="_blank" href="https://github.com/rbchapman/" rel='noreferrer'>
            Riley
          </a>
      </div>
    </div>

  );
};

export default Footer;
