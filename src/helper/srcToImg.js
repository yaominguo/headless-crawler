const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const {
    promisify
} = require('util');
const writeFile = promisify(fs.writeFile);

module.exports = async(src, dir) => {
    if (/\.(jpg|png|gif)$/.test(src)) { //判断获取到的src是url还是base64
        await urlToImg(src, dir);
    } else {
        await base64ToImg(src, dir);
    }
};

// url=>image
const urlToImg = promisify((url, dir, callback) => {
    const mod = /^https:/.test(url) ? https : http; //判断是http还是https
    const ext = path.extname(url); //拿到扩展名
    const file = path.join(dir, `${Date.now()}${ext}`); //自设时间戳作为名字
    mod.get(url, res => {
        res.pipe(fs.createWriteStream(file))
            .on('finish', () => {
                callback();
                console.log(file);
            })
    });
});

// base64=>image
const base64ToImg = async function (base64Str, dir) {
    //data:image/jpeg;base64,/abcdefg    base64的格式一般是这样
    const matches = base64Str.match(/^data:(.+?);base64,(.+)$/);
    try {
        const ext = matches[1].split('/')[1].replace('jpeg', 'jpg');
        const file = path.join(dir, `${Date.now()}.${ext}`); //自设时间戳作为名字
        await writeFile(file, matches[2], 'base64');
        console.log(file);
    } catch (ex) {
        console.log('非法base64字符串');
    }
}