// const ENTER_KEY = "13"
var rightContent = "interlinear"
var primaryTranslation = "ESV"
var apiData = {
  interlinear: [],
  commentary: [],
  context: []
}
var references

const availableTranslations = ["ESV", "NASB", "NKJV"]
// const allVersesRegex = new RegExp(`(${availableTranslations.join("|")})`, "gi")
// const allVersesRegex = new RegExp(`(?<=\d? ?[A-z\s]+\d+: ?\d+-?\d* ?)[A-z]+\d*`, "gim")

async function get(url){

  return new Promise( (resolve, reject) => {
      fetch(url)
      .then(response => {
        try{
          // response.json()
          let res = response.json()
          resolve(res)
        }
        catch{
          resolve()
        }
      })
      // .then(data => resolve(data));
  })
}

async function searchVerse(verse) {
  // verse = verse.replace(/psalm(?=[^s])/gim, "Psalms")
  // verse = verse.replace(/Songs? of Songs/gim, "Song of Songs")
  // let verse = document.getElementById("search").value
  apiData = {
    interlinear: [],
    commentary: [],
    context: []
  }
  console.log(verse);
  document.title = `ScriptureHub - ${verse}`
  let {book, chapter, start_verse, end_verse, givenTranslation} = [...verse.matchAll(/(?<book>\d? ?\S*) (?<chapter>\d{1,3}):?(?<start_verse>\d{1,3})?-?(?<end_verse>\d{1,3})? ?(?<givenTranslation>[A-z0-9]+)?/gim
    )]?.[0]?.groups
  if(!start_verse){
    start_verse = 1
    end_verse = references[book][chapter]
  }
  if(availableTranslations.includes(givenTranslation?.toUpperCase())){
    // console.log({availableTranslations, givenTranslation, primaryTranslation});
    primaryTranslation = givenTranslation.toUpperCase()
    // console.log({availableTranslations, givenTranslation, primaryTranslation});

  }
  start_verse = parseInt(start_verse)
  end_verse = parseInt(end_verse)
  let verseRange = start_verse

  if(end_verse){
    verseRange = `${start_verse}-${end_verse}`
  }

  let translations = [primaryTranslation, ...availableTranslations.filter(f=>f!==primaryTranslation)]//["NASB", "ESV", "NKJV", ]
  let left = document.querySelector(".first")
  left.innerHTML = ""
  for(let translation of translations){
    let data = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleGateway/translations/json/${book}/${chapter}/${translation}.json`)

    let text = ""
    if(!end_verse){
      text = `<p>${data.find(f=>f.num===start_verse).verse}</p>`
    }else{
      data.forEach(({header, num, verse}, c) => {
        // console.log({header, num, verse}, c);
        if(header && data[c+1].num >= start_verse && data[c+1].num <= end_verse){
          // console.log(`header:${header} index:${c}`);

          // console.log(data[c]);
          // console.log(data[c+1]);
          // console.log(`${data[c+1].num} > ${start_verse} && ${data[c+1].num} < ${end_verse}`);

          // console.log(data[c+1].num >= start_verse && data[c+1].num <= end_verse);
          // && data[c+1].num >= start_verse && data[c+1].num <= end_verse
          text = text + `<p class="passage-header">${header}</p>`
        }
        else if(num >= start_verse && num <= end_verse){
          // console.log({header, num, verse});
          text = text + `<p class="passage-verses"><sup class="verse-num">${num} </sup>${verse}</p>`
        }
      })
    }

    // console.log(data);

    left.innerHTML += `
    <h3>${book} ${chapter}:${verseRange} ${translation}</h3>
    ${text}
    `
  }
  await updateRightContent(document.getElementById("search").value)
  // loads all the data
  Object.keys(apiData).forEach( async(key) => {
    // if its not already being updated
    if(key !== rightContent){
      if(key === "interlinear"){
        apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleGateway/translations/json/${book}/${chapter}/${primaryTranslation}.json`)
      }
      if(key === "commentary"){
        apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/commentaries/${book}/${chapter}/${start_verse}.json`)
      }
      if(key === "context"){
        apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleGateway/translations/json/${book}/${chapter}/${primaryTranslation}.json`)
      }
    }
  })

}

