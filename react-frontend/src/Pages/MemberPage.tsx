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
        {/* I copied this whole div over from the home page hoping it would format in the same way, with 2 sections side-by-side */}
        <div className='dao-description'>
          <div className='one-text'>
            <h5>Become a Member</h5>
            <p>
              D2R collects USDC donations into a funding pool that is split and
              distributed to the top 3 projects in each funding round, according to the
              percentage of votes each receives from our members. Membership is granted
              to donors who contribute at least 40 USDC to the pool for the current
              round, and members receive 1 voting credit per 40 USDC added.
              Contributions of less than 40 USDC are gratefully accepted, but do not
              return voting rights. Voting occurs during the last 7 days of every 4-week
              funding round. All funds in the pool are dispersed automatically at the close
              of each round, and any unspent voting credits will be cleared. The next round
              begins immediately at the close of the last.
            </p>
            <Button onClick={() => console.log('Donate!')}>Donate USDC</Button>
          </div>

          <div className='one-text'>
            <h5>Propose a Project to the Community</h5>
            <p>
              Members are encouraged to bring their favorite regenerative projects to
              the community be considered for funding. D2R accepts project proposals during
              the first 3 weeks of each round. A project can not be submitted more than once
              per round, but may be included in subsequent rounds regardless of previous
              funding awards. This is not done but that's all for tonight. Want to include
              some wording about start-up visibility, networking for project owners, building
              community in the ecosystem. (if phase = propose: display add project button, if
              phase = vote: display 'Projects can not be added while voting is live. Come
              back to add your project in the next round!' - maybe in a lil box?)
            </p>
            <Button onClick={() => console.log('Join!')}>Add a Project</Button>
          </div>
        </div>
        {/* <div className='dao-rules'>
          <p>
            Short sweet description of the DAO without getting too deep on to make it
            approachable for people that don’t know much about crypto but also touch on
            the benefits of donating more to become a full member with proposal and voting
            rights
          </p>
          <p>
            Find a way to creatively display this info so it’s not too text heavy neque, a
            venenatis ante mattis sit amet. Pellentesque ut magna eget tortor mollis
            lacinia quis quis massa.sdkfaçlkfjaksfjãf
          </p>
        </div> */}
        <div className='highlighted-projects'>
          <Subtitle>Explore the projects we are considering for this round of funding!</Subtitle>
          <p>(if phase = propose, display 'Votes can not be cast during the proposal phase. More projects may be added!')</p>
          <p>(if phase = voting, display 'Voting phase is now open. Cast your votes!')</p>
          <div className='projects-list'>
            {currentProjects.map((project, index) => (
              <ProjectCard project={project} key={index} inMemberPage member={member} />
            ))}
          </div>
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
