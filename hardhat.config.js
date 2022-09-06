require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.16",
    defaultNetwork: "hardhat",
    gasReporter: {
        enabled: true,
        currency: "USD",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};
