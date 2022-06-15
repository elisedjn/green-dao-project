import { Button as MUIButton } from '@mui/material';
import React from 'react';
import './Button.scss';

type ButtonType = {
  children: string;
  variant?: 'outlined' | 'text' | 'contained'; //This value is optional
  color?: 'primary' | 'secondary'; //This value is optional
  onClick: () => any;
};

const Button: React.FC<ButtonType> = ({
  onClick,
  variant = 'contained',
  color = 'primary',
  children,
}) => {
  // by default, outlined will be contained and color will be primary
  // children will be the value we put inbetween the Button tags <Button>This is the children</Button>
  return (
    <MUIButton className='DAO-button' onClick={onClick} variant={variant} color={color}>
      {children}
    </MUIButton>
  );
};

export default Button;