async function updateRightContent(verse) {
  return new Promise (async(resolve, reject) => {

    // passing verse parameter is unnecessary

    // let verse = document.getElementById("search").value
    // document.querySelector("main > .first").style.width = "50%";
    // document.querySelector("main > .second").style.width = "50%";
    verse[0] = verse[0].toUpperCase()
    // document.getElementById("second").innerHTML = ""
    if(rightContent === "interlinear"){
      document.querySelector("main > .first").style.width = "50%";
      document.querySelector("main > .second").style.width = "50%";
      await updateInterLinearContent(verse)
    }
    else if(rightContent === "commentary"){
      document.querySelector("main > .first").style.width = "40%";
      document.querySelector("main > .second").style.width = "60%";
      await updateCommentaryContent(verse)
    }
    else if(rightContent === "context"){
      document.querySelector("main > .first").style.width = "30%";
      document.querySelector("main > .second").style.width = "70%";
      await updateContextContent(verse)
    }
    resolve()
  })
}

async function updateInterLinearContent(verse) {
  return new Promise (async(resolve, reject) => {

    let {book, chapter, start_verse, end_verse, givenTranslation} = [...verse.matchAll(/(?<book>\d? ?\S*) (?<chapter>\d{1,3}):?(?<start_verse>\d{1,3})?-?(?<end_verse>\d{1,3})? ?(?<givenTranslation>[A-z0-9]+)?/gim
    )]?.[0]?.groups
    if(!start_verse){
      start_verse = 1
    end_verse = references[book][chapter]
  }
  // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  let json = apiData.interlinear
  let lowerBook = book.toLowerCase()
  if(lowerBook === "psalm"){
    book = "Psalms"
  }else if(lowerBook === "song of solomon" || lowerBook === "songs of solomon" || lowerBook === "song of songs"){
    book = "Songs"
  }
  if(json.length === 0)  {
    json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)
    apiData['interlinear'] = json
  }
  // console.log(json);
  let int = document.getElementById(rightContent)
  // console.log(int);
  int.innerHTML = ""
  json.forEach( ({word, grk, heb, translit, str, str2, parse, num}) => {
    let strongs = ""
    if(num){
      strongs = ` [${num}]`
    }
    int.innerHTML += `
    <article class="interlinear-card">
    <div class="interlinear-content">
    <h3>${word} - <span class="accent">${grk || heb} ${translit} </span></h3>
    <h4 class="parse"><span class="accent">${parse}</span>${strongs}</h4>
    <p class="definition">${str2}</p>
    </div>
    <svg class="fill-svg arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
    </article>
    `
    })
    resolve()
  })
}
async function updateCommentaryContent(verse) {
  return new Promise (async(resolve, reject) => {
    let {book, chapter, start_verse, end_verse, givenTranslation} = [...verse.matchAll(/(?<book>\d? ?\S*) (?<chapter>\d{1,3}):?(?<start_verse>\d{1,3})?-?(?<end_verse>\d{1,3})? ?(?<givenTranslation>[A-z0-9]+)?/gim
      )]?.[0]?.groups
    if(!start_verse){
      start_verse = 1
      end_verse = references[book][chapter]
    }

    // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
    let json = apiData.commentary
    let lowerBook = book.toLowerCase()
    if(lowerBook === "psalm"){
      book = "Psalms"
    }else if(lowerBook === "song of solomon" || lowerBook === "songs of solomon" || lowerBook === "song of songs"){
      book = "Songs"
    }
    if(json.length === 0)  {
      json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/commentaries/${book}/${chapter}/${start_verse}.json`)
      apiData['commentary'] = json
    }
    // console.log(json);
    let int = document.getElementById(rightContent)
    // console.log(int);
    int.innerHTML = ""
    json.forEach( ({type, name, text, elements}, c) => {
      // if(name === "Links") continue;
      // int.innerHTML += `<h3>${name}</h3><p>${text.join("")}</p>`
      // let strongs = ""
      // if(num){
      //   strongs = ` [${num}]`
      // }
      let commentaryText = ""
      elements.forEach(e => {
        let txt = ""
        if(e.children.length > 0){
          e.children.forEach((el) => {
            let childElementClass = ""
            if(el.class){
              childElementClass = `class="${el.class}"`
            }
            txt += `<${el.element} ${childElementClass}">${el.text}</${el.element}>`
          })
        }else{
          txt = e.text
        }
        let elementClass = ""
        if(e.class){
          elementClass = `class="${e.class}"`
        }
        commentaryText +=
        `
        <${e.element} ${elementClass}>${txt}</${e.element}>
        `

      })

      int.innerHTML += `
      <article class="commentary-card">
      <div class="commentary-header cmt-${c}" onclick="commentaryDropDown(${c})">
      <div class="commentary-content">
      <h3>${name}</h3>
      </div>
      <svg class="fill-svg arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
      </div>
      <div class="commentary-text" id="commentary-text-${c}">${commentaryText}</div>
      </article>
      `
    })

    // apiData.commentary.forEach((com, c) => {
    //   let commentary = document.getElementById(`commentary-text-${c}`)

    //   com.elements.forEach(e => {
    //     let txt = ""
    //     if(e.children.length > 0){
    //       e.children.forEach((el) => {
    //         let childElementClass = ""
    //         if(el.class){
    //           childElementClass = `class="${el.class}"`
    //         }
    //         txt += `<${el.element} ${childElementClass}">${el.text}</${el.element}>`
    //       })
    //     }else{
    //       txt = e.text
    //     }
    //     let elementClass = ""
    //     if(e.class){
    //       elementClass = `class="${e.class}"`
    //     }
    //     commentary.innerHTML +=
    //     `
    //     <${e.element} ${elementClass}>${txt}</${e.element}>
    //     `

    //   })
    // })

  // })
  resolve()
})
}
async function updateContextContent(verse) {
  return new Promise (async(resolve, reject) => {

  let {book, chapter, start_verse, end_verse, givenTranslation} = [...verse.matchAll(/(?<book>\d? ?\S*) (?<chapter>\d{1,3}):?(?<start_verse>\d{1,3})?-?(?<end_verse>\d{1,3})? ?(?<givenTranslation>[A-z0-9]+)?/gim
    )]?.[0]?.groups
  if(!start_verse){
    start_verse = 1
    end_verse = references[book][chapter]
  }

  // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  // let json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)
  let json = apiData.context
  if(json.length === 0)  {
    // json = await get(`https://bible-api.com/${book}%20${chapter}`)
    json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleGateway/translations/json/${book}/${chapter}/${primaryTranslation}.json`)

    apiData['context'] = json
  }

  // console.log(json);
  let int = document.getElementById(rightContent)
  // console.log(int);
  int.innerHTML = `<h2 id="book-title">${book} ${chapter} ${primaryTranslation}</h2>`
  // json.verses.forEach( ({verse, text}) => {

  //   int.innerHTML += `
  //   <article class="context-card">
  //   <div class="context-content">
  //   <p class="context-verse" id="verse${verse}"><span class="accent verse-num">${verse} </span><span class="verse-text">${text}</span></p>
  //   </div>
  //   </article>
  //   `
  // })
  json.forEach(({header, num, verse}, c) => {
    if(header){
      int.innerHTML += `
      <article class="context-card">
      <div class="context-content">
      <p class="passage-header">${header}</p>
      </div>
      </article>
      `
    }else{
      int.innerHTML += `
      <article class="context-card">
      <div class="context-content">
      <p class="context-verse" id="verse${num}"><span class="accent verse-num">${num} </span><span class="verse-text">${verse}</span></p>
      </div>
      </article>
      `
    }
  })
  resolve()
})
}

function commentaryDropDown(c) {
  // console.log(document.querySelector(`.cmt-${c} > svg`).style.transform);
  let commentary = document.getElementById(`commentary-text-${c}`)

  if(document.querySelector(`.cmt-${c} > svg`).style.transform === "rotate(90deg)"){
    // document.querySelector(`.cmt-${c} > svg`).style.transform === "rotate(0deg)"
    document.querySelector(`.cmt-${c} > svg`).style.transform = "rotate(0deg)"
    // commentary.textContent = ""
    commentary.classList.remove("selected-commentary")
  }else{
    commentary.classList.add("selected-commentary")

    document.querySelector(`.cmt-${c} > svg`).style.transform = "rotate(90deg)"

  }

}

function commentaryDropDownOld(c) {
  // console.log(document.querySelector(`.cmt-${c} > svg`).style.transform);
  let commentary = document.getElementById(`commentary-text-${c}`)

  if(document.querySelector(`.cmt-${c} > svg`).style.transform === "rotate(90deg)"){
    // document.querySelector(`.cmt-${c} > svg`).style.transform === "rotate(0deg)"
    document.querySelector(`.cmt-${c} > svg`).style.transform = "rotate(0deg)"
    // commentary.textContent = ""
    commentary.innerHTML = ""

  }else{
    document.querySelector(`.cmt-${c} > svg`).style.transform = "rotate(90deg)"
    // commentary.textContent = apiData.commentary[c].text.join("")
    apiData.commentary[c].elements.forEach(e => {
      let txt = ""
      if(e.children.length > 0){
        e.children.forEach((el) => {
          let childElementClass = ""
          if(el.class){
            childElementClass = `class="${el.class}"`
          }
          txt += `<${el.element} ${childElementClass}">${el.text}</${el.element}>`
        })
      }else{
        txt = e.text
      }
      let elementClass = ""
      if(e.class){
        elementClass = `class="${e.class}"`
      }
      commentary.innerHTML +=
      `
      <${e.element} ${elementClass}>${txt}</${e.element}>
      `

    })
  }
  //  {
  //   transform: rotate(90deg);
  // }
  // console.log(c);
  // console.log(apiData.commentary);
  // console.log(apiData.commentary[c]);
}

function changeRightContent(iconClicked) {
  // document.getElementById(`${rightContent}-icon`).style.filter = "grayscale(40%) opacity(0.7)";
  document.getElementById(`${rightContent}-icon`).classList.remove("selected")
  document.getElementById(rightContent).id = iconClicked
  rightContent = iconClicked
  // document.getElementById(`${iconClicked}-icon`).style.filter = "grayscale(0%) opacity(1)";
  document.getElementById(`${iconClicked}-icon`).classList.add("selected")

  // document.getElementById(`${iconClicked}-icon`).value // IM HERE
  updateRightContent(document.getElementById("search").value)
}

document.querySelector("div.passage-col.version-NKJV > div.passage-text > div > div > p > span")
document.addEventListener("DOMContentLoaded", async() => {
  let initialVerse = "John 1:1"
  searchVerse(initialVerse)
  document.getElementById("search").value = initialVerse
  // document.getElementById(`${rightContent}-icon`).style.filter = "grayscale(0%) opacity(1)";
  document.getElementById(`${rightContent}-icon`).classList.add("selected")
  references = await get("https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/refs.json")
  // console.log(document.getElementById(`${rightContent}-icon`).classList);
  // document.getElementById(`${rightContent}-icon`).style.color = "var(--accent-color)"
  // document.getElementById(`${rightContent}-icon`).style["border-bottom"] = "2px solid var(--accent-color);"
})

document.addEventListener("keyup", function(event) {
  // console.log(event);
  if (event.key === "Enter") {
      searchVerse(document.getElementById("search").value)
  }
  if(event.target.id === "search"){
    // console.log(event.target.value);
    // if(event.target.value)
    // console.log(event.target.value.match(/(?<=\d? ?[A-z\s]+\d+: ?\d+-?\d* ?)[A-z]+\d*/gim));
    event.target.value = event.target.value.replace(/(?<=\d? ?[A-z\s]+\d+: ?\d+-?\d* ?)[A-z]+\d*/gim, (m) => m.toUpperCase())
  }
});

document.addEventListener("input", (input) => {
  if(input.target.id === "color-picker"){
    document.documentElement.style.setProperty('--accent-color', document.getElementById("color-picker").value);
  }

})