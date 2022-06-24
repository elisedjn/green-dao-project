import React, { createContext, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { AlertInfo, DAOImpact, Member, Project } from './types';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { Alert, Snackbar } from '@mui/material';
import contractJSON from './GreenDao.json';
import ERC20JSON from './ERC20.json';
import { BNtoNumber, BNtoSring, USDCToNumber } from './helpers';
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
  const [approvalLoading, setApprovalLoading] = useState<boolean>(false);
  const [donationLoading, setDonationLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');

  //Other
  const [ourImpact, setOurImpact] = useState<DAOImpact | null>(null);
  const [alert, setAlert] = useState<AlertInfo>({ open: false });

  const { ethereum } = window as any;

  //FUNCTIONS
  // Contract and IPFS
  const connectToContract = async () => {
    try {
      if (signer) {
        //The user has Metamask connected
        const contract = await new ethers.Contract(
          contractAddress,
          contractJSON.abi,
          signer
        );
        setContractInstance(contract);
        await checkIfMember();
      } else {
        //The user does not have Metamask connected
        const provider = new ethers.providers.AlchemyProvider(
          'maticmum',
          process.env.REACT_APP_ALCHEMY_URL_API_KEY
        );
        const contract = await new ethers.Contract(
          contractAddress,
          contractJSON.abi,
          provider
        );
        setContractInstance(contract);
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
        console.log('is member', answer);
        if (answer) {
          const [lastRoundPaid, votes] = await contractInstance.members(userAddress);
          const current = await contractInstance.getCurrentRound();
          console.log('lastRoundPaid', BNtoNumber(lastRoundPaid), BNtoNumber(current));
          const lastVotes = await contractInstance.getProjectsMemberVotedFor(userAddress);
          console.log('last votes', lastVotes);
          setMember({
            address: userAddress ?? '',
            votesRemaining: BNtoNumber(votes),
            lastVotes,
          });
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
          const [, projects] = await contractInstance.getLastWinners();
          let fullProjects: Project[] = [];
          for (let i = 0; i < projects?.length ?? 0; i++) {
            const [data, votes] = projects[i];
            const fullData = await getProjectDataFromIPFS(data);
            if (fullData) {
              fullProjects.push({ ...fullData, votes: BNtoNumber(votes) });
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
        const [, projects] = await contractInstance.getCurrentProjects();
        let fullProjects: Project[] = [];
        for (let i = 0; i < projects?.length ?? 0; i++) {
          const [data, votes, proposedBy] = projects[i];
          const fullData = await getProjectDataFromIPFS(data);
          if (fullData) {
            fullProjects.push({ ...fullData, proposedBy, votes: BNtoNumber(votes) });
          }
        }
        setCurrentProjects(fullProjects);
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
        const proposeTx = await contractInstance.addProject(data, project.address);
        await proposeTx.wait();
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
      if (!signer) {
        setAlert({
          open: true,
          description: `Please connect your Wallet using Metamask to be able to donate`,
          severity: 'error',
        });
      } else if (!!contractInstance) {
        setTxHash('');
        const donation = BigNumber.from(10).pow(18).mul(amount);
        const tokenAddr = (await contractInstance?.token()) ?? '';
        const USDC = new ethers.Contract(tokenAddr, ERC20JSON.abi, signer);

        //Checking if the user has already allowed our contract to use his USDC
        const allowance = await USDC.allowance(
          await signer.getAddress(),
          contractAddress
        );
        if (BigNumber.from(allowance).lt(donation)) {
          // Need approval
          setApprovalLoading(true);
          const approvalTx = await USDC.connect(signer).approve(
            contractAddress,
            donation
          );
          console.log('approval', approvalTx);
          await approvalTx.wait();
          console.log('approval minted');
          setApprovalLoading(false);
        }
        setDonationLoading(true);
        const donationTx = await contractInstance.donate(donation);
        await donationTx.wait();
        console.log('DONATION ANSWER', donationTx);
        await checkIfMember();
        setTxHash(donationTx.hash);
        setDonationLoading(false);
      }
    } catch (error: any) {
      console.log(error);
      setApprovalLoading(false);
      setDonationLoading(false);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${error.message}`,
        severity: 'error',
      });
    }
  };

  //Other
  const getContractBalance = async () => {
    try {
      const tokenAddr = (await contractInstance?.token()) ?? '';
      console.log('tokenAddr', tokenAddr);
      const signerOrProvider =
        signer ??
        new ethers.providers.AlchemyProvider(
          'maticmum',
          process.env.REACT_APP_ALCHEMY_URL_API_KEY
        );
      const USDC = new ethers.Contract(tokenAddr, ERC20JSON.abi, signerOrProvider);
      const USDCBalance = await USDC.balanceOf(contractAddress);
      return BigNumber.from(USDCBalance);
    } catch (error: any) {
      console.log(error);
      return BigNumber.from(0);
    }
  };

  const getDOAImpact = async () => {
    try {
      if (!!contractInstance) {
        const balance = await getContractBalance();
        // const members = await contractInstance.DAOMembers();
        const projectsContributed = await contractInstance.totalPaidProjects();
        const donators = await contractInstance.anonymousDonations();
        const totalCollected = await contractInstance.totalCollected();
        const alreadySent = BigNumber.from(totalCollected).sub(balance);
        setOurImpact({
          balance: USDCToNumber(balance),
          members: 1,
          projectsContributed: BNtoNumber(projectsContributed),
          donators: BNtoNumber(donators),
          alreadySent: USDCToNumber(alreadySent),
        });
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
        {...{ donationLoading, txHash, approvalLoading, isMember }}
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
