const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (chainId == 31337) {
        log("Local network detected!");
        log("------------------------------------------------------------");
    }

    const guessMe = await deploy("GuessMe", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log("Deployed 01-deploy-guess-me");
    log("---------------------------------------------------------");
};

module.exports.tags = ["all", "guessme"];
