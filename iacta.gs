var botId = "b4a27e3eeebcd76e47bb99e6b6";
function sendText(text){
  UrlFetchApp.fetch("https://api.groupme.com/v3/bots/post", {"method":"post", "payload":'{"bot_id":"' + botId + '","text":"' + text + '"}'})
}

//respond to messages sent to the group. Recieved as POST
//this method is automatically called whenever the Web App's (to be) URL is called
function doPost(e){
  var post = JSON.parse(e.postData.getDataAsString());
  var text = post.text.toLowerCase();
  //var text = ".roll 1d20, 0d0, 0d4, 4d0, 1d20";
  var multipliers = [];
  var types = [];
  
  var message = "Rolled: ";

  if(text.indexOf(".roll".toLowerCase()) >= 0 || text.indexOf("?roll".toLowerCase()) >= 0){
    for(c = 0; c < text.length; c++){
      if(isNumeric(text.charAt(c))){
        var first = readNumber(text, c);
        c = c + first.length;
        if(text.charAt(c) == 'd'){
          c = c + 1;
          if(isNumeric(text.charAt(c))){
            var second = readNumber(text, c);
            c = c + second.length;
            var num1 = parseFloat(first);
            var num2 = parseFloat(second);
            if(num1 != 0 && num2 != 0){
              multipliers.push(num1);
              types.push(num2);
              message = message + first + "d" + second + " ";
            }
          }
        }
      }
    }
    if(multipliers.length != 0 && multipliers.length == types.length){
      message = message + "\\n" + expectedValue(multipliers, types);
      message = message + rollDice(multipliers, types);
      sendText(message);
    }
  }
}

//Roll the dice and retrun a nicely formatted display of the results
function rollDice(multi, type){
  //DICE ROLL AND DISPLAY/SUM
  var total = 0;
  var lines = "";
  for(q = 0; q < multi.length; q++){
    lines = lines + multi[q] + "d" + type[q] + ": ";
    var nextLine = "";
    var subtotal = 0;
    for(z = 0; z < multi[q]; z++){
      var roll = Math.floor(Math.random() * type[q]) + 1;
      total = total + roll;
      subtotal = subtotal + roll;
      nextLine = nextLine + roll + " ";
    }
    nextLine = " = " + nextLine;
    if(multi[q] == 1){
      nextLine = "";
    }
    lines = lines + subtotal + nextLine + "\\n";
  }
  if(multi.length == 1){
    return lines;
  }else{
    return "Total: " + total + "\\n" + lines;
  }
}

//Calculate the expected value of a roll set,
//or parallel arrays of NdX
function expectedValue(multi, type){
  var line = "Expected: ";
  var ev = 0;
  for(i = 0; i < multi.length; i++){
    ev = ev + multi[i]*((type[i] + 1.0)/2);
  }
  return line + ev + "\\n";
}

//Starting at l, read in a number from text
function readNumber(text, l){
  var numberList = [""];
  while(isNumeric(text.charAt(l)) && l < text.length){
    Logger.log("Char at " + l + " is " + text.charAt(l));
    numberList.push(text.charAt(l));
    l = l + 1;
  }
  var number = "";
  for(n = 0; n < numberList.length; n++){
    number = number + "" + numberList[n];
  }
  if(number == "" || isNaN(number)){
    number = 0;
  }
  return number;
}

//Test is a character is a digit
function isNumeric(character){
  var numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  return (numbers.indexOf(character) >= 0 && character != '');
}