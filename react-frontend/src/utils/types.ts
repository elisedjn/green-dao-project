export type Project = {
  id: number;
  image: string;
  description: string;
  title: string;
  link: string;
  address?: string;

};

export type Member = {
  address: string;
};

export type LinkType = {
  children: string;
  onClick: () => any;
};
