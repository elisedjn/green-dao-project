export type Project = {
  id: number;
  image: string;
  description: string;
  title: string;
};

export type Member = {
  address: string;
};

export type LinkType = {
  children: string;
  onClick: () => any;
};
