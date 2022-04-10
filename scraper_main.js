const axios = require('axios') // http client
//const puppeteer = require('puppeteer'); //headless browser
const cheerio = require('cheerio');

let config = {
    headers: {
        "Cache-Control": "no-cache",
        //  "User-Agent": "PostmanRuntime/7.29.0",
        "user-agent": "Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus Player Build/MMB29T)",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive"
    }
}
let user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; XBOX_ONE_ED) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
    "PostmanRuntime/7.29.0",
    "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36",
    "Roku4640X/DVP-7.70 (297.70E04154A)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
    "Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus Player Build/MMB29T)",
    "Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/13.10586",
]

// walmart
const pages = 15
let counter = 0
const promises = []

/*
const food_type = [
    "apples",
    "bananas",
    "beans",
    "beef",
    "white cheese",
    "yellow cheese",
    "peppers",
    "broccoli",
    "chicken",
    "corn",
    "rice",
    "potato",
    "tuna",
    "fish",
    "water",
    "juice",
    "milk",
    "sauce"
]*/
let static_types = require('./bazaara-static-types.json')
let foods = static_types.types
let stores = static_types.stores
console.log(foods)

//const [store_name, store_info] = getRandomStoreAndLocation();

//Commented out logic to scrape for foods, uncomment to actually scrape and run
for (let i = 0, k = 0; i < 1; i++) {
    k = getRandomIntInclusive(0,6)
    for (let j = 1; j < pages; j++) {
        config.headers["user-agent"] = user_agents[k]
        //let op = axios.get(`https://www.walmart.com/search?q=${foods[i]}&affinityOverride=store_led&page=${j}`, config)
        promises.push(op)
    }
}

axios.all(promises).then(axios.spread(async (...args) => {
    console.log("arg length = ", args.length)
    const [store_name, store_info] = getRandomStoreAndLocation();
    for (let i = 0; i < args.length; i++) {
        data = []
        const res = args[i]
        const c = await cheerio.load(res.data);
        await c('[class="w_AZ"]').each((index, element) => {
            //results.push(c(element).text())
            counter++
            const label = c(' div > img').text();
            //{name : label, store : { name : <something> } }
            data.push({
                name: $(element).find(span.w_N).text,
                Price: $(element).find(div.b_black_f5_mr1_mr2-xl_lh-copy_f4-l).text,
                Imageurl: $(element).find().attr('srcset'),
                Redirurl: $(element).find(a).attr('href'),
                weight: $(element).find(span.w_N).text.split(',')[1],
                store: store_name,
                upc_code: 101010101010
            })
            console.log(`label: ${label}`)
        })
    }
})).then(() => {
    console.log(`TOTAL RESULTS: ${counter}`)
}).catch((e) => console.log(e))

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function getRandomStoreAndLocation(){
    const type_select_rand = getRandomIntInclusive(0,3)
    const coords_select_rand = getRandomIntInclusive(0,3)

    let store_type = stores[type_select_rand].name
    let store_loc_info = stores[type_select_rand].locations[coords_select_rand];
    console.log("Store name: ", store_type)
    console.log("Store info: ", store_loc_info)
    return [store_type, store_loc_info]
}
// Promise.all(promises).then(() => {
//     //   results.forEach(value => console.log(value))
// }).catch((e) => console.log(e))


// target
// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://www.target.com/s?searchTerm=bread');
//   //  let response = await page.screenshot({ path: 'example.png' });
//     console.log(await page.content())
//
//     await browser.close();
// })();
