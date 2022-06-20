import { Button as MUIButton } from '@mui/material';
import React, { ReactNode } from 'react';
import './Button.scss';

type ButtonType = {
  children: ReactNode;
  variant?: 'outlined' | 'text' | 'contained'; //This value is optional
  color?: 'primary' | 'secondary'; //This value is optional
  onClick: () => any;
  className?: string;
  disabled?: boolean;
};

const Button: React.FC<ButtonType> = ({
  onClick,
  variant = 'contained',
  color = 'primary',
  children,
  className = '',
  disabled = false,
}) => {
  // by default, outlined will be contained and color will be primary
  // children will be the value we put inbetween the Button tags <Button>This is the children</Button>
  return (
    <MUIButton
      className={['DAO-button', className].join(' ')}
      onClick={onClick}
      variant={variant}
      color={color}
      disabled={disabled}
    >
      {children}
    </MUIButton>
  );
};

export default Button;
