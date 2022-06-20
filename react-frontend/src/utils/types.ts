export type Project = {
  image: string;
  description: string;
  title: string;
  link: string;
  address: string;
  votes?: number;
};

export type Member = {
  address: string;
  lastVotes: string[];
  votesRemaining: number;
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

export type AlertInfo = {
  open: boolean;
  description?: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
};
