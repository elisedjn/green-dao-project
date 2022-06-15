import React from 'react';
import './Navbar.scss';
import Button from '../Atoms/Button';

const Navbar: React.FC<{}> = () => {
  return (
    <div className='navbar'>
      <h3>ENVIDAO</h3>
      <Button onClick={() => console.log(`Voted for project`)}>Contribute Now</Button>
    </div>
  );
};

export default Navbar;
