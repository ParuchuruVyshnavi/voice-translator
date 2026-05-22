const sourceText =
  document.getElementById("sourceText");

const translatedText =
  document.getElementById("translatedText");

const historyDiv =
  document.getElementById("history");

const sourceLang =
  document.getElementById("sourceLang");

const targetLang =
  document.getElementById("targetLang");



let speechRate = 1;
let speechPitch = 1;
let speechVolume = 1;



function startListening(){

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if(!SpeechRecognition){

    showToast(
      "Speech Recognition Not Supported"
    );

    return;
  }

  const recognition =
    new SpeechRecognition();

  recognition.lang =
    sourceLang.value;

  recognition.continuous = true;

  recognition.interimResults = true;

  recognition.start();

  document
    .querySelector(".voice-animation")
    .classList.add("active");

  recognition.onresult =
    async(event)=>{

    let transcript = "";

    for(
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ){

      transcript +=
        event.results[i][0]
        .transcript;
    }

    sourceText.value =
      transcript;

    translateNow(transcript);

    updateCounter();
  };

  recognition.onend = ()=>{

    document
      .querySelector(".voice-animation")
      .classList.remove("active");
  };

  recognition.onerror = (event)=>{

    showToast(
      "Voice Error: " +
      event.error
    );
  };
}



async function translateNow(text){

  let sourceCode =
    sourceLang.value;

  if(sourceCode.includes("te")){
    sourceCode = "te";
  }
  else if(sourceCode.includes("ta")){
    sourceCode = "ta";
  }
  else if(sourceCode.includes("hi")){
    sourceCode = "hi";
  }
  else{
    sourceCode = "en";
  }

  translatedText.value =
    "Translating...";

  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetLang.value}&dt=t&q=${encodeURIComponent(text)}`;

  try{

    const response =
      await fetch(url);

    const data =
      await response.json();

    const translated =
      data[0][0][0];

    typingEffect(translated);

    addHistory(
      text,
      translated
    );

    setTimeout(()=>{

      speakTranslation();

    },500);

  }catch(error){

    showToast(
      "Translation Failed"
    );
  }
}



function typingEffect(text){

  translatedText.value = "";

  let i = 0;

  const interval =
    setInterval(()=>{

    translatedText.value +=
      text.charAt(i);

    i++;

    if(i >= text.length){

      clearInterval(interval);
    }

  },30);
}



function speakTranslation(){

  speechSynthesis.cancel();

  const text =
    translatedText.value;

  if(text.trim() === ""){

    showToast(
      "No Translation"
    );

    return;
  }

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  if(targetLang.value === "ta"){
    utterance.lang = "ta-IN";
  }
  else if(targetLang.value === "hi"){
    utterance.lang = "hi-IN";
  }
  else if(targetLang.value === "te"){
    utterance.lang = "te-IN";
  }
  else{
    utterance.lang = "en-US";
  }

  utterance.rate =
    speechRate;

  utterance.pitch =
    speechPitch;

  utterance.volume =
    speechVolume;

  speechSynthesis.speak(
    utterance
  );
}


function stopSpeaking(){

  speechSynthesis.cancel();

  showToast(
    "Speech Stopped"
  );
}



function copyTranslation(){

  navigator.clipboard.writeText(
    translatedText.value
  );

  showToast(
    "Copied"
  );
}



function clearAll(){

  sourceText.value = "";

  translatedText.value = "";

  updateCounter();

  showToast(
    "Cleared"
  );
}



function swapLanguages(){

  let temp =
    sourceLang.value;

  sourceLang.value =
    targetLang.value === "en"
    ? "en-US"
    : targetLang.value + "-IN";

  targetLang.value =
    temp.includes("te")
    ? "te"
    : temp.includes("ta")
    ? "ta"
    : temp.includes("hi")
    ? "hi"
    : "en";

  showToast(
    "Languages Swapped"
  );
}



function addHistory(
  original,
  translated
){

  const item =
    document.createElement("div");

  item.classList.add(
    "history-item"
  );

  item.innerHTML = `
    <p>
      <strong>Original:</strong>
      ${original}
    </p>

    <p>
      <strong>Translated:</strong>
      ${translated}
    </p>
  `;

  historyDiv.prepend(item);

  localStorage.setItem(
    "translationHistory",
    historyDiv.innerHTML
  );
}



window.onload = ()=>{

  historyDiv.innerHTML =
    localStorage.getItem(
      "translationHistory"
    ) || "";

  speechSynthesis.getVoices();
};



function clearHistory(){

  historyDiv.innerHTML = "";

  localStorage.removeItem(
    "translationHistory"
  );

  showToast(
    "History Cleared"
  );
}



function saveFavorite(){

  let favorites =
    JSON.parse(
      localStorage.getItem(
        "favorites"
      )
    ) || [];

  favorites.push(
    translatedText.value
  );

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );

  showToast(
    "Saved ❤️"
  );
}



function downloadText(){

  const blob =
    new Blob(
      [translatedText.value],
      {type:"text/plain"}
    );

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    "translation.txt";

  a.click();

  showToast(
    "Downloaded"
  );
}


function updateCounter(){

  const words =
    sourceText.value
    .trim()
    .split(/\s+/)
    .length;

  const chars =
    sourceText.value.length;

  document
    .getElementById("counter")
    .innerText =
    `Words: ${words} | Characters: ${chars}`;
}



document
  .getElementById("themeBtn")
  .onclick = ()=>{

  document.body.classList.toggle(
    "light-mode"
  );
};



function showToast(message){

  const toast =
    document.createElement("div");

  toast.className =
    "toast";

  toast.innerText =
    message;

  document.body.appendChild(
    toast
  );

  setTimeout(()=>{

    toast.remove();

  },3000);
}



sourceText.addEventListener(
  "keypress",
  function(event){

    if(event.key === "Enter"){

      event.preventDefault();

      translateNow(
        sourceText.value
      );
    }
  }
);



function setRate(value){

  speechRate = value;
}

function setPitch(value){

  speechPitch = value;
}

function setVolume(value){

  speechVolume = value;
}
