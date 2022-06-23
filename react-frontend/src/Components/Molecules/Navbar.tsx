import React, { useContext } from 'react';
import './Navbar.scss';
import Button from '../Atoms/Button';
import { Link } from 'react-router-dom';
import PlanetIcon from '../Atoms/PlanetIcon';
import { GlobalContext } from '../../utils/GlobalContext';

type NavbarProps = {
  onMemberPage?: boolean;
};

const Navbar: React.FC<NavbarProps> = ({ onMemberPage = false }) => {
  const { isConnected, connectWallet, setOpenDonationForm } = useContext(GlobalContext);

  return (
    <div className='navbar'>
      <Link to='/' className='home-link'>
        <div className='icon'>
          <PlanetIcon />
        </div>
        <div className='D2R-name'>
          <h3>D2R</h3>
          <span>DonateToRegenerate</span>
        </div>
      </Link>
      <div className='nav-links'>
        <Button
          className='navbar-btn'
          onClick={() => setOpenDonationForm(true)}
          color='primary'
        >
          Contribute
        </Button>
        {onMemberPage ? (
          isConnected ? (
            <div>Your are connected!</div>
          ) : (
            <Button onClick={connectWallet} variant='text' className='link'>
              Connect your wallet
            </Button>
          )
        ) : (
          <Link to='/member' className='link'>
            Go to Community Page
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
