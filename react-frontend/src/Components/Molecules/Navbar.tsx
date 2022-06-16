import React from 'react';
import './Navbar.scss';
import Button from '../Atoms/Button';
import { Link } from 'react-router-dom';

const Navbar: React.FC<{}> = () => {
  return (
    <div className='navbar'>
      <h3>ENVIDAO</h3>
      <div className='nav-links'>
      <Link to="/member">Go to Community Page</Link>
      <Button onClick={() => console.log('contributing')}>Contribute</Button>
      </div>
    </div>
  );
};

export default Navbar;
