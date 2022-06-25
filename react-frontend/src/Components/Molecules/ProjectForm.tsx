import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, { useContext, useState } from 'react';
import { Project } from '../../utils/types';
import Button from '../Atoms/Button';
import './ProjectForm.scss';
import { GlobalContext } from '../../utils/GlobalContext';

type ProjectFormProps = {
  open: boolean;
  handleClose: () => any;
  onSubmit: (project: Project) => any;
};

const ProjectForm: React.FC<ProjectFormProps> = ({ open, handleClose, onSubmit }) => {
  const { uploadImageToIPFS, setAlert } = useContext(GlobalContext);
  const [project, setProject] = useState<Project>({
    title: '',
    description: '',
    image: '',
    link: '',
    address: '',
  });

  const [errors, setErrors] = useState<string[]>([]);

  const [newImageSrc, setNewImageSrc] = useState<string>('/addimage.png');

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = e.target.id;
    const value = e.target.value;
    const newErrors = errors.filter((f) => f !== field);
    setErrors(newErrors);
    setProject((p) => ({ ...p, [field]: value }));
  };

  const handleAddImage = async (e: any) => {
    setNewImageSrc('/loading.gif');
    e.preventDefault();
    const file = e.target.files[0];
    const url = await uploadImageToIPFS(file);
    setProject((p) => ({ ...p, image: url }));
    setNewImageSrc(url);
  };

  const checkErrors = () => {
    if (!project.title) {
      setErrors((e) => [...e, 'title']);
    }
    if (!project.description) {
      setErrors((e) => [...e, 'description']);
    }
    if (!project.address) {
      setErrors((e) => [...e, 'address']);
    }
    if (!project.link) {
      setErrors((e) => [...e, 'link']);
    }
  };

  const handleSubmit = async () => {
    try {
      checkErrors();
      console.log('errors', errors);
      if (errors.length > 0) return;
      const success = await onSubmit(project);
      if (success) {
        handleClose();
        setAlert({
          description:
            'Your project has been accepted, thank you! It will shortly be shown on the list.',
          severity: 'success',
          open: true,
        });
      }
    } catch (error: any) {
      setAlert({
        description: `Sorry, something went wrong : ${error.message} `,
        severity: 'error',
        open: true,
      });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg' className='project-form'>
      <DialogTitle className='form-title'>
        Project proposal
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 20,
            top: 20,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Propose a sustainable project you wanna contribute to. It will be open to votes
          on the next round.
        </DialogContentText>
        <div className='form-fields'>
          <div className='add-image'>
            <input
              onChange={(element) => handleAddImage(element)}
              type='file'
              id='img'
              name='img'
              accept='image/*'
            />
            <label htmlFor='img' className='btn-1'>
              <img src={newImageSrc} alt='Select a file' />
            </label>
          </div>
          <div>
            <TextField
              margin='dense'
              id='title'
              label='Project Name'
              type='string'
              fullWidth
              variant='standard'
              value={project.title}
              onChange={handleFieldChange}
              error={errors.includes('title')}
              helperText={errors.includes('title') ? 'This field is mandatory' : ''}
            />
            <TextField
              margin='dense'
              id='description'
              label='Description'
              type='string'
              multiline
              placeholder='A short text that will explain the project purpose / actions'
              fullWidth
              rows={4}
              value={project.description}
              onChange={handleFieldChange}
              error={errors.includes('description')}
              helperText={errors.includes('description') ? 'This field is mandatory' : ''}
            />
            <TextField
              margin='dense'
              id='link'
              label='Link to project page / website'
              type='string'
              fullWidth
              variant='standard'
              value={project.link}
              onChange={handleFieldChange}
              error={errors.includes('link')}
              helperText={errors.includes('link') ? 'This field is mandatory' : ''}
            />
            <TextField
              margin='dense'
              id='address'
              label='Project Public Address'
              type='string'
              fullWidth
              variant='standard'
              value={project.address}
              onChange={handleFieldChange}
              error={errors.includes('address')}
              helperText={errors.includes('address') ? 'This field is mandatory' : ''}
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant='text'>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectForm;
