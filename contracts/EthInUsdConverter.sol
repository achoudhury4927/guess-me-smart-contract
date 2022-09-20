// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/** @title A library that will convert an eth amount to its usd equivalent
 *  @author Adil Choudhury
 *  @notice You can use this contract for Goerli price feeds on ETH/USD
 *  @dev All function calls are currently implemented without side effects
 *  @custom:experimental This is an experimental contract.
 */
library EthInUsdConverter {
    /** @notice This function retrieves the current eth/usd value from the goerli chainlink oracle
     *  @return The current price of 1 eth in usd retrieved from chainlink
     *  @dev contract balance is retrieved in wei which is 18 decimal places of an Ether,
     *       which is why answer is multiplied by ten 0's to align their values.
     */
    function getPrice() public view returns (uint256) {
        //Goerli ETH/USD chainlink address: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return uint256(answer * 1e10);
    }

    /** @notice This function converts the eth emount to usd
     *  @return The current price of the eth amount passed as an argument
     *  @param ethAmount is the current balance of the contract in wei
     */
    function getConversionRate(uint256 ethAmount)
        public
        view
        returns (uint256)
    {
        uint256 ethUsdPrice = getPrice();
        uint256 ethAmountInUsd = (ethUsdPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
