const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;
const networkConfig = {
    4: {
        name: "rinkeby",
        ethUsdPriceFeedContractAddress: "notusedgyet",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeedContractAddress: "notusedyet",
    },
};

module.exports = {
    developmentChains,
    networkConfig,
    DECIMALS,
    INITIAL_ANSWER,
};
