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
  approvalLoading: boolean;
  donationLoading: boolean;
  txHash: string;
  isMember: boolean;
};
const DonateForm: React.FC<DonateFormProps> = ({
  open,
  onClose,
  onSubmit,
  approvalLoading,
  donationLoading,
  txHash,
  isMember,
}) => {
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
        {!!txHash ? (
          <div className='tx-success'>
            <p className='light-text'>Your donation has been sent! Thanks a lot!</p>
            <p className='check-tx'>
              You can check this transaction here :{' '}
              <a
                href={`https://mumbai.polygonscan.com/tx/
              ${txHash}`}
                target='_blank'
                rel='noreferrer'
              >
                mumbai.polygonscan.com/tx/{txHash}
              </a>
            </p>
            {isMember && (
              <p>
                Congratulations, you're now a member of D2R! You can propose projects and
                vote.
              </p>
            )}
          </div>
        ) : (
          <>
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
            </FormControl>
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
                    Every 40USDC donation will give you 1 vote to spend during voting
                    phase
                  </li>
                </>
              ) : (
                <li>It is not possible to become a member during voting phase</li>
              )}
            </ul>
          </>
        )}
        {approvalLoading && <p>Waiting for approval...</p>}
        {donationLoading && <p>Your donation is on its way, please wait...</p>}
      </DialogContent>
      <DialogActions className='action-btn'>
        {!txHash ? (
          <Button
            onClick={() => onSubmit(amount)}
            className='vote-btn'
            loading={approvalLoading || donationLoading}
          >
            Donate
          </Button>
        ) : (
          <Button onClick={onClose} className='vote-btn' variant='outlined'>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DonateForm;
