const $ = require('cheerio');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ ignoreHTTPSErrors: true, headless: false, slowMo: 250, timeout: 0 });
  // 使用 try catch 捕获异步中的错误进行统一的错误处理
  try {
    mobanList = [];
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(true);
    await page.goto('http://www.dede58.com/a/dedecode/');
    await handleListData();
    page.close();
    async function handleListData() {
      //等待元素加载之后，否则获取不异步加载的元素
      await page.waitForSelector('.list_mblb');
      const html = await page.content();
      const mobanDom = $('.col_four', html);
      console.log('mobanDom', mobanDom.length);

      let mobans = [];
      for (let i = 1; i <= mobanDom.length - 18; i++) {
        const mobandom = $(mobanDom[i - 1]);
        const imgUrl = $(mobandom.find('.lazy')).attr('src');
        const title = $(mobandom.find('.project-desc p a')).text();
        const detailUrl = $(mobandom.find('.projects-thumbnail > a')).attr('href');
        const previewContent = await handleDetailData(detailUrl);

        const moban = {
          imgUrl,
          title,
          detailUrl,
          previewContent,
        };
        mobans.push(moban);
      }

      const pageDomList = $('.page ul li a', html);
      console.log('pageDomList', pageDomList.length);
      for (let i = 1; i <= pageDomList.length; i++) {
        const pageDom = $(pageDomList[i - 1]);
        if (pageDom.text() === '下一页') {
          console.log('点击下一页', pageDom);
          // 模拟点击跳转
          await page.click(pageDom);
          // 等待页面加载完毕，这里设置的是固定的时间间隔，之前使用过page.waitForNavigation()，但是因为等待的时间过久导致报错（Puppeteer默认的请求超时是30s,可以修改）,因为这个页面总有一些不需要的资源要加载，而我的网络最近日了狗，会导致超时，因此我设定等待2.5s就够了
          //   await page.waitFor(2000);
          //   // 递归调用处理列表数据
          //   await handleListData();
        }
      }
      mobanList.push(mobans);
      console.log('mobanList', mobanList, mobanList.length);
    }
    async function handleDetailData(detailUrl) {
      const page2 = await browser.newPage();
      await page2.setJavaScriptEnabled(true);
      await page2.goto(detailUrl);

      await page2.waitForSelector('.preview-content'); //等待元素加载之后，否则获取不异步加载的元素
      let htmlDetail = await page2.content();
      const previewContent = $($(htmlDetail).find('.preview-content')).text();
      page2.close();
      return previewContent;
    }
    //   let mobansNum = mobans.length - 1;
    //   page.close();

    //   // 使用一个 for await 循环，不能一个时间打开多个网络请求，这样容易因为内存过大而挂掉
    //   for (let i = 1; i <= TOTAL_PAGE; i++) {
    //     // 找到分页的输入框以及跳转按钮
    //     const pageInput = await page.$(`.J_Input[type='number']`);
    //     const submit = await page.$('.J_Submit');
    //     // 模拟输入要跳转的页数
    //     await pageInput.type('' + i);
    //     // 模拟点击跳转
    //     await submit.click();
    //     // 等待页面加载完毕，这里设置的是固定的时间间隔，之前使用过page.waitForNavigation()，但是因为等待的时间过久导致报错（Puppeteer默认的请求超时是30s,可以修改）,因为这个页面总有一些不需要的资源要加载，而我的网络最近日了狗，会导致超时，因此我设定等待2.5s就够了
    //     await page.waitFor(2500);

    //     // 清除当前的控制台信息
    //     console.clear();

    //     // 处理数据，这个函数的实现在下面
    //     await handleData();
    //     // 一个页面爬取完毕以后稍微歇歇，不然太快淘宝会把你当成机器人弹出验证码（虽然我们本来就是机器人）
    //     await page.waitFor(2500);
    //   }

    //   await page.goto(mobans[mobansNum]);
    //   let htmlDetail = await page.content();
    //   const previewContent = $('.preview-content', htmlDetail);
    //   mobans[mobansNum].previewContent = previewContent;

    await browser.close();
  } catch (error) {
    // 出现任何错误，打印错误消息并且关闭浏览器
    console.log('catch', error);
    await browser.close();
  } finally {
    // 最后要退出进程
    process.exit(0);
  }
})();
