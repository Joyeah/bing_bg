const util = require('./util');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const https = require('https');
const moment = require('moment');

var path = require('path');
// var configFile = path.resolve('./config', process.env.NODE_ENV + '.js');
// var config = require(configFile);
var config = require('config');
console.log(config);

util.log.info('Begin run Bing_BG app..');
util.log.info('chrome path: ', config.get('executablePath'));
util.log.info('保存路径:', config.get('imgdir'));
util.log.info('argv: ', process.argv);

//判断参数：--all
argv = process.argv.splice(2);
const __all = argv.filter((val, idx) => {
    return val == '--all'
});


(async () => {
    let executablePath = config.get('executablePath') 
    util.log.info(executablePath);
    let options = {
        defaultViewport: { width: 1920, height: 1024 },
        slowMo: 300
    }
    let headless = config.get('headless');
    if(headless == false){
        options.headless = headless;
    }
    if(executablePath){
        options.executablePath = executablePath;
    }
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; ++i)
            console.log(`${i}: ${msg.args()[i]}`); // 打印到代码的控制台
    });

    await page.goto('https://cn.bing.com/');
    await page.waitFor(1000);
    await downloadImage(page);
 
    await browser.close();
    util.log.info('run ended.')
})();

/**
 * download backgroup image
 * @param {puppeteer.Promise<Page>} page 
 */
async function downloadImage(page){
    let bgimg = await page.evaluate(() => {
        let div = document.querySelector('#bgDiv');
        let style = getComputedStyle(div);
        return style.backgroundImage;
    });

    util.log.info({'Background-image': bgimg});
    if (!bgimg) {
        util.warn('未到到背景图片地址');
        return false;
    }

    let imgurl = bgimg.substring(bgimg.indexOf('(') + 1, bgimg.indexOf(')'));
    imgurl = imgurl.replace(/"/g, '');
    //记录图片url
    fs.appendFile('imgurls.log', imgurl + '\n', err=>{
        if(err){
            util.log.error(err)
        }else{
            util.log.info(`imgurl: ${imgurl}`)
        }
    })
    let done = await saveImage(imgurl).catch(err=>{
        util.log.error(err);
    });

    if(__all.length == 0){
        return true;
    }

    await page.waitFor(1000);
    let exist = await backward(page);
    if (exist) {
        await downloadImage(page);
    }
}
/**
 * Backward page
 * @param {puppeteer.Page} page
 */
async function backward(page){
    let tabindex = await page.$eval('#sh_igl', e=>{
        return e.getAttribute('tabindex');
    })
    // let tabindex = await page.evaluate(()=>{
    //     let dom = document.querySelector('#sh_igl');
    //     return dom.getAttribute('tabindex');
    // })
    util.log.info({tabindex:tabindex});
    if(tabindex == "-1") {
        util.log.info('结束遍历页面');
        return false;
    }
    util.log.info('点击前一页');
    await page.click('#sh_igl');
    await page.waitFor(1000);
    await page.waitForSelector('#bgDiv');
    return true;
}
/**
 * 保存图片
 * @param {string} imgurl
 */
async function saveImage(imgurl){
    let params = imgurl.substr(imgurl.indexOf('?')+1).split('&');
    let imgpath = ""
    for(var i=0;i<params.length;i++){
        let kv = params[i].split('=');
        if (kv.length == 2 && kv[0] == 'id' && (kv[1].endsWith('.jpg') || kv[1].endsWith('.png'))){
            imgpath = kv[1];
        }
    }
    imgpath = path.resolve(config.get('imgdir'), imgpath || moment().format('[bing_bg_]YYYYMMDDHHmmSS[.jpg]'));
    util.log.warn('Request and Save:' + imgpath);
    return new Promise((resolve, reject) => {
        https.get(imgurl, (res) => {
            let imgData = "";
            res.setEncoding('binary');
            res.on("data", (chunk) => {
                imgData += chunk;
            })
            res.on("end", () => {
                fs.writeFile(imgpath, imgData, "binary", (err) => {
                    if (err) {
                        util.log.info(err);
                        reject(false);
                    }
                    util.log.info(imgpath, '[saved]');
                    resolve(true);
                })
            })
            res.on('error', err =>{
                reject(false);
            })
        });
    })
}