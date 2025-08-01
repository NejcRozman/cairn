import React, {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useEffect,
} from "react";
import { createIpfsClient } from "../ipfs/ipfsClient";
import type { IpfsClient } from "../lib/types";

interface IpfsProviderProps {
  children: ReactNode;
  agentKey: string;
  proof: string;
}

const IpfsContext = createContext<IpfsClient | null>(null);

export const IpfsProvider = ({
  children,
  agentKey,
  proof,
}: IpfsProviderProps) => {
  const [ipfsClient, setIpfsClient] = useState<IpfsClient | null>(null);

  useEffect(() => {
    const initializeIpfs = async () => {
      try {
        console.log("Creating IPFS client...");
        const client = await createIpfsClient(agentKey, proof);
        console.log("IPFS client created successfully");
        setIpfsClient(client);
        console.log("IPFS client state updated");
      } catch (error) {
        console.error("Failed to initialize IPFS client:", error);
      }
    };

    initializeIpfs();
  }, [agentKey, proof]);

  return (
    <IpfsContext.Provider value={ipfsClient}>{children}</IpfsContext.Provider>
  );
};

export const useIpfs = () => {
  return useContext(IpfsContext); // can return null
};
