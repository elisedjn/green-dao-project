import React from 'react';
import { Project } from '../../utils/types';
import Button from '../Atoms/Button';
import './ProjectCard.scss';

type ProjectCardType = {
  project: Project;
};

const ProjectCard: React.FC<ProjectCardType> = ({ project }) => {
  const { image, title, description, id } = project;
  const isMember = false;
  return (
    <div className='project-card'>
      <img src={image} alt={title} className='project-image' />
      <h3>{title}</h3>
      <p>{description}</p>
      {isMember ? (
        <Button
          onClick={() => console.log(`Voted for project #${id}`)}
          color={id === 0 ? 'secondary' : 'primary'} //We select the secondary color for the button with id 0
          variant={id === 1 ? 'contained' : 'outlined'} // The button will be outlined only if the project id is 1
        >
          Donate for this project
        </Button>
      ) : (
        <div>You need to be a member</div>
      )}
    </div>
  );
};

export default ProjectCard;
