import { Card, CardActions, CardContent, CardMedia } from '@mui/material';
import { HowToVote, ThumbUp } from '@mui/icons-material';
import React, { useContext, useState } from 'react';
import { GlobalContext } from '../../utils/GlobalContext';
import { Member, Project } from '../../utils/types';
import Button from '../Atoms/Button';
import './ProjectCard.scss';
import VotesDialog from './VotesDialog';

type ProjectCardType = {
  project: Project;
  inMemberPage?: boolean;
  member?: Member | null;
};

const ProjectCard: React.FC<ProjectCardType> = ({ project, inMemberPage, member }) => {
  const { image, title, description, address, link = '' } = project;
  const { setAlert, voteForProject, isMember, roundStatus } = useContext(GlobalContext);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  return (
    <>
      <Card className='project-card'>
        {inMemberPage && roundStatus === 'vote' && (
          <div
            className='votes-per-project'
            onClick={() =>
              roundStatus !== 'vote'
                ? () => {}
                : !isMember
                ? setAlert({
                    open: true,
                    severity: 'info',
                    description: 'You need to be a member to vote',
                  })
                : !member?.votesRemaining
                ? setAlert({
                    open: true,
                    severity: 'info',
                    description:
                      'You do not have anymore votes, please contribute to the DAO to get more votes',
                  })
                : setOpenDialog(true)
            }
          >
            {project.votes ?? 0} <HowToVote />
          </div>
        )}
        <CardMedia
          component='img'
          height='300'
          image={image}
          src={!image ? '/bigLogo.png' : ''}
          alt={title}
        />
        <CardContent
          className={inMemberPage ? 'project-content big-card' : 'project-content'}
        >
          <h3>{title}</h3>
          <div className='description'>
            <p>{description}</p>
            {inMemberPage && (
              <>
                <p>
                  Project address :{' '}
                  <a
                    href={`https://mumbai.polygonscan.com/address/${project.address}`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {project.address}
                  </a>
                </p>
                <p>
                  Proposed by :{' '}
                  <a
                    href={`https://mumbai.polygonscan.com/address/${project.proposedBy}`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {project.proposedBy}
                  </a>
                </p>
              </>
            )}
          </div>
        </CardContent>
        <CardActions className='project-bottom'>
          {/* <div className='fade' /> */}

          {inMemberPage && roundStatus === 'vote' ? (
            <>
              <Button
                onClick={() =>
                  !isMember
                    ? setAlert({
                        open: true,
                        severity: 'info',
                        description: 'You need to be a member to vote',
                      })
                    : !member?.votesRemaining
                    ? setAlert({
                        open: true,
                        severity: 'info',
                        description:
                          'You do not have anymore votes, please contribute to the DAO to get more votes',
                      })
                    : setOpenDialog(true)
                }
                variant='text'
                className='link'
              >
                Vote for this project
              </Button>
              {member?.lastVotes.includes(project.address) && (
                <span className='light-text'>
                  You have already voted for this project
                </span>
              )}
            </>
          ) : (
            <a className='link' href={link} target='_blank' rel='noreferrer'>
              See the project
            </a>
          )}
        </CardActions>
      </Card>
      <VotesDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={(nbVote) => voteForProject(address, nbVote)}
        maxVotes={member?.votesRemaining ?? 0}
        title={title}
      />
    </>
  );
};

export default ProjectCard;
