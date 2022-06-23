import React, { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { AlertInfo, DAOImpact, Member, Project } from './types';
import { create, IPFSHTTPClient, urlSource } from 'ipfs-http-client';
import { Alert, Snackbar } from '@mui/material';
import contractJSON from './GreenDao.json';

type GlobalContextType = {
  isConnected: boolean;
  isMember: boolean;
  member: Member | null;
  voteForProject: (projectAddress: string, nbVote: number) => Promise<void>;
  highlightedProjects: Project[];
  currentProjects: Project[];
  roundStatus: 'propose' | 'vote';
  uploadImageToIPFS: (file: any) => Promise<string>;
  submitNewProject: (project: Project) => Promise<void>;
  connectWallet: () => Promise<void>;
  ourImpact: DAOImpact | null;
  setAlert: React.Dispatch<React.SetStateAction<AlertInfo>>;
  timeVal: number;
};

interface ContextProps {
  children?: React.ReactNode;
}

export const GlobalContext = createContext<GlobalContextType>({
  isConnected: false,
  isMember: false,
  member: null,
  voteForProject: async () => {},
  highlightedProjects: [],
  currentProjects: [],
  roundStatus: 'propose',
  uploadImageToIPFS: async () => '',
  submitNewProject: async () => {},
  connectWallet: async () => {},
  ourImpact: null,
  setAlert: () => {},
  timeVal: 0,
});

const contractAddress = '';

const currentProjectsSample: Project[] = [
  {
    address: '0x01',
    title: 'Proposal Project 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://images.theconversation.com/files/137600/original/image-20160913-4948-6fyxz.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=900.0&fit=crop',
    link: '',
    votes: 3,
  },
  {
    address: '0x02',
    title: 'Proposal Project 2',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. ',
    image: 'https://storage.googleapis.com/pod_public/1300/120225.jpg',
    link: '',
    votes: 2,
  },
  {
    address: '0x03',
    title: 'Proposal Project 3',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://thumbs.dreamstime.com/b/large-group-african-safari-animals-wildlife-conservation-concept-174172993.jpg',
    link: '',
    votes: 5,
  },
  {
    address: '0x04',
    title: 'Proposal Project 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://images.theconversation.com/files/137600/original/image-20160913-4948-6fyxz.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=900.0&fit=crop',
    link: '',
    votes: 7,
  },
  {
    address: '0x05',
    title: 'Proposal Project 2',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. ',
    image: 'https://storage.googleapis.com/pod_public/1300/120225.jpg',
    link: '',
    votes: 10,
  },
  {
    address: '0x06',
    title: 'Proposal Project 3',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://thumbs.dreamstime.com/b/large-group-african-safari-animals-wildlife-conservation-concept-174172993.jpg',
    link: '',
    votes: 1,
  },
];

const highlightedProjectsSample: Project[] = [
  {
    address: '0x01',
    title: 'Sample Project 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://images.theconversation.com/files/137600/original/image-20160913-4948-6fyxz.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=900.0&fit=crop',
    link: '',
  },
  {
    address: '0x02',
    title: 'Sample Project 2',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. ',
    image: 'https://storage.googleapis.com/pod_public/1300/120225.jpg',
    link: '',
  },
  {
    address: '0x03',
    title: 'Sample Project 3',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://thumbs.dreamstime.com/b/large-group-african-safari-animals-wildlife-conservation-concept-174172993.jpg',
    link: '',
  },
];

const GlobalContextProvider = ({ children }: ContextProps) => {
  // VARIABLES
  // Contract and IPFS
  const [IPFSClient, setIPFSClient] = useState<IPFSHTTPClient | null>(null);
  const [contractInstance, setContractInstance] = useState<ethers.Contract | null>(null);

  // User
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [member, setMember] = useState<Member | null>(null);
  const [signer, setSigner] = useState<null | ethers.providers.JsonRpcSigner>(null);
  const [userAddress, setUserAddress] = useState<null | string>(null);

  //Projects
  const [highlightedProjects, setHighlightedProjects] = useState<Project[]>([]);
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);

  //Round
  const [roundStatus, setRoundStatus] = useState<'propose' | 'vote'>('propose');
  const [contractStartTime, setContractStartTime] = useState<null | number>(null);
  const [timeVal, setTimeVal] = useState<number>(0);

  //Other
  const [ourImpact, setOurImpact] = useState<DAOImpact | null>(null);
  const [alert, setAlert] = useState<AlertInfo>({ open: false });

  const { ethereum } = window as any;

  //FUNCTIONS
  // Contract and IPFS
  const connectToContract = async () => {
    try {
      const contract = null; // await new ethers.Contract(contractAddress, contractJSON);
      console.log('contract', contract);
      setContractInstance(contract);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImageToIPFS = async (file: any) => {
    try {
      const added = await IPFSClient?.add(file);
      return `https://ipfs.infura.io/ipfs/${added?.path}`;
    } catch (error: any) {
      console.log(error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
      return '';
    }
  };

  const getProjectDataFromIPFS = async (IPFSlink: string) => {
    try {
      if (!IPFSClient) return;
      const CID = IPFSlink.split('/ipfs/')[1] ?? '';
      console.log(CID);
      const stream = IPFSClient.cat(CID);
      const decoder = new TextDecoder();
      let data = '';
      for await (const chunk of stream) {
        // chunks of data are returned as a Uint8Array, convert it back to a string
        data += decoder.decode(chunk, { stream: true });
      }
      console.log('data', JSON.parse(data));

      return JSON.parse(data) as Project;
    } catch (error: any) {
      console.log(error.message);
    }
  };

  //User
  const connectWallet = async () => {
    try {
      if (ethereum) {
        await ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(ethereum);
        const sgr1 = await provider.getSigner();
        let addr1 = await sgr1.getAddress();
        setSigner(sgr1 ?? null);
        setUserAddress(addr1 ?? null);
        setIsConnected(!!addr1);
        await checkIfMember();
        if (sgr1 && contractInstance) {
          await contractInstance.connect(sgr1);
        }
      } else {
        setAlert({
          open: true,
          description:
            'Please install Metamask to be able to use all the functionnality of D2R',
          severity: 'info',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfMember = async () => {
    try {
      //smart contract = check if a user is member of the DAO
      if (!!contractInstance) {
        const answer = await contractInstance.isMember(userAddress);
        setIsMember(answer);
        if (answer) {
          const member = await contractInstance.members(userAddress);
          setMember(member);
        }
      } else {
        // WARNING : For testing only
        setIsMember(true);
        setMember({
          address: userAddress ?? '',
          lastVotes: ['0x01', '0x06'],
          votesRemaining: 5,
        });
      }
    } catch (error: any) {
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
    }
  };

  const voteForProject = async (projectAddress: string, nbVote: number) => {
    try {
      if (!!member) {
        console.log('Giving ', nbVote, ' votes to ', projectAddress);
        await contractInstance?.voteForProject(projectAddress, nbVote);
        setMember((m) =>
          !m ? null : { ...m, votesRemaining: (m?.votesRemaining ?? 0) - nbVote }
        );
      } else {
        setAlert({
          open: true,
          description:
            'Only the members can vote, we would be happy to welcome you in the DAO',
          severity: 'info',
        });
      }
    } catch (error: any) {
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
    }
  };

  //Projects
  const getHighlightedProjects = async () => {
    try {
      if (!!contractInstance) {
        const [projectsAddr, projects] = await contractInstance.getLastWinners();
        let fullProjects: Project[] = [];
        for (let i = 0; i < projects?.length ?? 0; i++) {
          const data = await getProjectDataFromIPFS(projects[i].data);
          if (data) {
            fullProjects.push({ ...data, votes: projects[i].votes });
          }
        }
        setHighlightedProjects(fullProjects);
      } else {
        console.log('getHighlightedProjects');
        setHighlightedProjects(highlightedProjectsSample);
      }
    } catch (error: any) {
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
    }
  };

  const getCurrentProjects = async () => {
    try {
      if (!!contractInstance) {
        const [projectsAddr, projects] = await contractInstance.getCurrentProjects();
        let fullProjects: Project[] = [];
        for (let i = 0; i < projects?.length ?? 0; i++) {
          const data = await getProjectDataFromIPFS(projects[i].data);
          if (data) {
            fullProjects.push({ ...data, votes: projects[i].votes });
          }
        }
        setCurrentProjects(fullProjects);
      } else {
        console.log('getCurrentProjects');
        setCurrentProjects(currentProjectsSample);
      }
    } catch (error: any) {
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
    }
  };

  const submitNewProject = async (project: Project) => {
    try {
      const added = await IPFSClient?.add(JSON.stringify(project));
      const data = `https://ipfs.infura.io/ipfs/${added?.path}`;
      console.log('data of new project', data);

      if (!!contractInstance) {
        await contractInstance.addProject(data, project.address);
      }

      console.log('submitNewProject');
      await getCurrentProjects();
    } catch (error: any) {
      console.log(error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
    }
  };

  //Rounds
  const getRoundStatus = async () => {
    try {
      if (!!contractInstance) {
        const status = await contractInstance.getCurrentRoundStatus();
        setRoundStatus(status);
        const start = await contractInstance.start();
        setContractStartTime(start);
      }
      console.log('getRoundStatus');
    } catch (error: any) {
      console.log(error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
    }
  };

  const getPeriodRemainingTime = () => {
    //returns a number in miliSeconds
    const oneWeekInMiliSec = 7 * 24 * 3600 * 1000;
    const roundDuration = 4 * oneWeekInMiliSec;
    const proposalDuration = 3 * oneWeekInMiliSec;
    const duration = Date.now() - (contractStartTime ?? 0) * 1000; //contractStartTime is in seconds since unix epoch
    if (duration % roundDuration < proposalDuration) {
      //Proposal phase
      return proposalDuration - (duration % roundDuration);
    } else {
      //Vote phase
      return roundDuration - (duration % roundDuration);
    }
  };

  //Other
  const getDOAImpact = async () => {
    try {
      //smart contract = one function that gives back all the info
      if (!!contractInstance) {
        const tokenAddr = await contractInstance.token();
        const balance = 0; //Deal with IERC20 address to check that ?
        const members = await contractInstance.DAOMembers().length;
        const projectsContributed = await contractInstance.totalPaidProjects();
        const donators = await contractInstance.anonymousDonations();
        const alreadySent = (await contractInstance.totalCollected()) - balance;
        setOurImpact({ balance, members, projectsContributed, donators, alreadySent });
      }
      console.log('getDAOImpact');
      setOurImpact({
        balance: 10,
        members: 20,
        projectsContributed: 30,
        donators: 100,
        alreadySent: 50,
      });
    } catch (error: any) {
      console.log(error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
    }
  };

  //USE EFFECTS

  //Contract
  useEffect(() => {
    connectToContract();
  }, []);

  //User
  useEffect(() => {
    connectWallet();
  }, [ethereum]);

  //Round
  useEffect(() => {
    getRoundStatus();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeVal(getPeriodRemainingTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  //Projects
  useEffect(() => {
    getHighlightedProjects();
    getCurrentProjects();
  }, [roundStatus]);

  //Other
  useEffect(() => {
    getDOAImpact();
  }, []);

  useEffect(() => {
    const createIPFSClient = async () => {
      try {
        const client = await create({ url: 'https://ipfs.infura.io:5001/api/v0' });
        setIPFSClient(client);
        console.log('client', client);
      } catch (error: any) {
        console.log(error);
      }
    };
    createIPFSClient();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        //User
        isConnected,
        isMember,
        member,
        connectWallet,
        voteForProject,
        //Projects
        uploadImageToIPFS,
        highlightedProjects,
        currentProjects,
        submitNewProject,
        //Rounds
        roundStatus,
        timeVal,
        //Other
        ourImpact,
        setAlert,
      }}
    >
      {children}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ open: false })}
      >
        <Alert
          onClose={() => setAlert({ open: false })}
          severity={alert.severity ?? 'info'}
          sx={{ width: '100%' }}
        >
          {alert.description ?? ''}
        </Alert>
      </Snackbar>
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
