const $ = require('cheerio');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ignoreHTTPSErrors:true,headless:false,slowMo:250,timeout:0});
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.goto("https://search.douban.com/book/subject_search?search_text=%E6%B4%BB%E6%B3%95&cat=1001");

//   await page.waitForSelector('.item-root'); //等待元素加载之后，否则获取不异步加载的元素
  const html = await page.content();
  const booksDom = $('.item-root', html);
  let books = [];
  booksDom.each(function () {
    const bookdom = $(this);
    const imgUrl = $(bookdom.find('.cover')).attr('src');
    const title = $(bookdom.find('.title-text')).text();
    const rating_nums = $(bookdom.find('.rating_nums')).text();
    const rating_persons = $(bookdom.find('.pl')).text();
    const abstract = $(bookdom.find('.abstract')).text().split('/');
    let author = '';
    let press = '';
    let publicationTime = '';
    let price = '';
    if(abstract.length === 4){
        author = abstract[0];
        press = abstract[1];
        publicationTime = abstract[2];
        price = abstract[3];
    } else if (abstract.length === 5){
        author = abstract[0];
        author += ',' + abstract[1];
        press = abstract[2];
        publicationTime = abstract[3];
        price = abstract[4];
    } else if (abstract.length === 6){
        author = abstract[0];
        author += ',' + abstract[1];
        author += ',' + abstract[2];
        press = abstract[3];
        publicationTime = abstract[4];
        price = abstract[5];
    }
    const book = JSON.stringify({
        imgUrl,
        title,
        rating_nums,
        rating_persons,
        author,
        press,
        publicationTime,
        price
    })
    books.push(book);
  })
  console.log('books', books);
  page.close();
  await browser.close();
})();