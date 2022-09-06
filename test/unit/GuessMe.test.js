const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

const secretWord = "secret";

describe("GuessMe", async function () {
    let guessMe;
    let deployer;

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        guessMe = await ethers.getContract("GuessMe", deployer);
        await guessMe.setSecretWord(secretWord);
    });

    describe("Constructor", async function () {
        it("sets the owner correctly", async function () {
            const response = await guessMe.i_owner();
            assert.equal(response, deployer);
        });
    });

    describe("Secret", async function () {
        it("can be set by owner", async function () {
            expect(guessMe.setSecretWord("test")).to.not.be.reverted;
        });
        it("can be set be read by owner", async function () {
            const response = await guessMe.getSecretWord();
            assert.equal(response, secretWord);
        });
        //add tests for non-owner calling set and get
    });
});
