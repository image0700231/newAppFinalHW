/*
    ELIZA Meteor Template Created by CHEN, Tsung-Ying
    for the NTHU course "Basic Web Linguistic Application Development"
    Last Updated on Dec 17, 2018
*/

var conversationLogDB = new Mongo.Collection("conversationLog");

//*********************************************//
//  請在以下範圍以內修改或新增ELIZA回應的功能函數  //

// . = any char
// \w = any letter or number
// \W = any special symbols
// \d = any digit
// \D = any non-digit
// + = 1 or more than 1 character
// * = 0 or more than 1 character
// [] = any character in the scope
// () = a character group

//*********************************************//

var stupidLog = 
    [
       "Tell me more.",
       "Explain more, please.",
       "I don't quite understand...",
       "What does this matter to me?",
       "Um, what?",
       "So?",
       "Okaaaay?",
       "Whatever, let's talk about something else.",
       "Really?!",
       "Cool.",
       "That's interesting.",
       "Alright.",
       "Hmmmmm.",
       "Wow!",
       "No comment.",
       "Why do you want to talk about this?",
       "Okay. Now, ask me about the weather.",
       "Anyway, how's your day?",
       "Is it important?",
       "Maybe...",    
    ]



var stupidResponse = function(msg) {
	let randomIndex2 = Math.random()*20;
	randomIndex2 = Math.floor(randomIndex2);
	return stupidLog[randomIndex2];
};	

var weatherInfo = function(msg) {
	let wtData;
	let weatherRegex = /(weather|temperature).* in (\w+)/i;
	let weatherRequest = msg.match(weatherRegex);
	if(weatherRequest === null) {
		return "";
	}
	else {
		let lastPos = weatherRequest.length-1;
		let cityName = weatherRequest[lastPos];
		let APIKey = "0f9acd286be670dbec09507843f8f78b";
		let wtInfoURL = 
			"http://api.openweathermap.org/data/2.5/weather?APPID="+APIKey+
			"&q="+cityName+"&units=metric";
		try {
			wtData = HTTP.get(wtInfoURL);
			wtData = wtData.data.main;
			let wtResponse = "It's "+wtData.temp+"C.";
			return wtResponse;
		}
		catch(error) {
			return "I don't know the city.";
		}
		return "";
	}
};

var randomIndex = Math.random()* 10;
randomIndex = Math.floor(randomIndex);

let LIResponseLog = 
		    [
		       "meditation",
		       "playing sports such as ice skating",
		       "reading novels written by Virginia Woolf",
		       "watching a French movie",
		       "chatting with me until you are bored",
		       "drinking 10 cups of coffee",
		       "taking a nap",
		       "travelling",
		       "hanging out with me",
		       "coding"
		    ]

var leisureAdvice = function(msg) {
	let leisureRegex = /.*(fine|great|bored|sad|happy|tired|sick|excited|nervous|angry|heartbroken|anxious|down|blue|lonely|stressed|hopeless|confused|depressed|desperate|melancholy|exhausted|cry|scream|die|bad|soso)|What.*I.*do|.*(suggest|advice|idea|tip)|I.*(thinking|considering)/i;
	let leisureRequest = msg.match(leisureRegex);
	if(leisureRequest != null) {
		LIResponseLog;
		let LIResponse = "Try "+LIResponseLog[randomIndex]+".";
		return LIResponse;
	}
	else {
		return "";
	}
};

var EPResponseLog = 
		    [
		       "The universe works in funny ways, child",
		       "It's hard to explain",
		       "Don't ask me because I can't explain, either",
		       "Because...umm..",
		       "I have to consult another person, please wait.",
		       "Life is fickle",
		       "Google it.",
		       "You are the first person asking me about this..",
		       "This is life. Deal with it",
		       "God knows"
		    ]

var explanationMaker = function(msg) {
	let explanationRegex = /why.*|.*(reason|explanation|cause)|.*explain|.*dare/i;
	let explanationRequest = msg.match(explanationRegex);
	if(explanationRequest != null) {
		EPResponseLog;
		let randomIndex = Math.random()* 10;
			randomIndex = Math.floor(randomIndex);
		let EPResponse = EPResponseLog[randomIndex]+".";
		return EPResponse;
	}
	else {
		return "";
	}
};


/*
//新增的功能函數皆以以下的程式碼為模板
var XXXXX = function(msg) {
	//先進行訊息的檢查，如果訊息檢查符合條件，就執行相關功能並回傳ELIZA的回應
	if(XXXXX) {
		return results;	//務必要回傳結果
	}
	//不符合條件的話，就回傳一個空字串，讓msgReceiver可以往下呼叫下一個功能函數
	else {
		return "";
	}
}
*/

//*********************************************//
//  請在以上範圍以內修改或新增ELIZA回應的功能函數  //
//*********************************************//

var initConversation = function(username) {
	conversationLogDB.insert(
		{
			user: username,
			source: "ELIZA",
			msg: "Hi, "+username+". How are you doing?",
			time: new Date()
		}
	);
};

conversationLogDB.deny({
	insert() {
		return true;
	},
	update() {
		return true;
	},
	remove() {
		return true;
	}
});

Meteor.publish("userConversation", function(username) {
	return conversationLogDB.find({user: username});
});

Meteor.methods({
	setUser: function(username) {
		if(username.includes(" ")) {
			throw new Meteor.Error();
		}
		else {
			let userLog = conversationLogDB.find({user: username}).fetch();
			if(userLog.length > 0) {
				return;
			}
			else {
				initConversation(username);
				return;
			}
		}
	},
	msgReceiver: function(msg, username) {
		let dataNum = conversationLogDB.find({user: username}).fetch().length;
		if(dataNum <= 20) {
			conversationLogDB.insert(
				{
					user: username,
					source: "You",
					msg: msg,
					time: new Date()
				}
			);
			let ELIZAResponse = weatherInfo(msg);

			if(ELIZAResponse === "") {
				ELIZAResponse = leisureAdvice(msg);
			}
			if(ELIZAResponse === "") {
				ELIZAResponse = explanationMaker(msg);
			}
			
			//***************************************//
			//請在以下段落中修改程式碼呼叫不同的功能函數//
			//獲得ELIZA的回應                        //
			//**************************************//

			/*
			//新增的程式碼開頭一律檢查ELIZAResponse是否還是一個空字串
			if(ELIZAResponse === "") {
				//不是空字串的話才呼叫某個功能函數XXXX試圖取得ELIZA的回應
				ELIZAResponse = XXXXX(msg);
			}
			*/

			if(ELIZAResponse === "") {
				ELIZAResponse = stupidResponse(msg);
			}
			//***************************************//
			//請在以上段落中修改程式碼呼叫不同的功能函數//
			//獲得ELIZA的回應                        //
			//**************************************//
			conversationLogDB.insert(
				{
					user: username,
					source: "ELIZA",
					msg: ELIZAResponse,
					time: new Date()
				}
			);
			return;
		}
		else {
			return "full";
		}
	},
	resetMsg: function(username) {
		conversationLogDB.remove({user: username});
		initConversation(username);
	}
});