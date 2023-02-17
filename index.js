// Import puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs');
const cities = require('./cities.json');
const states = require('./states.json');
var download = require('image-downloader');

(async () => {
    // Launch the browser=
    const browser = await puppeteer.launch({headless:false, ignoreHTTPSErrors: true, acceptInsecureCerts: true, args: ['--proxy-bypass-list=*', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-first-run', '--no-sandbox', '--no-zygote', '--single-process', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list', '--enable-features=NetworkService']});

    console.log("Loading...")

    console.log("Scraping States...")

    var countStates = 1

    for(const state of states){

        console.log("**** Start State : "+countStates)

        // Create a page
        const page = await browser.newPage()
    
        const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
        await page.setDefaultNavigationTimeout(0)
        await page.setUserAgent(ua)
        await page.goto(state, {
            waitUntil: 'load',
            timeout: 0
        })
    
    
        var pageNumber = 1
    
        await run(browser, page, "state", countStates, pageNumber)
    
        while(true){
    
            var nextPage = ""
    
            try{
                nextPage = await page.$eval(".caret-right-large", el => el.getAttribute("href"))
                pageNumber++
    
                await page.goto(nextPage, {
                    waitUntil: 'load',
                    timeout: 0
                })
        
                await run(browser, page, "state", countStates, pageNumber)
            }catch{
                break
            }
    
        }
    
        // fs.writeFile("result.json", JSON.stringify(data), function(err) {
        //     if (err) {
        //         console.log(err);
        //     }
        // });
        
        console.log("**** End State : "+countStates)
        countStates++
    }

    console.log("Scraping Cities...")

    var countCities = 1

    for(const city of cities){
        console.log("**** Start City : "+countCities)

        // Create a page
        const page = await browser.newPage()
    
        const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
        await page.setDefaultNavigationTimeout(0)
        await page.setUserAgent(ua)
        await page.goto(city, {
            waitUntil: 'load',
            timeout: 0
        })
    
        var pageNumber = 1
    
        await run(browser, page, "city", countCities, pageNumber)
    
        while(true){
    
            var nextPage = ""
    
            try{
                nextPage = await page.$eval(".caret-right-large", el => el.getAttribute("href"))
                pageNumber++
    
                await page.goto(nextPage, {
                    waitUntil: 'load',
                    timeout: 0
                })
        
                await run(browser, page, "city", countCities, pageNumber)
            }catch{
                break
            }
    
        }
    
        // fs.writeFile("result.json", JSON.stringify(data), function(err) {
        //     if (err) {
        //         console.log(err);
        //     }
        // });
    
        console.log("**** End City : "+countCities)
        countCities++
    }

    // Close browser.
    await browser.close();
})();


