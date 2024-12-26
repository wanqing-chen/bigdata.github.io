const { exec } = require('child_process');
const path = require('path');

// 假设文档所在目录，根据实际情况修改
const docsDir = path.join(__dirname, 'article');

function getLastUpdatedTime(filePath) {
    return new Promise((resolve, reject) => {
        const relativeFilePath = path.relative(docsDir, filePath);
        const gitLogCommand = `git log -1 --format="%cd" --date=iso8601 -- "${relativeFilePath}"`;
        exec(gitLogCommand, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// 可以在后续结合docsify文档路径进行调用获取更新时间并替换相应占位符等操作
// 例如假设当前有个docsify的路由对应的文件路径为routeFilePath
// getLastUpdatedTime(routeFilePath).then((time) => {
//     // 在这里进行将获取到的时间替换到docsify相应显示位置的逻辑
//     console.log(time);
// }).catch((err) => {
//     console.error(err);
// });

module.exports = {
    getLastUpdatedTime
};