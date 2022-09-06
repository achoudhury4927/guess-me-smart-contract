// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "hardhat/console.sol";

error GuessMe__NotOwner();

/** @title A contract for the guess me game
 *  @author Adil
 *  @notice This contract allows users to guess a secret word and allow them to withdraw all eth on the smart contract if they're correct
 *  @dev This will implement chainlink price feeds to report usd value of balance in contract
 *  @custom:experimental This is an experimental contract. Anyone can view the setting of the secret if they know how to :).
 */
contract GuessMe {
    /** @notice This holds the address of the owner of the contract
     *  @dev This will be set in the constructor when contract is deployed
     */
    address public immutable i_owner;
    string internal s_secretWord;

    constructor() {
        console.log("Setting owner as: %s", msg.sender);
        i_owner = msg.sender;
    }

    /** @notice This modifier ensures that only the owner of the contract can call a modified function
     *  @dev Using if (msg.sender != i_owner) revert GuessMe__NotOwner() costs 21231 gas
     *  @dev Using require(msg.sender == owner, "Not Owner") costs 21485 gas. Longer string increases gas.
     *  @dev Current implementation only costs 21192 gas
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
}
