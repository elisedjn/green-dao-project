import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import React, { useContext } from 'react';
import Button from '../Atoms/Button';
import './DAORules.scss';
import { GlobalContext } from '../../utils/GlobalContext';

const DAORules = ({
  setOpenProjectForm,
}: {
  setOpenProjectForm: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { roundStatus, setOpenDonationForm, isMember, setAlert } =
    useContext(GlobalContext);
  return (
    <div className='dao-rules'>
      <p>
        D2R collects USDC donations into a funding pool that is split and distributed to
        the top 3 projects in each funding round, according to the percentage of votes
        each receives from our members.
      </p>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls='panel1a-content'
          id='panel1a-header'
        >
          <h5>Become a member</h5>
        </AccordionSummary>
        <AccordionDetails className='details'>
          <ul>
            <li>
              Membership is granted to donors who contribute{' '}
              <span className='bold'>at least 40 USDC </span>
              to the pool for the current round.
            </li>
            <li>
              Members receive <span className='bold'>1 voting credit per 40 USDC</span>{' '}
              added.
            </li>
            <li>
              It's possible to
              <span className='bold'> become a member only during proposal phase</span>,
              but donations are accepted anytime.
            </li>
            <li>
              Once you are a member,
              <span className='bold'>
                {' '}
                you can buy vote credits during proposal phase only
              </span>
              .
            </li>
            <li>
              Contributions of less than 40 USDC are{' '}
              <span className='bold'>gratefully accepted</span>, but do not return voting
              rights.
            </li>
            <li>
              Voting occurs during <span className='bold'>the last 7 days</span> of every
              4-week funding round.
            </li>
            <li>
              All funds in the pool are dispersed automatically at the close of each
              round, and any{' '}
              <span className='bold'>unspent voting credits will be cleared.</span>
            </li>
            <li>
              The <span className='bold'>next round begins immediately</span> at the close
              of the last.
            </li>
          </ul>
          <Button onClick={() => setOpenDonationForm(true)}>Donate USDC</Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls='panel2a-content'
          id='panel2a-header'
        >
          <h5>Propose a Project to the Community</h5>
        </AccordionSummary>
        <AccordionDetails className='details'>
          <ul>
            <li>
              Members are encouraged to bring their{' '}
              <span className='bold'>
                favorite regenerative projects to the community
              </span>{' '}
              be considered for funding.
            </li>
            <li>
              Project representatives are invited to join the community and introduce
              their own projects!
            </li>
            <li>
              D2R accepts project proposals during{' '}
              <span className='bold'>the first 3 weeks</span> of each round. Projects can
              not be added while voting is live.
            </li>
            <li>
              Members must contribute a minimum of 40 USDC to the current round{' '}
              <span className='bold'>before</span> adding a project.
            </li>
            <li>
              A project{' '}
              <span className='bold'>can not be submitted more than once per round</span>,
              but may be included in subsequent rounds regardless of previous funding
              awards.
            </li>
            <li>
              The 3 projects receiving the most votes during each round will be funded and
              added to our home page.
            </li>
            <li>
              Proposed projects will be cleared at the close of each round; the next round
              will start with a blank slate.
            </li>
          </ul>
          {roundStatus === 'propose' ? (
            <Button
              onClick={() =>
                !isMember
                  ? setAlert({
                      open: true,
                      description: 'You need to be a member to propose a project',
                    })
                  : setOpenProjectForm(true)
              }
            >
              Add a Project
            </Button>
          ) : (
            <div>
              Projects can not be added while voting is live. Come back to add your
              project in the next round!
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default DAORules;
