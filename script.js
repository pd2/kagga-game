const reference = document.getElementById("reference");
const quote = document.getElementById("quote");
const check = document.getElementById("check");
const input = document.getElementById("typedValue");
const start = document.getElementById("start");
const info = document.getElementById("info");
const message = document.getElementById("message");
const meaning = document.getElementById("meaning");
const image = document.getElementById("image");
const dropZone = document.getElementById("dropZone");
const lines = document.getElementById("lines");
const settings = document.getElementById("settings");
const share =  document.getElementById("share");
const tooltip = document.getElementById("myTooltip");

let quotes, meanings, kagga_kn;

async function get_kaggas() {
  
  let responses = await fetch('DVG_kaggas.txt');
  
  let quotes_all = await responses.json();
  
  // console.log(quotes_all);
  
  quotes = quotes_all.kaggas;
  meanings = quotes_all.meanings;
  kagga_kn = quotes_all.kannada;
  
}

get_kaggas();

//const quotes = quotes_all.kurals;

const draggableElems = document.querySelectorAll("draggable");
const droppableElems = document.querySelectorAll("droppable");

draggableElems.forEach((elem) => {
  elem.addEventListener("dragstart", dragStart);
  // elem.addEventListener("drag", drag);
  // elem.addEventListener("dragend", dragEnd);
});

droppableElems.forEach((elem) => {
  elem.addEventListener("dragenter", dragEnter);
  elem.addEventListener("dragover", dragOver);
  elem.addEventListener("dragleave", dragLeave);
 // elem.addEventListener("drop", drop);
});

