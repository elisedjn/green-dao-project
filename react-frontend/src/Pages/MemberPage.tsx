import React, { useContext, useState } from 'react';
import Button from '../Components/Atoms/Button';
import Subtitle from '../Components/Atoms/Subtitle';
import ProjectCard from '../Components/Molecules/ProjectCard';
import Navbar from '../Components/Molecules/Navbar';
import Footer from '../Components/Molecules/Footer';
import './MemberPage.scss';
import ProjectForm from '../Components/Molecules/ProjectForm';
import { GlobalContext } from '../utils/GlobalContext';

const MemberPage = () => {
  const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);

  const { currentProjects, submitNewProject } = useContext(GlobalContext);

  return (
    <div className='member-page'>
      <Navbar onMemberPage />
      <div className='inner-page'>
        <Subtitle>Donate to Regenerate Rules</Subtitle>
        <div className='dao-rules'>
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
        </div>
        <div className='highlighted-projects'>
          <Subtitle>Projects up for Proposal</Subtitle>
          <div className='projects-list'>
            {currentProjects.map((project, index) => (
              <ProjectCard project={project} key={index} allowVote />
            ))}
          </div>
          <Button onClick={() => setOpenProjectForm(true)}>Propose a Project</Button>
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
