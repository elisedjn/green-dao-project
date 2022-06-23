import React, { useContext, useState } from 'react';
import Button from '../Components/Atoms/Button';
import Subtitle from '../Components/Atoms/Subtitle';
import ProjectCard from '../Components/Molecules/ProjectCard';
import Navbar from '../Components/Molecules/Navbar';
import Footer from '../Components/Molecules/Footer';
import './MemberPage.scss';
import ProjectForm from '../Components/Molecules/ProjectForm';
import { GlobalContext } from '../utils/GlobalContext';
import RemainingTime from '../Components/Atoms/RemainingTime';
import DAORules from '../Components/Molecules/DAORules';

const MemberPage = () => {
  const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);

  const {
    currentProjects,
    submitNewProject,
    isMember,
    roundStatus,
    member,
    setAlert,
    timeVal,
  } = useContext(GlobalContext);

  return (
    <div className='member-page'>
      <Navbar onMemberPage />
      <RemainingTime time={timeVal} isVote={roundStatus === 'vote'} />
      <div className='inner-page'>
        <Subtitle>Join the D2R Community</Subtitle>
        <DAORules setOpenProjectForm={setOpenProjectForm} />
        <div className='highlighted-projects'>
          <div className='subtitle'>
            <Subtitle>Explore the projects for this round of funding!</Subtitle>
          </div>
          {roundStatus === 'propose' ? (
            <p className='light-text'>
              Votes can not be cast during the proposal phase. More projects may be added!
            </p>
          ) : (
            <>
              <p className='light-text'>
                Voting phase is now open.{' '}
                {isMember && (
                  <span>
                    You have{' '}
                    <span className='bold'>
                      {member?.votesRemaining ?? 0} vote
                      {(member?.votesRemaining ?? 0) > 1 && 's'}
                    </span>{' '}
                    remaining.
                  </span>
                )}{' '}
                Cast your votes!
              </p>
              {isMember && (
                <Button onClick={console.log} className='get-more-votes' variant='text'>
                  Get more votes
                </Button>
              )}
            </>
          )}
          {!currentProjects.length && (
            <div className='no-project'>
              There is no project proposed yet for this round. If you're a member, feel
              free to add one!
            </div>
          )}
          {roundStatus === 'propose' && (
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
              Propose a Project
            </Button>
          )}
          <div className='projects-list'>
            {currentProjects.map((project, index) => (
              <ProjectCard project={project} key={index} inMemberPage member={member} />
            ))}
          </div>
        </div>
        <ProjectForm
          open={openProjectForm}
          onSubmit={submitNewProject}
          handleClose={() => setOpenProjectForm(false)}
        />
      </div>
      <Footer />
    </div>
  );
};

export default MemberPage;
