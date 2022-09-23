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
    /** @notice This function retrieves the current eth/usd value from the chainlink oracle and converts the eth emount to usd
     *  @return The current price of the eth amount passed as an argument
     *  @param ethAmount is the current balance of the contract in wei
     *  @param priceFeed is the address of the chainlink contract
     */
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        uint256 ethUsdPrice = uint256(answer * 1e10);
        uint256 ethAmountInUsd = (ethUsdPrice * ethAmount) / 1e18;
        return ethAmountInUsd / 1e18;
    }
}
