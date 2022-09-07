const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

const secretWord = "secret";

describe("GuessMe", async function () {
    let guessMe;
    let deployer;
    let accounts;
    let guessMeNotOwnerConnectedContract;

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        guessMe = await ethers.getContract("GuessMe", deployer);
        accounts = await ethers.getSigners();
        guessMeNotOwnerConnectedContract = await guessMe.connect(accounts[1]);
    });

    describe("Deploment", async function () {
        it("Should set the correct owner", async function () {
            const response = await guessMe.i_owner();
            assert.equal(response, deployer);
        });
    });

    describe("Secret", async function () {
        it("Should set the secret word when sender is owner", async function () {
            await expect(guessMe.setSecretWord("test")).to.not.be.reverted;
        });
        it("Should fail to set when the sender is not the owner", async function () {
            await expect(
                guessMeNotOwnerConnectedContract.setSecretWord("notOwner")
            ).to.be.reverted;
        });
        it("Should return the word when sender is owner", async function () {
            await guessMe.setSecretWord(secretWord);
            const response = await guessMe.getSecretWord();
            assert.equal(response, secretWord);
        });
        it("Should fail to return the word when sender is not the owner", async function () {
            await expect(guessMeNotOwnerConnectedContract.getSecretWord()).to.be
                .reverted;
        });
    });
});
