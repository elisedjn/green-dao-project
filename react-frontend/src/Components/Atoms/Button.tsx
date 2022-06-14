import { Button as MUIButton } from '@mui/material';
import React from 'react';
import './Button.scss';

type ButtonType = {
  children: string;
  outlined?: boolean; //This value is optional
  color?: 'primary' | 'secondary'; //This value is optional
  onClick: () => any;
};

const Button: React.FC<ButtonType> = ({
  onClick,
  outlined = false,
  color = 'primary',
  children,
}) => {
  // by default, outlined will be false and color will be primary
  // children will be the value we put inbetween the Button tags <Button>This is the children</Button>
  return (
    <MUIButton
      className='button'
      onClick={onClick}
      variant={outlined ? 'outlined' : 'contained'}
      color={color}
    >
      {children}
    </MUIButton>
  );
};

export default Button;
