import React, { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

type GlobalContextType = { isConnected: boolean };

interface ContextProps {
  children?: React.ReactNode;
}

export const GlobalContext = createContext<GlobalContextType>({ isConnected: true });

const GlobalContextProvider = ({ children }: ContextProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [signer, setSigner] = useState<null | ethers.providers.JsonRpcSigner>(null);
  const [userAddress, setUserAddress] = useState<null | string>(null);

  const { ethereum } = window as any;

  const checkIfConnected = async () => {
    try {
      if (ethereum) {
        await ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(ethereum);
        const sgr1 = await provider.getSigner();
        let addr1 = await sgr1.getAddress();
        setSigner(sgr1 ?? null);
        setUserAddress(addr1 ?? null);
        setIsConnected(!!addr1);

        //DO THE LOGIC TO CHECK IF THE USER IS A MEMBER
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfConnected();
  }, [ethereum]);

  return (
    <GlobalContext.Provider value={{ isConnected }}>{children}</GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
