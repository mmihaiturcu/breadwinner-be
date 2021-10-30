// console.log('tsconfig-paths');
// const fs = require('fs');
// console.log('fs', fs);
// const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json'));
// console.log('tsconfig is ', tsconfig);
// const { compilerOptions } = tsconfig;

// console.log(compilerOptions);

// const { register } = require('tsconfig-paths');

// const { baseUrl, outDir, paths } = compilerOptions;

// const outDirPaths = Object.entries(paths).reduce(
//     (outDirPaths, [k, v]) =>
//         Object.assign(outDirPaths, { [k]: v.map((path) => path.replace(/^src\//, `${outDir}/`)) }),
//     {}
// );

// console.log('OUT PATHS', outDirPaths);
// console.log('before register');

// register({ baseUrl, paths: outDirPaths });

const { replaceTscAliasPaths } = require('tsc-alias');

replaceTscAliasPaths({
    resolveFullPaths: true,
});

console.log('after replace');
