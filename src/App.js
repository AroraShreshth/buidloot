import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import buidloot from './utils/BuidLoot.json';


// Constants
const TWITTER_HANDLE = 'AroraShreshth';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/buidloot-v3';
//const TOTAL_MINT_COUNT = 200;


const App = () => {

	const [currentAccount,setCurrentAccount] = useState("");
	const [mintingLoader,setMintingLoader] = useState(0);
	const CONTRACT_ADDRESS = "0xa506390F8EE18381F26c62564709C403A47Bc95F";

	const [mintedLink, setMintedLink]= useState("")
	
	const [tokenNo, setTokenNO]= useState(-1)

	const whichnetwork = (netId) => {
		
                    switch (netId) {
                        case "1":
                            return 'mainnet'
                            break
                        case "2":
                            return 'deprecated Morden test'
                            break
                        case "3":
                            return 'ropsten test network'
                            break
                        case "4":
                            return 'Rinkeby test network'
                            break
                        case "42":
                            return 'Kovan test network'
                            break
                        default:
                            return 'unknown network'
                    }
	}

	const checkIfWalletIsConnected = async () => {
		
		const {ethereum} = window
		
		if(!ethereum){
			console.log("Make Sure you have Metamask");
		}
		else {
			const network = ethereum.networkVersion
			const networkname = whichnetwork(network)
			console.log("We have ethereum object", ethereum);
			console.log(networkname , 'detected');
			
			if (network !== "4" ) {
				alert(`Hey — I see you're connected to,${networkname} but this only works on Rinkeby!`)
			}
		}
		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if (accounts.length !==0){
			const account = accounts[0];
			console.log("Found an authorized account:",account);
			setCurrentAccount(account)
			          // Setup listener! This is for the case where a user comes to our site
          // and ALREADY had their wallet connected + authorized.
          setupEventListener()

		} else {
			console.log("No Authorized Account Found")
		}
	}

	const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
	        // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }
	const askContractToMintNft = async () => {



		try {
			const { ethereum } = window;

		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, buidloot.abi, signer);

			console.log("Going to pop wallet now to pay gas...")
			let nftTxn = await connectedContract.createBuidloot();
			
			console.log("Mining...please wait.")
			setMintingLoader(1)
			await nftTxn.wait();
			
			console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
			setMintingLoader(0)	
		} else {
			console.log("Ethereum object doesn't exist!");
		}
		} catch (error) {
			console.log(error)
		}
	}

	  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, buidloot.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
		  setMintedLink(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
		  setTokenNO(tokenId.toNumber())
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)

		  
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

	useEffect(() => {
		checkIfWalletIsConnected()
	}, [])

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
	)

	const OpenSeaUI  = () => (
	<a href={OPENSEA_LINK} target="_blank">
    	<button className="cta-button connect-wallet-button" >
      	🌊 View Collection on OpenSea
    	</button>
	</a>
	)

	const Loader = () => (
    	 <div className="header-container">
		 <img src="https://f8n-production.s3.amazonaws.com/creators/profile/c8gley51s-nyan-cat-large-gif-gif-mbf1sa.gif" alt="this slowpoke moves"  width="250" />
		 <p className="sub-text" > Minting Your NFT </p>
		 
		 </div>
	)
	
	const NoLoader = () => (
    	 <div className="header-container">
		 {mintedLink === "" ? (<p className="sub-text" > Go Ahead Mint your NFT </p>) : (

			 <a href={mintedLink} target="_blank">
					<button className="cta-button connect-wallet-button" >
					🌊 View your #{tokenNo} on Opensea
					</button>
			</a>

		)}

		 </div>
	)

	
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
		<p className="header gradient-text">BUIDLOOT</p>
           <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT CULTURE today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>

			{mintingLoader === 1 ? Loader(): NoLoader()}

			{OpenSeaUI()}


			
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE} at "_buildspace"`} </a>
        </div>
      </div>
    </div>
  );
};

export default App;
