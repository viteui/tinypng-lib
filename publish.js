import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 升级./pkg下 package.json的版本号最后一位+1
const pkgDir = '.'; // Ensure pkgDir is defined
const pkgJsonPath = path.resolve(pkgDir, 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
if (!pkgJson.version) {
    throw new Error('package.json 中没有 version 字段');
}
const versions = pkgJson.version.split(".");
console.log(versions);
if (versions.length !== 3 || isNaN(versions[2])) {
    throw new Error('package.json 中 version 字段格式不正确');
}
let lastVersion = parseInt(versions[2]);
lastVersion += 1;
versions[2] = lastVersion.toString();
pkgJson.version = versions.join(".");
// 新版本
console.log("新版本: " + pkgJson.version);
fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

// 打包 流输出日志
execSync('npm publish');
// 同步git
execSync('git add .');
execSync('git commit -m "publish version ' + pkgJson.version + '"');
execSync('git push');
