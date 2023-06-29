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
    '0xB0d1435590B4f14A5f4414f93489945546162ffc',
    '0x0000000000000000000000000000000000000000'
]
