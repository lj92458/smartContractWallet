/**
 * xdeploy插件是怎么获取本文件的配置参数的？
 * const args = await import(
 *         path.normalize(
 *           path.join(
 *             hre.config.paths.root,
 *             hre.config.xdeploy.constructorArgsPath
 *           )
 *         )
 *       );
 *
 * if (ext === "ts") {
    initcode = contract.getDeployTransaction(...args.data);
} else if (ext === "js") {
    initcode = contract.getDeployTransaction(...args.default);
}
 */
export let data = [
    '0x59f662CF5ec57E1503c2eDEa084797428BBe00FF',
    '0x0000000000000000000000000000000000000000'
]
