export type Project = {
  image: string;
  description: string;
  title: string;
  link: string;
  address: string;
};

export type Member = {
  address: string;
};

export type LinkType = {
  children: string;
  onClick: () => any;
};

export type DAOImpact = {
  balance: number;
  members: number;
  projectsContributed: number;
  donators: number;
  alreadySent: number;
};
