export type Project = {
  id: number;
  image: string;
  description: string;
  title: string;
<<<<<<< HEAD
  link?: string;
  address?: string;
||||||| parent of 4e85c14 (init)
=======
  link: string;
>>>>>>> 4e85c14 (init)
};

export type Member = {
  address: string;
};

export type LinkType = {
  children: string;
  onClick: () => any;
};
