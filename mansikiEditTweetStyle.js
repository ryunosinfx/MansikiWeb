var MansikiTweetStyleEditor= function(id, width,height,ancer){
	this.doc;
	this.tweets={};
	this.tweetsSort=[];
	this.state={selected:undefined};
	this.cursor=0;
	this.tweetIdCount=0;;
	this.tweetIdMap ={};
	this.constMap={
		tweetIdPrefix:"TMid"
		,tweetAreaHeight:72
	}
}
MansikiTweetStyleEditor.prototype={
	init:function(){
		this.viewList = $("#TMtweetList");
		this.tweetArea= $("#TMtweetTextarea");
		this.addButton= $("#TMadd");
		this.clearButton= $("#TMclear");
		this.initBinds(this);
	},
	initBinds:function(me){
		me.addButton.bind("click",{self:me},me.addTweet);
		me.clearButton.bind("click",{self:me},me.clearTweet);
		me.tweetArea.bind("keyup",{self:me},me.autoResize);
	}, 
	addTweet:function(event){
		var me= event.data.self;
		var text = me.tweetArea.val();
		if(text!==undefined && text.length>0){
			event.data.text=text;
			if(me.state.selected === undefined){//add
				me.tweetIdCount++;
				event.data.idIndex=me.tweetIdCount;
				me.insertTweet(event);
				me.tweetIdMap[me.cursor]=me.tweetIdCount;
				me.cursor++;
			}else{//update
				event.data.idIndex=me.state.selected;
				var cursor = me.getCursorByTweetId(event);
				me.updateTweet(event);
			}
		}
	},
	getCursorByTweetId:function(event){
		var me = event.data.self;
		var idIndex = me.state.selected;
		for(var key in me.tweetIdMap){
			if(me.tweetIdMap[key]===idIndex){
				return key;
			}
		}
		return me.cursor;
	},
	insertTweet:function(event){
		var me= event.data.self;
		var tweetBox=me.buildTweetBox(event);
		if(me.cursor===0){
			me.viewList.append(tweetBox);
		}else{
			var idIndex=me.tweetIdMap[me.cursor-1];
			event.data.idIndex=idIndex;
			var preId=me.constMap.tweetIdPrefix+idIndex;
			$("#"+preId).after(tweetBox);
		}
	},
	getFormatedTextCRLF:function(text){
		return text.replace(/(\r|\n|\r\n)/g, "<br />");
	},
	buildTweetBox:function(event){
		var me= event.data.self;
		var text= event.data.text;
		var idIndex= event.data.idIndex;
		me.tweets[idIndex]=text;
		var id=me.constMap.tweetIdPrefix+idIndex;
		var tweetBox=$("<div id='"+id+"'class='TMtweetBox' index='"+idIndex+"'>"+me.getFormatedTextCRLF(text)+"</div>");
		tweetBox.bind("click",{self:me,idIndex:me.tweetIdCount},me.loadTweet);
		return tweetBox;
	},
	loadTweet:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var text= me.tweets[idIndex];
		me.tweetArea.val(text);
		me.state.selected = idIndex;
		me.autoResize(event);
	},
	updateTweet:function(event){
		var me = event.data.self;
		var text= event.data.text;
		var idIndex = event.data.idIndex;
		me.tweets[idIndex] =text;
		var id=me.constMap.tweetIdPrefix+idIndex;
		var tweetBox=$("#"+id);
		tweetBox.html(me.getFormatedTextCRLF(text));
	},
	deleteTweet:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		me.tweets[idIndex] =undefined;
		var id=me.constMap.tweetIdPrefix+idIndex;
		$("#"+id).remove();
	},
	unionTweet:function(event){
		var me= event.data.self;
		
	},
	moveTweet:function(event){
		var me= event.data.self;
		
	},
	clearTweet:function(event){
		var me= event.data.self;
		me.state.selected = undefined;
		me.tweetArea.val("");
	},
	changeObject:function(event){
		
	},
	autoResize:function(event){
		var me= event.data.self;
		var textareaObj = me.tweetArea.get(0);
		 me.tweetArea.css("height",me.constMap.tweetAreaHeight);
		var height = textareaObj.scrollHeight+12;
		if(me.constMap.tweetAreaHeight< height){
		 	me.tweetArea.css("height",height);
		}
	},
	calcStringLength:function(event){
		var me= event.data.self;
		
	},
	showToolTips:function(event){
		var me= event.data.self;
		var key=event.data.toolTipsKey;
		var toolTip=me.tooleTips[key];
	
	},
}





