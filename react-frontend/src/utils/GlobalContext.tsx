import React, { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { DAOImpact, Project } from './types';
import { create, IPFSHTTPClient } from 'ipfs-http-client';

type GlobalContextType = {
  isConnected: boolean;
  isMember: boolean;
  highlightedProjects: Project[];
  currentProjects: Project[];
  roundStatus: 'propose' | 'vote';
  uploadImageToIPFS: (file: any) => Promise<string>;
  submitNewProject: (project: Project) => Promise<void>;
  connectWallet: () => Promise<void>;
  ourImpact: DAOImpact | null;
};

interface ContextProps {
  children?: React.ReactNode;
}

export const GlobalContext = createContext<GlobalContextType>({
  isConnected: false,
  isMember: false,
  highlightedProjects: [],
  currentProjects: [],
  roundStatus: 'propose',
  uploadImageToIPFS: async () => '',
  submitNewProject: async () => {},
  connectWallet: async () => {},
  ourImpact: null,
});

const currentProjectsSample: Project[] = [
  {
    address: '0x0',
    title: 'Proposal Project 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://images.theconversation.com/files/137600/original/image-20160913-4948-6fyxz.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=900.0&fit=crop',
    link: '',
  },
  {
    address: '0x0',
    title: 'Proposal Project 2',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. ',
    image: 'https://storage.googleapis.com/pod_public/1300/120225.jpg',
    link: '',
  },
  {
    address: '0x0',
    title: 'Proposal Project 3',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://thumbs.dreamstime.com/b/large-group-african-safari-animals-wildlife-conservation-concept-174172993.jpg',
    link: '',
  },
  {
    address: '0x0',
    title: 'Proposal Project 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://images.theconversation.com/files/137600/original/image-20160913-4948-6fyxz.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=900.0&fit=crop',
    link: '',
  },
  {
    address: '0x0',
    title: 'Proposal Project 2',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. ',
    image: 'https://storage.googleapis.com/pod_public/1300/120225.jpg',
    link: '',
  },
  {
    address: '0x0',
    title: 'Proposal Project 3',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://thumbs.dreamstime.com/b/large-group-african-safari-animals-wildlife-conservation-concept-174172993.jpg',
    link: '',
  },
];

const highlightedProjectsSample: Project[] = [
  {
    address: '0x0',
    title: 'Sample Project 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo eget. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Vel pretium lectus quam id. Ac tortor dignissim convallis aenean. Suscipit tellus mauris a diam maecenas sed enim. Dolor sed viverra ipsum nunc. Erat imperdiet sed euismod nisi porta lorem mollis. Pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus.',
    image:
      'https://images.theconversation.com/files/137600/original/image-20160913-4948-6fyxz.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=900.0&fit=crop',
    link: '',
  },
  {
    address: '0x0',
    title: 'Sample Project 2',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus. Non enim praesent elementum facilisis leo vel fringilla. Netus et malesuada fames ac turpis egestas. ',
    image: 'https://storage.googleapis.com/pod_public/1300/120225.jpg',
    link: '',
  },
  {
    address: '0x0',
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
  // User
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [signer, setSigner] = useState<null | ethers.providers.JsonRpcSigner>(null);
  const [userAddress, setUserAddress] = useState<null | string>(null);

  //Projects
  const [highlightedProjects, setHighlightedProjects] = useState<Project[]>([]);
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);

  //Round
  const [roundStatus, setRoundStatus] = useState<'propose' | 'vote'>('propose');

  //Other
  const [ourImpact, setOurImpact] = useState<DAOImpact | null>(null);
  const [IPFSClient, setIPFSClient] = useState<IPFSHTTPClient | null>(null);

  const { ethereum } = window as any;

  //FUNCTIONS
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
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfMember = async () => {
    //smart contract = check if a user is member of the DAO
    console.log('Check if Member');
  };

  //Projects
  const getHighlightedProjects = async () => {
    // get the projects for the home page
    // smart contract = last round winner projects
    // data on IPFS
    console.log('getHighlightedProjects');
    setHighlightedProjects(highlightedProjectsSample);
  };

  const getCurrentProjects = async () => {
    // get the projects for the member's page
    // smart contract = actual projects
    // data on IPFS
    console.log('getCurrentProjects');
    setCurrentProjects(currentProjectsSample);
  };

  const uploadImageToIPFS = async (file: any) => {
    try {
      const added = await IPFSClient?.add(file);
      return `https://ipfs.infura.io/ipfs/${added?.path}`;
    } catch (error) {
      console.log(error);
      return '';
    }
  };

  const submitNewProject = async (project: Project) => {
    // IPFS = save the data
    try {
      const added = await IPFSClient?.add(JSON.stringify(project));
      const data = `https://ipfs.infura.io/ipfs/${added?.path}`;
      console.log('data of new project', data);

      // smart contract = create the project

      console.log('submitNewProject');
      await getCurrentProjects();
    } catch (error) {
      console.log(error);
    }
  };

  //Rounds
  const getRoundStatus = async () => {
    // smart contract = get the actual round status
    console.log('getRoundStatus');
  };

  //Other
  const getDOAImpact = async () => {
    //smart contract = one function that gives back all the info
    console.log('getDAOImpact');
    setOurImpact({
      balance: 10,
      members: 20,
      projectsContributed: 30,
      donators: 100,
      alreadySent: 50,
    });
  };

  //USE EFFECTS
  //User
  useEffect(() => {
    connectWallet();
  }, [ethereum]);

  //Round
  useEffect(() => {
    getRoundStatus();
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
      const client = await create({ url: 'https://ipfs.infura.io:5001/api/v0' });
      setIPFSClient(client);
      console.log('client', client);
    };
    createIPFSClient();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        //User
        isConnected,
        isMember,
        connectWallet,
        //Projects
        uploadImageToIPFS,
        highlightedProjects,
        currentProjects,
        submitNewProject,
        //Rounds
        roundStatus,
        //Other
        ourImpact,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
