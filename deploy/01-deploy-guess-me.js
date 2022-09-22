const { network } = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        log(
            "01-deploy-guess-me: Local network detected! Retrieving Mock Chainlink Oracle..."
        );
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
        log("01-deploy-guess-me: Retrieved!");
        log("------------------------------------------------------------");
    } else {
        ethUsdPriceFeedAddress =
            networkConfig[chainId]["ethUsdPriceFeedContractAddress"];
    }

    const args = [ethUsdPriceFeedAddress];
    log("01-deploy-guess-me: Deploying GuessMe");
    log("---------------------------------------------------------");

    const guessMe = await deploy("GuessMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log("01-deploy-guess-me: Deployed!");
    log("---------------------------------------------------------");
};

module.exports.tags = ["all", "guessme"];
