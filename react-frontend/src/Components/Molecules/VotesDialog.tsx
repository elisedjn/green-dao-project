import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Button from '../Atoms/Button';
import './VotesDialog.scss';

type VotesDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (voteNb: number) => void;
  maxVotes: number;
  title: string;
};

const VotesDialog: React.FC<VotesDialogProps> = ({
  open,
  onClose,
  onSubmit,
  maxVotes,
  title,
}) => {
  const [voteNb, setVoteNb] = useState<number>(0);

  const handleSubmit = () => {
    if (voteNb > 0 && voteNb <= maxVotes) {
      onSubmit(voteNb);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' className='vote-dialog'>
      <DialogTitle className='form-title'>
        {title}
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className='vote-counter'>
          <Button
            variant='outlined'
            className='counter-btn minus-btn'
            disabled={voteNb === 0}
            onClick={() => setVoteNb(voteNb - 1)}
          >
            -
          </Button>
          <div className='vote-nb'>{voteNb}</div>
          <Button
            variant='outlined'
            className='counter-btn plus-btn'
            onClick={() => setVoteNb(voteNb + 1)}
            disabled={voteNb === maxVotes}
          >
            +
          </Button>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} className='vote-btn'>
          VOTE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VotesDialog;
