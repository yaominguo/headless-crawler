const {
    mn
} = require('./config/default');
const puppeteer = require('puppeteer');
const srcToImg = require('./helper/srcToImg');

const gotoUrl='https://image.baidu.com/';
const searchWord='猫';

(async() => {
    const browser = await puppeteer.launch({executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',headless: false});
    const page = await browser.newPage();
    await page.goto(gotoUrl); //打开百度图片
    console.log(`go to ${gotoUrl}`);

    await page.setViewport({ //由于有懒加载，所以设置屏幕大一点能多获取一些图片
        width: 1920,
        height: 1080
    });
    console.log('reset viewport');

    await page.focus('#kw'); //focus在搜索输入框中
    await page.keyboard.sendCharacter(searchWord); //在输入框中输入
    await page.click('.s_search'); //点击搜索按钮
    console.log('go to search list');

    page.on('load', async() => {
        console.log('page loading done, start fetch...');
        // 待图片列表页面加载出来后，获取所有图片元素并将其src返回成数组格式
        const srcs = await page.evaluate(() => {
            const images = document.querySelectorAll('img.main_img');
            return Array.prototype.map.call(images, img => img.src);
        });
        console.log(`get ${srcs.length} images, start download...`);
        // 遍历图片的src
        srcs.forEach(async (src) => {
            //sleep
            await page.waitFor(200);//延迟一下防止触发反爬虫
            await srcToImg(src, mn);
        });

        await browser.close();
    })
})();