let fs = require('fs')
let getVerseData = require('./getVerseData')
let getLocalVerseData = require('./getLocalVerseData')
let getStrongsData = require('./getStrongsData')
let getStrongsJSON = require('./getStrongsJSON')
let references = require('./references.json')

// classes are not necessary, but I thought I might use it cause I never do :)
/*
let referenceList = require('./referenceList.json')

class Reference {
  constructor(book, chapter, verse) {
    this.book = book
    this.chapter = chapter
    this.verse = verse
  }
}

let references = []

referenceList.forEach( ({book, chapters}) => {
  chapters.forEach(({chapter, verses}) => {
    let ref = new Reference(book, parseInt(chapter), parseInt(verses))
    references.push(ref)
  })
})
fs.writeFileSync("./references.json", JSON.stringify(references, null, 2))
*/

async function getDataFromWebsite(references) {
  for(const {book, chapter, verse: verseCount} of references){

    fs.mkdir(`./BibleHub/html/${book}/${chapter}`, { recursive: true }, ()=>{})
    fs.mkdir(`./BibleHub/json/${book}/${chapter}`, { recursive: true }, ()=>{})

    for(let verse = 1; verse <= verseCount; verse++){

      if(fs.existsSync(`./BibleHub/json/${book}/${chapter}/${verse}.json`)) continue;

      console.log(`Downloading: ${book} ${chapter}:${verse}`);

      let data = await getVerseData(book, chapter, verse)

      fs.writeFileSync(`./BibleHub/json/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))

    }
  }
}
async function getData(references) {
  for(const {book, chapter, verse: verseCount} of references){

    // fs.mkdir(`./BibleHub/json/${book}/${chapter}`, { recursive: true }, ()=>{})

    for(let verse = 1; verse <= verseCount; verse++){

      // if(fs.existsSync(`./BibleHub/json/${book}/${chapter}/${verse}.json`)) continue;

      console.log(`Updating: ${book} ${chapter}:${verse}`);

      let data = await getLocalVerseData(book, chapter, verse)

      fs.writeFile(`./BibleHub/json/interlinear/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))
      // fs.writeFileSync(`./BibleHub/json/interlinear/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))

    }
  }
}
async function getDataFromWebsiteThreaded(references) {
    references.forEach(({book, chapter, verse: verseCount}) =>{

    fs.mkdir(`./BibleHub/html/${book}/${chapter}`, { recursive: true }, ()=>{})
    fs.mkdir(`./BibleHub/json/${book}/${chapter}`, { recursive: true }, ()=>{})

    for(let verse = 1; verse <= verseCount; verse++){

      if(fs.existsSync(`./BibleHub/json/${book}/${chapter}/${verse}.json`)) continue;

      console.log(`Downloading: ${book} ${chapter}:${verse}`);

      getVerseData(book, chapter, verse).then((data) => {
        fs.writeFileSync(`./BibleHub/json/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))
      })

    }
  })
}


async function getAllStrongsDataFromWebsite() {
  for(let i=1;i<=8674;i++){
    if(fs.existsSync(`./BibleHub/strongs/html/hebrew/${i}.htm`)) continue;
    console.log(`Downloading: Strongs hebrew #${i}`);
    await getStrongsData("hebrew", i)
  }
  for(let i=1;i<=5624;i++){
    if(fs.existsSync(`./BibleHub/strongs/html/greek/${i}.htm`)) continue;
    console.log(`Downloading: Strongs greek #${i}`);
    await getStrongsData("greek", i)
  }
}

async function createStrongsJSON() {
for(let i=1;i<=8674;i++){
  if(!fs.existsSync(`./BibleHub/strongs/html/hebrew/${i}.htm`)) continue;
  if(fs.existsSync(`./BibleHub/json/strongs/hebrew/${i}.json`)) continue;
  getStrongsJSON("hebrew", i)
}
  for(let i=1;i<=5624;i++){
    if(!fs.existsSync(`./BibleHub/strongs/html/greek/${i}.htm`)) continue;
    if(fs.existsSync(`./BibleHub/json/strongs/greek/${i}.json`)) continue;
    getStrongsJSON("greek", i)
  }
}

// getDataFromWebsite(references)

// getAllStrongsDataFromWebsite()
fs = fs.promises

getData(references)
// createStrongsJSON()
