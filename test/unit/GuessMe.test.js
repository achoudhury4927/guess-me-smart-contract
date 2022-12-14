const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const GasCostCalculator = require("../util/GasCostCalculator");

describe("GuessMe", async function () {
    let guessMe;
    let deployer;
    let accounts;
    let guessMeNotOwnerConnectedContract;

    const secretWord = "secret";
    const sendValue = ethers.utils.parseEther("1");

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        guessMe = await ethers.getContract("GuessMe", deployer);
        accounts = await ethers.getSigners();
        guessMeNotOwnerConnectedContract = await guessMe.connect(accounts[1]);
    });

    describe("Deployment", async function () {
        it("Should set the correct owner", async function () {
            const response = await guessMe.i_owner();
            assert.equal(response, deployer);
        });
    });

    describe("Secret", async function () {
        it("Should set the secret word when sender is owner", async function () {
            const secretWordForTest = "test";
            await expect(guessMe.setSecretWord(secretWordForTest)).to.not.be
                .reverted;
            const response = await guessMe.getSecretWord();
            assert.equal(response, secretWordForTest);
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

    describe("Guess", async function () {
        beforeEach(async () => {
            await guessMe.guessSecret("test", { value: sendValue });
            await guessMe.setSecretWord(secretWord);
        });
        it("Should send the contracts ether balance with the correct guess", async function () {
            const startingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            const startingUserBalance = await guessMe.provider.getBalance(
                deployer
            );

            const txResponse = await guessMe.guessSecret(secretWord);
            const gasCost = await GasCostCalculator(txResponse);

            const endingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            const endingUserBalance = await guessMe.provider.getBalance(
                deployer
            );

            assert.equal(endingContractBalance.toString(), 0);
            assert.equal(
                startingContractBalance.add(startingUserBalance).toString(),
                endingUserBalance.add(gasCost).toString()
            );
        });
        it("Should fail with an incorrect guess and add value sent to contract balance", async function () {
            const startingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            const startingUserBalance =
                await guessMeNotOwnerConnectedContract.provider.getBalance(
                    accounts[1].address
                );

            const txResponse =
                await guessMeNotOwnerConnectedContract.guessSecret("fail", {
                    value: sendValue,
                });
            const gasCost = await GasCostCalculator(txResponse);

            const endingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            const endingUserBalance =
                await guessMeNotOwnerConnectedContract.provider.getBalance(
                    accounts[1].address
                );

            assert.equal(
                endingContractBalance.toString(),
                startingContractBalance.add(sendValue).toString()
            );
            assert.equal(
                startingUserBalance.sub(gasCost).sub(sendValue).toString(),
                endingUserBalance.toString()
            );
        });
    });

    describe("Winner", async function () {
        beforeEach(async () => {
            await guessMe.guessSecret("test", { value: sendValue });
            await guessMe.setSecretWord(secretWord);
        });
        it("Should add the winners address, amount of eth won and eth in usd value to the winners array", async function () {
            await guessMeNotOwnerConnectedContract.guessSecret(secretWord);
            let [winner] = await guessMe.getWinners();
            assert.equal(winner[0], accounts[1].address);
            assert.equal(winner[1].toString(), sendValue.toString());
            assert.equal(winner[2].toString(), "2000");
        });
        it("Should emit an event with a winning guess", async function () {
            await expect(
                guessMeNotOwnerConnectedContract.guessSecret(secretWord)
            )
                .to.emit(guessMe, "Win")
                .withArgs(
                    accounts[1].address,
                    sendValue,
                    2000,
                    await helpers.time.latest()
                );
        });
        it("Should add the same winner twice", async function () {
            await guessMeNotOwnerConnectedContract.guessSecret(secretWord);
            const testSendValue = ethers.utils.parseEther("2");
            await guessMe.guessSecret("test", { value: testSendValue });
            await guessMeNotOwnerConnectedContract.guessSecret(secretWord);

            let [winner1, winner2] = await guessMe.getWinners();
            assert.equal(winner1[0], accounts[1].address);
            assert.equal(winner1[1].toString(), sendValue.toString());
            assert.equal(winner1[2].toString(), "2000");
            assert.equal(winner2[0], accounts[1].address);
            assert.equal(winner2[1].toString(), testSendValue.toString());
            assert.equal(winner2[2].toString(), "4000");
        });
        it("Should add different winners", async function () {
            await guessMe.guessSecret(secretWord);
            const testSendValue = ethers.utils.parseEther("2");
            await guessMe.guessSecret("test", { value: testSendValue });
            await guessMeNotOwnerConnectedContract.guessSecret(secretWord);

            let [winner1, winner2] = await guessMe.getWinners();
            assert.equal(winner1[0], deployer);
            assert.equal(winner1[1].toString(), sendValue.toString());
            assert.equal(winner1[2].toString(), "2000");
            assert.equal(winner2[0], accounts[1].address);
            assert.equal(winner2[1].toString(), testSendValue.toString());
            assert.equal(winner2[2].toString(), "4000");
        });
    });

    describe("Receive", async function () {
        it("Should update balance when receive is called", async function () {
            const startingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            const tx = await accounts[1].sendTransaction({
                to: guessMe.address,
                value: sendValue,
            });
            const endingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            assert.equal(
                endingContractBalance.toString(),
                startingContractBalance.add(sendValue).toString()
            );
        });
    });

    describe("Fallback", async function () {
        it("Should update balance when fallback is called", async function () {
            const startingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            const tx = await accounts[1].sendTransaction({
                to: guessMe.address,
                value: sendValue,
                data: "0x1567987489",
            });
            const endingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            assert.equal(
                endingContractBalance.toString(),
                startingContractBalance.add(sendValue).toString()
            );
        });
    });

    describe("Rescue", async function () {
        beforeEach(async () => {
            await guessMe.guessSecret("test", { value: sendValue });
        });
        it("Should withdraw contract balance when rescue is called by owner", async function () {
            const startingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            const startingUserBalance = await guessMe.provider.getBalance(
                deployer
            );

            const txResponse = await guessMe.rescue();
            const gasCost = await GasCostCalculator(txResponse);

            const endingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );
            const endingUserBalance = await guessMe.provider.getBalance(
                deployer
            );

            assert.equal(endingContractBalance.toString(), 0);
            assert.equal(
                startingContractBalance.add(startingUserBalance).toString(),
                endingUserBalance.add(gasCost).toString()
            );
        });
        it("Should revert when rescue called by an address other than the owner", async function () {
            const startingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );

            await expect(guessMeNotOwnerConnectedContract.rescue()).to.be
                .reverted;

            const endingContractBalance = await guessMe.provider.getBalance(
                guessMe.address
            );

            assert.equal(
                endingContractBalance.toString(),
                startingContractBalance.toString()
            );
        });
    });

    // Uncomment these test after changing function visibility from internal to public
    // describe("verifyGuess", async function () {
    //     beforeEach(async () => {
    //         await guessMe.setSecretWord(secretWord);
    //     });
    //     it("Should return TRUE with the correct string", async function () {
    //         //const expectedResponse = true;
    //         const txResponse = await guessMe.verifyGuess(secretWord);
    //         assert.isTrue(txResponse);
    //     });
    //     it("Should return FALSE with an incorrect string", async function () {
    //         const txResponse = await guessMe.verifyGuess("fail");
    //         assert.isNotTrue(txResponse);
    //     });
    //     it("Should return FALSE with another data type", async function () {
    //         const txResponse = await guessMe.verifyGuess(deployer);
    //         assert.isNotTrue(txResponse);
    //     });
    // });
});
