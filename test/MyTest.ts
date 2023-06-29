import {time, loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {anyValue} from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {expect} from "chai";
import {ethers} from "hardhat";

describe("MyTest",   function (){
    async function deployOneYearLockFixture() {
        const Main = await ethers.getContractFactory("Main");
        const main = await Main.deploy();
        return {main};
    }

    describe("Deployment", function () {
        it("console.log能否正常工作", async function () {
            const {main} = await loadFixture(deployOneYearLockFixture);

            await main.main()
        });
    });
});