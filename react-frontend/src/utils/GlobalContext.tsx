import React, { createContext, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { AlertInfo, DAOImpact, Member, Project } from './types';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { Alert, Snackbar } from '@mui/material';
import contractJSON from './GreenDao.json';
import { BNtoNumber } from './helpers';
import DonateForm from '../Components/Molecules/DonateForm';

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
  setOpenDonationForm: React.Dispatch<React.SetStateAction<boolean>>;
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
  setOpenDonationForm: () => {},
});

const contractAddress = '0x7e56d931c474c2874D688226cc9eF7295A6a0cB7';
const ROUND_STATUS: ('propose' | 'vote')[] = ['propose', 'vote'];

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

  //Donation
  const [openDonationForm, setOpenDonationForm] = useState<boolean>(false);

  //Other
  const [ourImpact, setOurImpact] = useState<DAOImpact | null>(null);
  const [alert, setAlert] = useState<AlertInfo>({ open: false });

  const { ethereum } = window as any;

  //FUNCTIONS
  // Contract and IPFS
  const connectToContract = async () => {
    try {
      if (signer) {
        const contract = await new ethers.Contract(
          contractAddress,
          contractJSON.abi,
          signer
        );
        setContractInstance(contract);
        await checkIfMember();
      }
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
      const stream = IPFSClient.cat(CID);
      const decoder = new TextDecoder();
      let data = '';
      for await (const chunk of stream) {
        // chunks of data are returned as a Uint8Array, convert it back to a string
        data += decoder.decode(chunk, { stream: true });
      }
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
        const currentRound = await contractInstance.getCurrentRound();
        if (BNtoNumber(currentRound) > 1) {
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
          console.log('It is the first round!');
          setHighlightedProjects(highlightedProjectsSample);
        }
      } else {
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
        console.log('PROJECTS', projects);
        let fullProjects: Project[] = [];
        for (let i = 0; i < projects?.length ?? 0; i++) {
          const data = await getProjectDataFromIPFS(projects[i].data);
          if (data) {
            fullProjects.push({ ...data, votes: projects[i].votes });
          }
        }
        setCurrentProjects(fullProjects);
      } else {
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

      if (!!contractInstance) {
        await contractInstance.addProject(data, project.address);
      }

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
        setRoundStatus(ROUND_STATUS[status]);
        const start = await contractInstance.start();
        setContractStartTime(BNtoNumber(start));
      }
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

  //Donation
  const sendDonation = async (amount: number) => {
    try {
      if (!!contractInstance) {
        const donation = BigNumber.from(10).pow(18).mul(amount);
        // APPROVE TO DO
        const answer = await contractInstance.donate(donation);
        console.log('DONATION ANSWER', answer);
        await checkIfMember();
      }
    } catch (error: any) {
      console.log(error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
    }
  };

  //Other
  const getDOAImpact = async () => {
    try {
      //smart contract = one function that gives back all the info
      if (!!contractInstance) {
        const tokenAddr = await contractInstance.token();
        console.log("token add", tokenAddr);
        // const balance = BigNumber.from(0); //Deal with IERC20 address to check that ?
        // const members = await contractInstance.DAOMembers();

        //index.js

        // The minimum ABI to get ERC20 Token balance

        const minABI = [
          // balanceOf
          {
            constant: true,

            inputs: [{ name: "_owner", type: "address" }],

            name: "balanceOf",

            outputs: [{ name: "balance", type: "uint256" }],

            type: "function",
          },

        ];
        // RILEY: Attempting to get the balance in ERC20
        async function getBalance() {
          const result = await contract.methods.balanceOf(contractAddress).call(); // 29803630997051883414242659

          const provider = new ethers.providers.Web3Provider(ethereum);
          const format = provider.utils.fromWei(result); // 29803630.997051883414242659

          console.log(format);
        }
        const balance = contractInstance(tokenAddr).balanceOf(contractAddress);
        console.log(balance);
        const projectsContributed = BNtoNumber(
          await contractInstance.totalPaidProjects()
        );
        console.log("this balance", getBalance());
        const donators = BNtoNumber(await contractInstance.anonymousDonations());
        const alreadySent = BigNumber.from(await contractInstance.totalCollected()).sub(
          balance
        );
        setOurImpact({
          balance: BNtoNumber(balance),
          members: 0,
          projectsContributed,
          donators,
          alreadySent: BNtoNumber(alreadySent),
        });
      }
      // else {
      //   setOurImpact({
      //     balance: 10,
      //     members: 20,
      //     projectsContributed: 30,
      //     donators: 100,
      //     alreadySent: 50,
      //   });
      // }
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

  //User
  useEffect(() => {
    connectWallet();
  }, [ethereum]);

  //Contract
  useEffect(() => {
    connectToContract();
  }, [signer]);

  //Round
  useEffect(() => {
    getRoundStatus();
  }, [contractInstance]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeVal(getPeriodRemainingTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [contractStartTime]);

  //Projects
  useEffect(() => {
    getHighlightedProjects();
    getCurrentProjects();
  }, [roundStatus, contractInstance]);

  //Other
  useEffect(() => {
    getDOAImpact();
  }, [contractInstance]);

  useEffect(() => {
    const createIPFSClient = async () => {
      try {
        const client = await create({ url: 'https://ipfs.infura.io:5001/api/v0' });
        setIPFSClient(client);
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
        //Donations
        setOpenDonationForm,
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
      <DonateForm
        open={openDonationForm}
        onClose={() => setOpenDonationForm(false)}
        onSubmit={sendDonation}
      />
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
