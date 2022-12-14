// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./EthInUsdConverter.sol";
import "hardhat/console.sol";

/** @title A contract for the guess me game
 *  @author AdilC
 *  @notice This contract allows users to guess a secret word and allow them to withdraw all eth on the smart contract if they're correct
 *  @dev This will implement chainlink price feeds to report usd value of balance in contract
 *  @custom:experimental This is an experimental contract. Anyone can view the setting of the secret if they know how to.
 */
contract GuessMe {
    using EthInUsdConverter for uint256;
    /** @notice This holds the address of the owner of the contract
     *  @dev This is set in the constructor when contract is deployed
     */
    address public immutable i_owner;

    /** @notice This holds the secret word to be guessed by the user
     *  @dev This can only be set by the owner of the contract
     */
    string internal s_secretWord;

    /** @notice This struct contains the winners address, the balance sent by the contract, and the current usd value of the balance
     *  @dev The usd value will be retrieved using chainlink oracles
     */
    struct WinnersStruct {
        address sender;
        uint256 winning;
        uint256 winningsInUsd;
    }

    /** @notice This array holds all the details to display of a winner
     */
    WinnersStruct[] s_winners;

    AggregatorV3Interface public priceFeed;

    /** @notice An event that emits the winner, the amount won in Eth and USD, and the timestamp of the transaction
     */
    event Win(
        address sender,
        uint256 amountWon,
        uint256 amountWonInUsd,
        uint256 timestamp
    );

    /** @notice This modifier ensures that only the owner of the contract can call a modified function
     *  @dev Using if (msg.sender != i_owner) revert GuessMe__NotOwner() costs 21231 gas
     *       Using require(msg.sender == owner, "Not Owner") costs 21485 gas. Longer string increases gas.
     *       Current implementation only costs 21192 gas
     */
    modifier onlyOwner() {
        console.log(
            "Validating that sender address %s is the same address as i_owner address %s",
            msg.sender,
            i_owner
        );
        require(msg.sender == i_owner);
        _;
    }

    constructor(address priceFeedAddress) {
        console.log("Setting owner as: %s", msg.sender);
        i_owner = msg.sender;
        console.log(
            "Setting chainlink contract address as: %s",
            priceFeedAddress
        );
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        console.log("Receive was called");
        //revert GuessMe__NotValidGuessCall();
    }

    fallback() external payable {
        console.log("fallback was called");
        //revert GuessMe__NotValidGuessCall();
    }

    /** @notice This function sends all the eth in the contract if you guess the correct word
     *  @param guess is the word the sender has sent as a guess
     */
    function guessSecret(string memory guess) public payable {
        console.log(
            "Received %s wei in call with a guess of %s",
            msg.value,
            guess
        );
        if (verifyGuess(guess)) {
            console.log(
                "Successful guess! Sending contract balance to %s",
                msg.sender
            );
            addWinner();
            (bool sent, ) = (msg.sender).call{value: address(this).balance}("");
            require(sent, "Failed to send contract balance!");
        }
    }

    /** @notice This allows the owner of the contract to withdraw the contract balance
     */
    function rescue() public payable onlyOwner {
        console.log(
            "Withdrawing the contract balance of %s to address %s",
            address(this).balance,
            msg.sender
        );
        (bool sent, ) = (i_owner).call{value: address(this).balance}("");
        require(sent, "Failed to send contract balance!");
    }

    /** @notice This allows the owner of the contract to set the secret key
     *  @param secretWord contains the word that users have to guess
     */
    function setSecretWord(string memory secretWord) public onlyOwner {
        console.log("Setting the secret word to %s", secretWord);
        s_secretWord = secretWord;
    }

    /** @notice This allows the owner of the contract to set the secret key
     *  @return s_secretWord is returned if the owner wants to check what the word is
     */
    function getSecretWord() public view onlyOwner returns (string memory) {
        console.log("returning secret word of %s", s_secretWord);
        return s_secretWord;
    }

    /** @notice This allows the owner of the contract to set the secret key
     *  @return s_secretWord is returned if the owner wants to check what the word is
     */
    function getWinners() public view returns (WinnersStruct[] memory) {
        console.log("returning winners struct");
        return s_winners;
    }

    /** @notice This is a helper function to verify if the guess is correct
     *  @param guess is the word the sender has sent as a guess in the guessSecret method
     *  @dev this method compares the keccak256 hashes of the guess parameter and s_secretWord
     */
    function verifyGuess(string memory guess) internal view returns (bool) {
        console.log(
            "Verifying that the secretWord %s is equal to the guess of %s",
            s_secretWord,
            guess
        );
        return
            keccak256(abi.encodePacked(guess)) ==
            keccak256(abi.encodePacked(s_secretWord));
    }

    /** @notice This is a helper function to add winners and emit a Win event
     */
    function addWinner() internal {
        console.log("Adding winner with address %s to winners", msg.sender);
        s_winners.push(
            WinnersStruct(
                msg.sender,
                address(this).balance,
                address(this).balance.getConversionRate(priceFeed)
            )
        );
        emit Win(
            msg.sender,
            address(this).balance,
            address(this).balance.getConversionRate(priceFeed),
            block.timestamp
        );
    }
}
