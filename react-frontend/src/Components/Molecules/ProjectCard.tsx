import { Card, CardActions, CardContent, CardMedia } from '@mui/material';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../utils/types';
import Button from '../Atoms/Button';
import './ProjectCard.scss';

type ProjectCardType = {
  project: Project;
};

const ProjectCard: React.FC<ProjectCardType> = ({ project }) => {
  const { image, title, description, id } = project;

  return (
    <Card className='project-card'>
      <CardMedia component='img' height='300' image={image} alt={title} />
      <CardContent className='project-content'>
        <h3>{title}</h3>
        <p>{description}</p>
      </CardContent>
      <CardActions className='project-bottom'>
        <div className='fade' />
        <Link className='link' to=''>
          See the project
        </Link>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
