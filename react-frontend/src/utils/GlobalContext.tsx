import React, { createContext, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { AlertInfo, DAOImpact, Member, Project } from './types';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { Alert, Snackbar } from '@mui/material';
import contractJSON from './GreenDao.json';
import ERC20JSON from './ERC20.json';
import { BNtoNumber, BNtoSring, displayError, USDCToNumber } from './helpers';
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
  submitNewProject: (project: Project) => Promise<boolean>;
  submissionStatus: 'waitingConfirmation' | 'mining' | null;
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
  submitNewProject: async () => false,
  submissionStatus: null,
  connectWallet: async () => {},
  ourImpact: null,
  setAlert: () => {},
  timeVal: 0,
  setOpenDonationForm: () => {},
});

const contractAddress = '0x0757167e430d8cC270aef51f7C698CcDe41f2F6e';
const ROUND_STATUS: ('propose' | 'vote')[] = ['propose', 'vote'];

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
  const [submissionStatus, setSubmissionStatus] = useState<
    null | 'waitingConfirmation' | 'mining'
  >(null);

  //Round
  const [roundStatus, setRoundStatus] = useState<'propose' | 'vote'>('propose');
  const [contractStartTime, setContractStartTime] = useState<null | number>(null);
  const [timeVal, setTimeVal] = useState<number>(0);

  //Donation
  const [openDonationForm, setOpenDonationForm] = useState<boolean>(false);
  const [approvalLoading, setApprovalLoading] = useState<boolean>(false);
  const [donationLoading, setDonationLoading] = useState<boolean>(false);
  const [donationStatus, setDonationStatus] = useState<
    'waitingForApproval' | 'approvalMining' | 'waitingForTx' | 'txMining' | null
  >(null);
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
      console.log('UploadImageToIPFS', error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${displayError(error.message)}`,
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
      console.log('getProjectDataFromIPFS', error);
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
          const infos = await contractInstance.members(userAddress);
          const lastVotes = await contractInstance.getProjectsMemberVotedFor(userAddress);
          setMember({
            address: userAddress ?? '',
            votesRemaining: BNtoNumber(infos.votes),
            lastVotes,
          });
        }
      }
    } catch (error: any) {
      console.log('checkIfMember', error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${displayError(error.message)}`,
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
      console.log('voteForProject', error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${displayError(error.message)}`,
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
            const infos = projects[i];
            const fullData = await getProjectDataFromIPFS(infos.data);
            if (fullData) {
              fullProjects.push({ ...fullData, votes: BNtoNumber(infos.votes) });
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
      console.log('getHighlightedProjects', error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${displayError(error.message)}`,
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
          const infos = projects[i];
          const fullData = await getProjectDataFromIPFS(infos.data);
          if (fullData) {
            fullProjects.push({
              ...fullData,
              proposedBy: infos.proposedBy,
              votes: BNtoNumber(infos.votes),
            });
          }
        }
        setCurrentProjects(fullProjects);
      }
    } catch (error: any) {
      console.log('getCurrentProjects', error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${displayError(error.message)}`,
        severity: 'error',
      });
    }
  };

  const submitNewProject = async (project: Project) => {
    try {
      const added = await IPFSClient?.add(JSON.stringify(project));
      const data = `https://ipfs.infura.io/ipfs/${added?.path}`;

      if (!!contractInstance) {
        setSubmissionStatus('waitingConfirmation');
        const proposeTx = await contractInstance.addProject(data, project.address);
        setSubmissionStatus('mining');
        await proposeTx.wait();
        setSubmissionStatus(null);
      }

      await getCurrentProjects();
      return true;
    } catch (error: any) {
      console.log('Submit new project', displayError(error.message));
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${displayError(error.message)}`,
        severity: 'error',
      });
      setSubmissionStatus(null);
      return false;
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
      console.log('getRoundStatus', error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${displayError(error.message)}`,
        severity: 'error',
      });
    }
  };

  const getPeriodRemainingTime = () => {
    //returns a number in miliSeconds
    const oneDayInMs = 24 * 3600 * 1000;
    const roundDuration = 2 * oneDayInMs;
    const proposalDuration = 1 * oneDayInMs;
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
        setDonationStatus(null);
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
          setDonationStatus('waitingForApproval');
          const approvalTx = await USDC.connect(signer).approve(
            contractAddress,
            donation
          );
          console.log('approval', approvalTx);
          setDonationStatus('approvalMining');
          await approvalTx.wait();
          console.log('approval minted');
          setApprovalLoading(false);
        }
        setDonationLoading(true);
        setDonationStatus('waitingForTx');
        const donationTx = await contractInstance.donate(donation);
        setDonationStatus('txMining');
        await donationTx.wait();
        console.log('DONATION ANSWER', donationTx);
        await checkIfMember();
        setTxHash(donationTx.hash);
        setDonationLoading(false);
        await getDOAImpact();
      }
    } catch (error: any) {
      console.log('sendDonation', error);
      setApprovalLoading(false);
      setDonationLoading(false);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${displayError(error.message)}`,
        severity: 'error',
      });
    }
  };

  //Other
  const getContractBalance = async () => {
    try {
      const tokenAddr = (await contractInstance?.token()) ?? '';
      const signerOrProvider =
        signer ??
        new ethers.providers.AlchemyProvider(
          'maticmum',
          process.env.REACT_APP_ALCHEMY_URL_API_KEY
        );
      const USDC = new ethers.Contract(tokenAddr, ERC20JSON.abi, signerOrProvider);
      const USDCBalance = await USDC.balanceOf(contractAddress);
      const MyBalance = await USDC.balanceOf(
        '0xc2f325BF27F3F59357A79d47CF54a8Ad7c7D80e0'
      );
      console.log('MY BALANCE', BNtoSring(MyBalance));
      return BigNumber.from(USDCBalance);
    } catch (error: any) {
      console.log('getContractBalance', error);
      return BigNumber.from(0);
    }
  };

  const getDOAImpact = async () => {
    try {
      if (!!contractInstance) {
        const balance = await getContractBalance();
        const members = await contractInstance.totalMembers();
        const projectsContributed = await contractInstance.totalPaidProjects();
        const donators = await contractInstance.anonymousDonations();
        const totalCollected = await contractInstance.totalCollected();
        const alreadySent = BigNumber.from(totalCollected).sub(balance);
        setOurImpact({
          balance: USDCToNumber(balance),
          members: BNtoNumber(members),
          projectsContributed: BNtoNumber(projectsContributed),
          donators: BNtoNumber(donators),
          alreadySent: USDCToNumber(alreadySent),
        });
      }
    } catch (error: any) {
      console.log('getDAOImpact', error);
      setAlert({
        open: true,
        description: `Oops, something went wrong : ${displayError(error.message)}`,
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
        console.log('Create IPFSClient', error);
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
        submissionStatus,
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
        onClose={
          donationLoading || approvalLoading
            ? () => {}
            : () => {
                setOpenDonationForm(false);
                setTxHash('');
              }
        }
        onSubmit={sendDonation}
        {...{ donationLoading, donationStatus, txHash, approvalLoading, isMember }}
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
