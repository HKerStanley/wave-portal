import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {

	/*
	* Just a state variable we use to store our user's public wallet.
	*/
	const [currentAccount, setCurrentAccount] = React.useState("");
	const [allWaves, setAllWaves] = React.useState([]);

	const contractAddress = "0xb054f764702c4D79A2af26D8c006678729f19523";

	const contractABI = abi.abi;

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log("Make sure you have metamask!");
				return;
			} else {
				console.log("We have the ethereum object", ethereum);
			}

			/*
			* Check if we're authorized to access the user's wallet
			*/
			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log("Found an authorized account:", account);
				setCurrentAccount(account)
			} else {
				console.log("No authorized account found")
			}
		} catch (error) {
			console.log(error);
		}
	}

  /**
  * Implement your connectWallet method here
  */
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
		} catch (error) {
			console.log(error)
		}
	}

	const wave = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

				let count = await waveportalContract.getTotalWaves();
				console.log("Retrieved total wave count...", count.toNumber());

				const waveTxn = await waveportalContract.wave();
				console.log("Mining...", waveTxn.hash);

				await waveTxn.wait();
				console.log("Mined -- ", waveTxn.hash);

				count = await waveportalContract.getTotalWaves();
				console.log("Retrieved total wave count...", count.toNumber());
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error)
		}
	}

	/*
 * Create a method that gets all waves from your contract
 */
	const getAllWaves = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
				const waves = await waveportalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
				let wavesCleaned = [];
				waves.forEach(wave => {
					wavesCleaned.push({
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message
					});
				});

        /*
         * Store our data in React State
         */
				setAllWaves(wavesCleaned);
			} else {
				console.log("Ethereum object doesn't exist!")
			}
		} catch (error) {
			console.log(error);
		}
	}

  /*
  * This runs our function when the page loads.
  */
	React.useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

	return (
		<div className="mainContainer">

			<div className="dataContainer">
				<div className="header">
					👋 Hey there! I am Stanley!
        </div>

				<div className="bio">
					I am Stanley from Hong Kong! I love coding, games, basketball and food!<br />
					Wave at me and lets be friend!
        </div>
				{!currentAccount ? (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
          </button>
				) : (
						<div>
							<input></input>
							<button className="waveButton" onClick={wave}>
								Wave at Me
        			</button>
						</div>
					)
				}

				{allWaves.map((wave, index) => {
					return (
						<div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
							<div>Address: {wave.address}</div>
							<div>Time: {wave.timestamp.toString()}</div>
							<div>Message: {wave.message}</div>
						</div>)
				})}
			</div>
		</div>
	);
}
