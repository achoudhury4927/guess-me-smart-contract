import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connect");
const guessButton = document.getElementById("guessButton");
const balanceLabel = document.getElementById("balance");
connectButton.onclick = connect;
guessButton.onclick = guess;

console.log(ethers);

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      console.log("I see metamask!!!");
      await getBalance();
      await ethereum.request({ method: "eth_requestAccounts" });
      connectButton.innerHTML = "Connected!";
    } catch (error) {
      console.log(error);
    }
    console.log("connected11!");
  } else {
    console.log("I see fuckall");
    connectButton.innerHTML = "Please Install Metamask!";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
    balanceLabel.innerHTML = ethers.utils.formatEther(balance);
  }
}

async function guess() {
  const guessString = document.getElementById("guessString").value;
  const ethAmount = "1";
  console.log(`Funding amount of ${ethAmount}`);
  console.log(`Guessing string of ${guessString}`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log(signer);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResponse = await contract.guessSecret(guessString, {
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForMine(txResponse, provider);
      console.log("Done...");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForMine(txResponse, provider) {
  console.log(`Mining ${txResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (txReceipt) => {
      console.log(`Completed with ${txReceipt.confirmations} confirmations`);
      resolve();
    });
  });
}
