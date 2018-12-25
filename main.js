/*
    ELIZA Meteor Template Created by CHEN, Tsung-Ying
    for the NTHU course "Basic Web Linguistic Application Development"
    Last Updated on Dec 17, 2018
*/

var conversationLogDB = new Mongo.Collection("conversationLog");

//*********************************************//
//  請在以下範圍以內修改或新增ELIZA回應的功能函數  //
//*********************************************//

var stupidResponse = function(msg) {
	return "What is "+msg+"?";
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
			return "I don't the city.";
		}
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