import React from 'react';
import { Project } from '../../utils/types';
import Button from '../Atoms/Button';
import './ProjectCard.scss';

type ProjectCardType = {
  project: Project;
};

const ProjectCard: React.FC<ProjectCardType> = ({ project }) => {
  const { image, title, description, id } = project;
  return (
    <div className='project-card'>
      <img src={image} alt={title} className='project-image' />
      <h3>{title}</h3>
      <p>{description}</p>
      <Button
        onClick={() => console.log(`Voted for project #${id}`)}
        color={id === 0 ? 'secondary' : 'primary'} //We select the secondary color for the button with id 0
        outlined={id === 1} // The button will be outlined only if the project id is 1
      >
        Donate for this project
      </Button>
    </div>
  );
};

export default ProjectCard;