function dragStart(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function dragEnter(event) {
  event.target.classList.add("droppable-hover");
}

function dragOver(event) {
  event.preventDefault();
}

function dragLeave(event) {
  event.target.classList.remove("droppable-hover");
}

function allowDrop(event) {
  event.preventDefault();
  if (event.currentTarget.querySelectorAll(".draggable").length > 1)
        return false;
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
  event.preventDefault();
  if (event.currentTarget.querySelectorAll('.draggable').length > 0)
  {
    let id_incoming = event.dataTransfer.getData('text/plain');
    let data_incoming = document.getElementById(id_incoming).childNodes[0].childNodes[0];
    let data_outgoing = event.currentTarget.childNodes[1].childNodes[0].childNodes[0];
    if (event.target.childElementCount == 1) {
      event.target.childNodes[1].childNodes[0].appendChild(data_incoming);
    } 
    if (event.target.childElementCount == 0) {
      event.target.childNodes[0].replaceWith(data_incoming);
    }
    document.getElementById(id_incoming).childNodes[0].appendChild(data_outgoing);
    return true;
    // return false;
  }
  var data = event.dataTransfer.getData("text");
  event.currentTarget.appendChild(document.getElementById(data));
}

function allowMultipleDrop(event) {
  event.preventDefault();
}

function multiItemsDrop(event) {
  event.preventDefault();
  var data = event.dataTransfer.getData("text");
  event.currentTarget.appendChild(document.getElementById(data));
}
let lineQueue, quoteText, kaggaText, highlightPosition, startTime, ka_index = -1, is_playing = false;
let Guess = [], cur_guess, cur_ans;
let num_tries, is_random;

let lastPlayedTs;

function startGame() {
  
  var today = new Date();
  
  if ( Na(new Date(lastPlayedTs), today) < 1) {
    alert("Play a new puzzle tomorrow!")
    return;
  }
  
  console.log("new game started!");
  is_playing = false;
  num_tries = 0;
  Guess = [];

  is_random = document.getElementById('rand').checked;
  // console.log("Is random: ",is_random);
  
  message.innerHTML = ``;
  dropZone.innerHTML = `<template id="dropBox">
    <span class="droppable" ondrop="drop(event)" ondragover="allowDrop(event)"><br></span>
    </template>`;
  info.innerHTML = ``;
  start.innerHTML = `New Game`;
  image.innerHTML = ``;
  check.style.display = "revert";
  tooltip.innerHTML = "Copy to clipboard";
  share.style.display = "none";
  
  if (is_random == true) {
    ka_index = Math.floor(Math.random() * quotes.length);
  } else {
    ka_index++;
    if (ka_index == quotes.length) {
      ka_index = 0;
    }
  }
  
  quoteText = quotes[ka_index];
  kaggaText = kagga_kn[ka_index];
  lineQueue = quoteText.split(/[।॥]+/);
  cur_ans = lineQueue.join(",");

  const template = document.getElementById('dropBox');
  
  for(var i=0; i< lineQueue.length; i++) {
    
    const newBox = template.content.cloneNode(true);
    const text = newBox.querySelector('.droppable');
    text.innerText = ["Line ".concat(i+1).concat(" ")].join(" ");
    
    dropZone.appendChild(newBox);
  }

  reference.innerHTML = `Kagga: ${ka_index+1}`
  quote.innerHTML = kaggaText.split(/(?<=[.।॥]+ )/g).join("<br>");
  lines.innerHTML = shuffle(lineQueue).map((line, index) => `<div id="line${index+1}" class="draggable" draggable="true" ondragstart="drag(event)"><span class="line">${line}</span></div>`).join(" ");
  meaning.innerHTML = ``;
  
  startTime = new Date().getTime();
  
  document.body.className = "";
  quote.style.display = "revert";
  dropZone.style.display = "none";
  lines.style.display = "none";
  check.innerHTML = `Try`;
  check.style.display = "block";
}

function shuffle(array) {
    var i = array.length;
    while (i-- > 0) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


function checkOrder() {
  
  if (is_playing == false) {
    is_playing = true;
    quote.style.display = "none";
    dropZone.style.display = "flex";
    lines.style.display = "revert";
    lines.className = 'droppable';
    meaning.innerHTML = `<span class="meaning">Meaning: ${meanings[ka_index]}</span>`;
    check.innerHTML = `Check`;
    return;
  }
  is_playing = false;
  dropZone.style.display = "none";
  lines.style.display = "none";
  lines.className = '';
  quote.style.display = "revert";
  check.innerHTML = `Retry`;
  
  num_tries++;

  let w, noDataFound = "0";
  let new_Guess = [...dropZone.getElementsByClassName("line")].map(w => w.textContent).join(" ");
  console.log(new_Guess);
  for (var i=0; i< lineQueue.length; i++) {
    try {
      w = dropZone.children[i+1].childNodes[1].childNodes[0].childNodes[0].data;
    } catch {
      w = noDataFound;
    }
    Guess.push(w);
  }
  cur_guess = Guess.join(",");
  
  if(cur_guess == cur_ans){
    console.log("Successfully finished game");
    gameOver();
    return;
  }
  
  console.log("mistake");
  Guess = [];
  message.innerHTML = `  <span >Wrong, ${num_tries} guesses. Try again!</span>  `;

}

let elapsedTime;

function gameOver() {
  
  quote.style.display = "revert";
  dropZone.style.display = "flex";
  lines.style.display = "revert";

  lastPlayedTs = new Date();

  elapsedTime = new Date().getTime() - startTime;
  // let time_taken = (elapsedTime/1000);
  // console.log(`Time taken is: ${Math.round(time_taken)}`)
  
  dropZone.innerHTML = `<template id="dropBox">
    <span class="droppable" ondrop="drop(event)" ondragover="allowDrop(event)"></span>
    </template>`;
  message.innerHTML = `
    <span class="congrats">Congrats!</span>
    <br> You finished in ${elapsedTime/1000} seconds with ${num_tries} tries
    `;
  
  quote.innerHTML = quoteText.concat("॥").split(/(?<=[.।॥]+ )/g).join("<br>");
  meaning.innerHTML = `<span class="meaning">Meaning: ${meanings[ka_index]}</span>`;
  
  document.getElementById("start").focus();
  
  if (is_random == false) {
    save_history();
  }
  check.style.display = "none";
  share.style.display = "block";
  
  image.innerHTML = `<img class="img" draggable="false" src="https://cdn.glitch.global/d7d06347-f9cb-4cda-b015-76c51bd9b171/DVGundappa_stamp.jpg">`

  document.body.className = "image";
  // document.body.className = "winner";
  ShareIt();
}

document.addEventListener("keypress", function onPress(event) {
    if (event.key === "@") {
      console.log("cheat code for testing game");
      lines.innerHTML = ``;
      lines.className = '';
      gameOver();
      return;
    }
});

var copyText;

function ShareIt() {
  
  let linkURL = "https://kagga-game.glitch.me";
  
  copyText = `#KaggaGame I learnt the meaning of mankuthimmana kagga no. ${ka_index+1} in ${Math.round(elapsedTime/1000)} sec at ${linkURL}`;
  
  navigator.clipboard.writeText(copyText);
  
   if (navigator.canShare) {
    navigator.share({
      title: 'Share results',
      text: copyText,
      // url: linkURL,
    })
    .then(() => console.log('Successful share'))
    .catch((error) => console.log('Error sharing', error));
  }
  
//  alert("Copied the results to clipboard");
  tooltip.innerHTML = "Results copied";
}

function outFunc() {
  tooltip.innerHTML = "Copy to clipboard";
}

function Na(e, a) {
    var s = new Date(e);
    var t = new Date(a).setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0);
    return Math.round(t / 864e5);
}

function get_history() {
  const noItemsFound_ad = 0, noItemsFound_ku = -1, noItemsFound_lastPlayedTs = 0;
  const ka = localStorage.getItem('ka_index') || noItemsFound_ku;
  const lpts = localStorage.getItem('lpts') || noItemsFound_lastPlayedTs;
  
  ka_index = JSON.parse(ka);
  lastPlayedTs = JSON.parse(lpts);
}

function save_history() {
  const ka = JSON.stringify(ka_index);
  const lpts = JSON.stringify(lastPlayedTs);
  localStorage.setItem('ka_index', ka);
  localStorage.setItem('lpts', lpts);
}

get_history();
check.style.display = "none";
share.style.display = "none";

document.getElementById("start").focus();
start.addEventListener("click", startGame);
check.addEventListener("click", checkOrder);

