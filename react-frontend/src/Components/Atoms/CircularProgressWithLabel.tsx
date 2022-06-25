import { CircularProgress, CircularProgressProps } from '@mui/material';
import React, { useEffect } from 'react';
import './CircularProgressWithLabel.scss';

const CircularProgressWithLabel = (
  props: CircularProgressProps & { maxValue: number; withETH?: boolean }
) => {
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const duration = props.maxValue > 50 ? 50 : 100;
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= props.maxValue
          ? props.maxValue
          : prevProgress + (props.maxValue > 50 ? 5 : 1)
      );
    }, duration);
    return () => {
      clearInterval(timer);
    };
  }, [props.maxValue]);

  const normalise = (value: number) => ((value - 0) * 100) / (props.maxValue - 0);

  return (
    <div className='circular-progress-with-label'>
      <CircularProgress
        variant='determinate'
        {...props}
        value={normalise(progress)}
        color='secondary'
        size={120}
      />
      <div className='progress-label'>
        {progress}
        {props.withETH && <span style={{ display: 'block' }}>USDC</span>}
      </div>
    </div>
  );
};

export default CircularProgressWithLabel;
