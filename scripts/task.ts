import { task } from "hardhat/config";

task("runArgs", "run with args")
    .addPositionalParam("param1")
    .addPositionalParam("param2")
    .setAction(async (taskArgs) => {
        console.log(taskArgs);
    });