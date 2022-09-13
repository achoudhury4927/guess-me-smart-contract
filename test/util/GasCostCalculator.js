const { deployments, ethers, getNamedAccounts } = require("hardhat");

module.exports = async (txResponse) => {
    const txReceipt = await txResponse.wait();
    const { gasUsed, effectiveGasPrice } = txReceipt;
    const gasCost = gasUsed.mul(effectiveGasPrice);
    return gasCost;
};
