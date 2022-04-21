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

/* Sanity Checks */
//console.log(foods)
// console.log(getRandomUPC())
//const [store_name, store_info] = getRandomStoreAndLocation();

//op = axios.get(`walmart_apples.html`)
//promises.push(op)
config.headers["user-agent"] = user_agents[getRandomIntInclusive(0,6)]
let op = axios.get(`https://www.walmart.com/search?q=apples`, config)
promises.push(op)

//Commented out logic to scrape for foods, uncomment to actually scrape and run
for (let i = 0, k = 0; i < 1; i++) {
    k = getRandomIntInclusive(0,6)
    for (let j = 1; j < pages; j++) {
        //rand_header = config.headers["user-agent"] = user_agents[k]
        //let op = axios.get(`https://www.walmart.com/search?q=${foods[i]}&affinityOverride=store_led&page=${j}`, rand_header)
        //promises.push(op)
    }
}
dataset = []
names = {"Jazz Apples": true}
axios.all(promises).then(axios.spread(async (...args) => {
    console.log("arg length = ", args.length)
    for (let i = 0; i < args.length; i++) {
        const res = args[i]
        //console.log("res = ", res)
        const $ = await cheerio.load(res.data);
        //console.log("$ = ", $)
        await $('[data-testid="list-view"]').each((index, element) => {
            counter+= 1
            const rand_upc = getRandomUPC()
            //dataset.push(c(element).text())
            //console.log("element = ", $(element).text())
            //console.log("element = ", $(element).html())
            //console.log("dataset push = ", dataset)
            let name_arr = $(element).find('div > div:nth-child(2) > span > span').text().split(',');
            let name = name_arr[0]

            //check if name is unique in dataset
            let weight = name_arr[1]
            //console.log("name_arr", name_arr)
            console.log("name = ", name, " || weight = ", weight)

            let image_url = $(element).find('div > div:nth-child(2) > div > img').attr('src');
            console.log("image_url = ", image_url)

            let price_arr = $(element).find('div:nth-child(2) > div:nth-child(1) > div:nth-child(1)').text().split('$');
            //console.log("price_arr = ", price_arr)
            let price = price_arr[1]
            console.log("price = ", price)

            if (names.hasOwnProperty(name) === false) {
                if (checkIfAttributesAreNull(name, weight, price, image_url) == true) {
                    names[name] = true
                    const store_rep_arr = JSON.parse(JSON.stringify(static_types.stores));
                    const rep_count = getRandomIntInclusive(1, 3)

                    for (let i = 0; i < rep_count; i++) {
                        console.log("store_rep_arr = ", store_rep_arr)
                        const rep_idx = getRandomIntInclusive(0, store_rep_arr.length - 1)
                        console.log("rep_idx = ", rep_idx)
                        let cur_store = store_rep_arr[rep_idx]
                        console.log("cur_store = ", cur_store.name)
                        let cur_store_loc = cur_store.locations[getRandomIntInclusive(0, 3)]
                        console.log("cur_store_loc", cur_store_loc)
                        const store_obj = {
                            "name": cur_store["name"],
                            "latitude": cur_store_loc["lat"],
                            "longtitude": cur_store_loc["lon"]
                        }
                        store_rep_arr.splice(rep_idx, 1)
                        dataset.push({
                            "name": String(name),
                            "upc_code": String(rand_upc),
                            "price": Number(price),
                            "store": store_obj,
                            "image_url": String(image_url),
                            "weight": String(weight)
                        })
                    }
                }
            }
            //productstring = JSON.stringify(product)
            //console.log("product = ", productstring)
        })
    }
    console.log("dataset final = ", dataset)
})).then(() => {
    console.log(`TOTAL RESULTS: ${counter}`)
}).catch((e) => console.log(e))

function fetchHtml() {
    fetch('./walmart_apples.html')
        .then((response) => {
            return response.text();
        })
        .then((html) => {
            document.body.innerHTML = html
        });
}

function checkIfAttributesAreNull(name, weight, price, image_url){
    if (typeof(name) == "undefined"){
        return false
    }
    else if (typeof(weight) == "undefined"){
        return false
    }
    else if (typeof(price) == "undefined"){
        return false
    }
    else if (typeof(image_url) == "undefined"){
        return false
    }
    else{
        return true
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function getRandomStoreAndLocation(){
    const type_select_rand = getRandomIntInclusive(0,3)
    const coords_select_rand = getRandomIntInclusive(0,3)
    const store_obj = {
        "name": "",
        "latitude": 0.0,
        "longitude": 0.0 }

    let store_type = stores[type_select_rand].name
    let store_loc_info = stores[type_select_rand].locations[coords_select_rand]

    //populating store object
    store_obj.name = store_type
    store_obj.latitude = store_loc_info.lat
    store_obj.longitude = store_loc_info.lon
    //console.log("Store object = ", store_obj)
    return store_obj
}

function getRandomUPC(){
    return getRandomIntInclusive(100000000000,999999999999)
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
