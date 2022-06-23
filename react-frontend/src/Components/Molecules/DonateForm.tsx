import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Button from '../Atoms/Button';
import React, { useContext, useState } from 'react';
import './DonateForm.scss';
import { GlobalContext } from '../../utils/GlobalContext';

type DonateFormProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
};
const DonateForm: React.FC<DonateFormProps> = ({ open, onClose, onSubmit }) => {
  const { roundStatus } = useContext(GlobalContext);
  const [amount, setAmount] = useState<number>(0);
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' className='donate-dialog'>
      <DialogTitle className='form-title'>
        Contribute to D2R
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
        <p className='light-text'>Every donation is precious, thanks a lot!</p>
        <FormControl sx={{ m: 1, width: '100%' }} variant='outlined'>
          <OutlinedInput
            id='outlined-adornment-weight'
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
            endAdornment={<InputAdornment position='end'>USDC</InputAdornment>}
            aria-describedby='outlined-weight-helper-text'
            inputProps={{
              'aria-label': 'weight',
            }}
            type='number'
          />

          <ul className='info-list'>
            <li>
              Your donation will be sent using{' '}
              <span className='bold'>Mumbai Testnet (Polygon)</span>
            </li>
            {roundStatus === 'propose' ? (
              <>
                <li>
                  If you give 40USDC or more, you will become a member for this round
                </li>
                <li>
                  Every 40USDC donation will give you 1 vote to spend during voting phase
                </li>
              </>
            ) : (
              <li>It is not possible to become a member during voting phase</li>
            )}
          </ul>
        </FormControl>
      </DialogContent>
      <DialogActions className='action-btn'>
        <Button onClick={() => onSubmit(amount)} className='vote-btn'>
          Donate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DonateForm;