async function run(browser, page, type, count, pageNumber = 1){
    const targets = await page.$$('.placard')
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"

    var index = 0

    for(const target of targets) {

        console.log("---- Start Item : " + pageNumber + ":" + (index+1))

        const link = await target.$eval('.placard-pseudo a', el => el.getAttribute('href'))
        
        console.log("link: " + link)

        const newPage = await browser.newPage()
        await newPage.setDefaultNavigationTimeout(0)
        await newPage.setUserAgent(ua)
        await newPage.goto(link, {
            waitUntil: 'load',
            timeout: 0
        })

        const addresses = await newPage.$$eval('#breadcrumb-section .breadcrumbs__crumb', options => {
            return options.map((option, idx) => {
                if(idx+1 == options.length) {

                    const address = option.textContent.trim().split(",")

                    if(address.length == 1) return false

                    return address[0]
                } else {
                    return option.textContent.trim()
                }
            });
        })

        console.log("addresses: " + addresses)

        if(addresses[addresses.length-1] == false) continue
        
        const contactName = await newPage.$$eval('.contact', options => {
            return options.map((option) => option.getAttribute("title"))
        })

        console.log("contactName: " + contactName)

        const contactNumber = await newPage.$$eval('.cta-phone-number .phone-number', options => {
            return options.map((option) => option.textContent)
        })

        console.log("contactNumber: " + contactNumber)

        const images = await newPage.$$eval('img.figure', options => {
            return options.map((option) => option.getAttribute('src'))
        })

        var imageCounts = 1

        for(const image of images){
            if(!image) continue
            const options = {
                url: image,
                dest: '../../images/'+ type + "-" + count + "-" + pageNumber + "-" + (index+1) +  "-" + imageCounts + ".jpg"
            };

            download.image(options)
            .then(({ filename }) => {
                console.log('Saved to', filename); // saved to /path/to/dest/image.jpg
            })
            .catch((err) => console.error(err));

            imageCounts++
        }

        console.log("images: " + images)

        var SaleCondition = ""
        var SaleType = ""
        var BuildingSize = ""
        var BuildingClass = ""
        var YearBuilt = ""
        var PropertySubtype = ""
        var Price = ""
        var PricePer = ""
        var LotSize = ""
        var NoStories = ""
        var mapLat = ""
        var mapLong = ""

        try{
            try{
                SaleCondition = await newPage.$eval('#property-facts [data-fact-type="SaleConditions"] .property-facts__data-item-text', el => el.textContent.trim())
                if(SaleCondition == "Auction Sale") continue
            }catch{
                SaleCondition = await newPage.$eval('[data-fact-type="SaleCondition"]:nth-child(2)', el => el.textContent.trim())
                if(SaleCondition == "Auction Sale") continue
            }
        }catch{
            console.log("Error: SaleCondition")
        }
        
        try{
            try{
                SaleType = await newPage.$eval('#property-facts [data-fact-type="SaleType"] .property-facts__data-item-text', el => el.textContent.trim())
            }catch{
                SaleType = await newPage.$eval('[data-fact-type="SaleType"]:nth-child(2)', el => el.textContent.trim())
            }
        }catch{
            console.log("Error: SaleType")
        }
        
        try{
            try{
                PropertyType = await newPage.$eval('#property-facts [data-fact-type="PropertyType"] .property-facts__data-item-text', el => el.textContent.trim())
            }catch{
                PropertyType = await newPage.$eval('[data-fact-type="PropertyType"]:nth-child(2)', el => el.textContent.trim())
            }
        }catch{
            console.log("Error: PropertyType")
        }
        
        try{
            try{
                BuildingSize = await newPage.$eval('#property-facts [data-fact-type="BuildingSize"] .property-facts__data-item-text', el => el.textContent.trim())
            }catch{
                BuildingSize = await newPage.$eval('[data-fact-type="BuildingSize"]:nth-child(2)', el => el.textContent.trim())
            }
        }catch{
            console.log("Error: BuildingSize")
        }
        
        try{
            try{
                BuildingClass = await newPage.$eval('#property-facts [data-fact-type="BuildingClass"] .property-facts__data-item-text', el => el.textContent.trim())
            }catch{
                BuildingClass = await newPage.$eval('[data-fact-type="BuildingClass"]:nth-child(2)', el => el.textContent.trim())
            }
        }catch{
            console.log("Error: BuildingClass")
        }
        
        try{
            try{
                YearBuilt = await newPage.$eval('#property-facts [data-fact-type="YearBuiltRenovated"] .property-facts__data-item-text', el => el.textContent.trim())
            }catch{
                YearBuilt = await newPage.$eval('[data-fact-type="YearBuilt"]:nth-child(2)', el => el.textContent.trim())
            }
        }catch{
            console.log("Error: YearBuilt")
        }
        
        try{
            try{
                PropertySubtype = await newPage.$eval('#property-facts [data-fact-type="PropertySubtype"] .property-facts__data-item-text', el => el.textContent.trim())
            }catch{
                try{
                    PropertySubtype = await newPage.$eval('[data-fact-type="PropertySubtype"]:nth-child(2) .expandable-subtype-first', el => el.textContent.trim())
                }catch{
                    PropertySubtype = await newPage.$eval('[data-fact-type="PropertySubtype"]:nth-child(2)', el => el.textContent.trim())
                }
            }
        }catch{
            console.log("Error: PropertySubtype")
        }
        
        
        try{
            try{
                Price = await newPage.$eval('#property-facts [data-fact-type="Price"] .property-facts__data-item-text', el => el.textContent.trim())
            }catch{
                Price = await newPage.$eval('[data-fact-type="Price"]:nth-child(2)', el => el.textContent.trim())
            }
        }catch{
            console.log("Error: Price")
        }
        
        try{
            try{
                PricePer = await newPage.$eval('#property-facts [data-fact-type="PricePer"] .property-facts__data-item-text', el => el.textContent.trim())
            }catch{
                PricePer = await newPage.$eval('[data-fact-type="PricePerSquareFoot"]:nth-child(2)', el => el.textContent.trim())
            }
        }catch{
            console.log("Error: PricePer")
        }
        
        try{
            LotSize = await newPage.$eval('[data-fact-type="LotSize"]:nth-child(2)', el => el.textContent.trim())
        }catch{
            console.log("Error: LotSize")
        }
        
        try{
            NoStories = await newPage.$eval('[data-fact-type="NoStories"]:nth-child(2)', el => el.textContent.trim())
        }catch{
            console.log("Error: NoStories")
        }

        try{
            mapLat = await newPage.$eval('.rangemap', el=>el.getAttribute("listing-lat"))
        }catch{
            console.log("Error: Lat")
        }

        try{
            mapLong = await newPage.$eval('.rangemap', el=>el.getAttribute("listing-lng"))
        }catch{
            console.log("Error: Long")
        }

        console.log("SaleCondition : " + SaleCondition)
        console.log("SaleType : " + SaleType)
        console.log("BuildingSize : " + BuildingSize)
        console.log("BuildingClass : " + BuildingClass)
        console.log("YearBuilt : " + YearBuilt)
        console.log("PropertySubtype : " + PropertySubtype)
        console.log("Price : " + Price)
        console.log("PricePer : " + PricePer)
        console.log("LotSize : " + LotSize)
        console.log("NoStories : " + NoStories)
        console.log("Lat: " + mapLat)
        console.log("Long: " + mapLong)        

        console.log("---- End Item : " + pageNumber + ":" + (index+1))

        index++
        await newPage.close()
    }
}