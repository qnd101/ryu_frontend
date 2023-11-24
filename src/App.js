import React, { useState } from 'react';
import {FaStar} from 'react-icons/fa'
import './App.css'

function App() {
  const [selected_model, set_selected_model] = useState(1); //선택된 버튼 번호
  const [input, set_input] = useState('');
  const [status, set_status] =useState('status');
  const [history, set_history] =useState([])
  const [description_dict, set_description_dict] = useState({1:'모델1', 2:'모델2', 3:'모델3', 4:'모델4'})
  const [link_dict, set_link_dict] =  useState({1:'', 2:'', 3:'', 4:''})
  const [rating_arr, set_ratin_arr] = useState([-1,-1,-1,-1])
  const [hover, set_hover] = useState(null)
  const [rated, set_rated] = useState(false)

  const thumbnail_dict = {'ryu': require('./ryu_1.gif'), 'user': require('./user_1.png')}
  
  const baseUrl = 'https://ryucine.tteokgook1.net'//'http://127.0.0.1:5000'

  const handleButtonClick = (buttonNumber) => {
    set_selected_model(buttonNumber)
    
    const apiUrl = baseUrl+'/model_description';

    // Using the fetch function
    fetch(apiUrl)
    .then(response => {
      // Check if the response status is OK (200)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Parse the JSON in the response
      return response.json();
    })
    .then(data => {
      // Handle the data
      set_description_dict(data['desc'])
      set_link_dict(data['link'])
    })
    .catch(error => {
      // Handle errors
      console.error('Fetch error:', error);
    });
  };

  function handleTextareaChanged(e){
    set_input(e.target.value)
  }

  function handlesubmitbtnclicked(){
    set_history((history) => history.concat([{'index':history.length, 'sender':'user', 'content':input}]))
    set_status('waiting')
    
    //api 전송

    console.log(`Button ${selected_model} clicked`);
    // You can add more functionality here
    const apiUrl = baseUrl+`/model${selected_model}?input=${input.split(' ').join('%')}`;
    set_input('')

    // Using the fetch function
    fetch(apiUrl)
    .then(response => {
      // Check if the response status is OK (200)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Parse the JSON in the response
      return response.json();
    })
    .then(data => {
      // Handle the data
      set_history((history) => history.concat([{'index':history.length, 'sender':'ryu','content':data['text']}]))
    })
    .catch(error => {
      // Handle errors
      console.error('Fetch error:', error);
    });
  }

  const generatechat = () => {
    return (
        <ul>
        {history.map((item) =>
            <li key={item.index}>
              <div class='container'>
                <img src={thumbnail_dict[item.sender]} class = "userlogo"/>
                <h3>
                  {item.sender}
                </h3>
                <label class='chatlabel'>
                  {item.content}
                </label>
              </div>
            </li>
        )}
        </ul>
    )
  }

  function onEnterPress(e){
    if(e.keyCode === 13 && e.shiftKey === false) {
      handlesubmitbtnclicked()
    }
  }

  function generateRateBooleanList(score){
    let temp = [0,0,0,0,0]
    for(let i=0;i<5;i++){
      temp[i] = (score > i)
    }
    console.log(temp)
    return temp
  }

  function handlesavebtn(){
    set_rated(true)

    
    const apiUrl = baseUrl+'/model_rate';

    // Using the fetch function
    fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          text : rating_arr
        }), 
        headers : {
          "Content-Type" :'application/json'
        }
      })
    .then(response => {
      // Check if the response status is OK (200)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Parse the JSON in the response
      return response.json();
    })
    .then(data => {
    })
    .catch(error => {
      // Handle errors
      console.error('Fetch error:', error);
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>♣모델 선택창♣</h2>
        <div>
          <button onClick={() => handleButtonClick(1)} disabled = {selected_model ===1} class="modelbutton">Model 1</button>
          <button onClick={() => handleButtonClick(2)} disabled = {selected_model ===2} class="modelbutton">Model 2</button>
          <button onClick={() => handleButtonClick(3)} disabled = {selected_model ===3} class="modelbutton">Model 3</button>
          <button onClick={() => handleButtonClick(4)} disabled = {selected_model ===4} class="modelbutton">Model 4</button>
        </div>
        <br />
        <p class = "description">
          {description_dict[selected_model]}
        </p>
        <a href={link_dict[selected_model]} class = 'hyperlink' target = '_blank'>
          {selected_model!==4?`♠♣모델${selected_model} 해보러 가기♣♠`:''}
        </a>
        <p class = 'red'>
          ***특정 의도로 프롬프팅하여 데이터 제공자가 불쾌함을 느낄 만한 대화를 생성하거나 이를 공유하지 말아주세요***
        </p>
        {selected_model === 4 ?
        <ul>
        {generatechat()}
        <div class = "container">
          <img src={thumbnail_dict['user']} class = "userlogo"/>
          <h3>
            user
          </h3>
          <textarea class ="textbox"
            value={input}
            onChange={handleTextareaChanged}
            onKeyDown={onEnterPress}
          />
          <button id = "submitbtn"
            disabled = {input.length === 0 || status === 'submitting'} onClick = {handlesubmitbtnclicked}>
              변✩환
          </button>
        </div>
        </ul>
        : <ul></ul>
        }
        <div>
          <ul>
          {
            !rated ?
            <ul>
            {
              generateRateBooleanList(rating_arr[selected_model-1]).map((value, index)=>{
              console.log({value, index})
              return (
              <li key={index} class = 'star'>
              <FaStar size = {50} color={(value && hover === null) || (index <= hover) ? "#ffc107" : "e4e5e9"} 
              onMouseEnter={()=>set_hover(index)} onMouseLeave={()=>set_hover(null)} onClick={()=>set_ratin_arr((arr)=>{let newarr=arr.copyWithin();newarr[selected_model-1]=index+1;return newarr})}/>
              </li>
              )})
            }</ul> : <ul></ul>
            
          }</ul>

        <button class = "modelbutton" disabled={rated || !rating_arr.every((x)=>(x>0))} onClick = {handlesavebtn}>
          저장☆
        </button>
        </div>
      </header>
    </div>
  );
}

export default App;
