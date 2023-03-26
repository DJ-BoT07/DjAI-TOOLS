
const gptEndpoint = 'https://api.openai.com/v1/completions';

const reqButton = document.getElementById('button-request');
const reqStatus = document.getElementById('request-status');

reqButton.onclick = function () {

  reqButton.disabled = true;

  reqStatus.innerHTML = "Request started...";


  const key = document.getElementById('api-key').value;
  const prompt = document.getElementById('text-prompt').value;
  const radios = document.getElementsByName('text-model');
  let model;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      model = radios[i].value;
      break;
    }
  }
  const tokens = Number(document.getElementById('token-count').value);
  const temp = Number(document.getElementById('temperature').value);

  const reqBody = {
    model: model,
    prompt: prompt,
    max_tokens: tokens,
    temperature: temp,
    top_p: 0.5,
    stream: false,
    logprobs: null,
  
  };  


  const reqParams = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(reqBody)
  }


  fetch(gptEndpoint, reqParams)
    .then(res => res.json())
    .then(json => addText(json, prompt))
    .catch(error => {
      reqStatus.innerHTML = error;
      reqButton.disabled = false;
    });
}



/**
 * Add prompts + answers to the page.
 * @param {Object} jsonData The text completion API response
 * @param {String} prompt The original prompt that generated the text completion
 * @returns 
 */
function addText(jsonData, prompt) {
  console.log(jsonData);

  reqButton.disabled = false;

  if (jsonData.error)
  {
    reqStatus.innerHTML = 'ERROR: ' + jsonData.error.message;
    return;
  }

  const container = document.getElementById('text-container');
  for (let i = 0; i < jsonData.choices.length; i++) 
  {

    const questionDiv = document.createElement('div');
    questionDiv.className = "question";
    const questionP = document.createElement('p');
    questionP.innerHTML = prompt;
    questionDiv.appendChild(questionP);

    const textData = jsonData.choices[i].text;
    const answerDiv = document.createElement('div');
    answerDiv.className = "answer";
    const answerP = document.createElement('p');
    answerP.innerHTML = textData;
    answerDiv.appendChild(answerP);

    let reasonData;
    switch (jsonData.choices[i].finish_reason)
    {
      case "length":
        reasonData = "(Text generation stopped due to text length)"
        break;
      case "stop":
        reasonData = "(Model decided this length of an answer was sufficient)"
        break;
      default:
        reasonData = "(Text generation stopped due to unknown reasons)"
        break;
    }
    const reasonDiv = document.createElement('div');
    reasonDiv.className = "reason";
    const reasonP = document.createElement('p');
    reasonP.innerHTML = reasonData;
    reasonDiv.appendChild(reasonP);

    container.prepend(
      questionDiv, 
      answerDiv,
      reasonDiv  
    );
  }

  reqStatus.innerHTML = jsonData.choices.length +' responses received for "' + prompt + '"';
}