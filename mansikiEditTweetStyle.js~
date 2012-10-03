var MansikiModeConst={
	page:{color:"#3C3C50"}
	,koma:{color:"#3C3C50"}

}



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
		,modAdd:"追加"
		,modUpdate:"更新"
	}
	this.cmdButtonsState={};
	this.commands=[{id:"page",data:{}}];
	this.currentCmd="page";
}
MansikiTweetStyleEditor.prototype={
	init:function(){
		this.viewList = $("#TMtweetList");
		this.tweetArea= $("#TMtweetTextarea");
		this.addButton= $("#TMadd");
		this.clearButton= $("#TMclear");
		this.twCmdAreaUpper = $("#TWcmdAreaUpper");
		this.twCmdAreaUnder = $("#TWcmdAreaUnder");
		this.initBinds(this);
		this.showCursor(this);
	},
	initBinds:function(me){
		me.addButton.bind("click",{self:me},me.addTweet);
		me.clearButton.bind("click",{self:me},me.clearTweet);
		me.tweetArea.bind("keyup",{self:me},me.autoResize);
		$("#TMTweetMode").text(me.constMap.modAdd);
		this.cmdButtonsHilightInit();
	}, 
	cmdButtonsHilightInit:function(){
		var bottons = $(".commands div");
		for(var i=0;i<bottons.length;i++){
			var button = bottons.eq(i);
			id= button.attr("id");
//alert(button.length+"/i:"+i+"/id:"+id+"/"+button.css("background-color"));
			var buttonState = {};
			this.cmdButtonsState[id] = buttonState;
			buttonState["border"]=button.css("border");
			buttonState["color"]=button.css("color");
			buttonState["background-color"]=button.css("background-color");
			button.bind("click",{self:this,id:id},this.cmdButtonsHilight);
		}
	},
	cmdButtonsHilight:function(event){
		var me= event.data.self;
		var bottons = $(".commands div");
		for(var i=0;i<bottons.length;i++){
			var button = bottons.eq(i);
			id= button.attr("id");
			var buttonState = me.cmdButtonsState[id] ;
			button.css("border",buttonState["border"]).css("color",buttonState["color"]).css("background-color",buttonState["background-color"]);
		}
		var id= event.data.id;
		var buttonState = me.cmdButtonsState[id];
		//alert("id:"+id);
		$("#"+id).css("border-color",buttonState["background-color"]);
		me.twCmdAreaUpper.css("background-color",buttonState["background-color"]);
		me.twCmdAreaUnder.css("background-color",buttonState["background-color"]);
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
console.log("addTweet idIndex:"+event.data.idIndex+"/me.cursor:"+me.cursor+"/me.tweetIdMap:"+me.tweetIdMap.toSource());
				me.cursor++;
				me.tweetArea.val("").focus();
				me.showCursor(me);
			}else{//update
				event.data.idIndex=me.state.selected;
				me.updateTweet(event);
			}
		}
	},
	insertTweet:function(event){
		var me= event.data.self;
		var tweetBox=me.buildTweetBox(event);
		if(me.cursor*1===0){
			if(me.viewList.children("div").length > 0){
				me.viewList.children("div").eq(0).before(tweetBox);
			}else{
				me.viewList.append(tweetBox);
			}
		}else{
			var idIndex=me.tweetIdMap[me.cursor-1];
			var preId=me.constMap.tweetIdPrefix+idIndex;
			$("#"+preId).after(tweetBox);
		}
		me.initViewCursorObj({data:{self:me,idIndex:me.tweetIdMap[me.cursor]}});
	},
	getFormatedTextCRLF:function(text){
		return text.replace(/(\r|\n|\r\n)/g, "<br />");
	},
	buildTweetBox:function(event){
		var me= event.data.self;
		var text= event.data.text;
		var idIndex= event.data.idIndex;
		me.tweetIdMap = MansikiMapUtil.after(me.tweetIdMap,me.cursor,idIndex);
		me.tweets[idIndex]=text;
		return me.execBuildTweetBox(me,idIndex);
	},
	execBuildTweetBox:function(me,idIndex){
console.log("execBuildTweetBox idIndex:"+idIndex+"/me.tweets:"+me.tweets.toSource()+"/me.tweetIdMap:"+me.tweetIdMap.toSource()+"/text:"+me.tweets[idIndex]);
		var text = me.tweets[idIndex];
		var id=me.constMap.tweetIdPrefix+idIndex;
		var tweetBox=$("<div id='"+id+"'class='TMtweetBox' index='"+idIndex+"'>"+"</div>");
		var tweetBoxButtons = $("<div class='tweetBoxCmd'></div>");
		var twbButtonDel= $("<div class='tweetBoxCmdButton'>☓</div>");
		var twbButtonMoveUp= $("<div class='tweetBoxCmdButton'>▲</div>");
		var twbButtonMoveDown= $("<div class='tweetBoxCmdButton'>▼</div>");
		var twbButtonUnite= $("<div class='tweetBoxCmdButton'>＋</div>");
		var tweetBoxtext = $("<div class='tweetBoxText'>"+me.getFormatedTextCRLF(text)+"</div>");
		tweetBox.append(tweetBoxButtons);
		tweetBox.append(tweetBoxtext);
		tweetBoxButtons.append(twbButtonMoveDown).append(twbButtonMoveUp).append(twbButtonDel).append(twbButtonUnite);
		tweetBoxtext.bind("click",{self:me,idIndex:idIndex},me.loadTweet);
		twbButtonDel.bind("click",{self:me,idIndex:idIndex},me.deleteTweet);
		twbButtonMoveUp.bind("click",{self:me,idIndex:idIndex,direct:"up"},me.moveTweet);
		twbButtonMoveDown.bind("click",{self:me,idIndex:idIndex,direct:"down"},me.moveTweet);
		twbButtonUnite.bind("click",{self:me,idIndex:idIndex},me.unionTweet);
		tweetBox.bind("click",{self:me,idIndex:idIndex},me.initViewCursorObj);
		tweetBox.bind("mouseover",{self:me,idIndex:idIndex},me.showCmdBox);
		tweetBox.bind("mouseout",{self:me,idIndex:idIndex},me.hideCmdBox);
		return tweetBox;
	},
	loadTweet:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var id=me.constMap.tweetIdPrefix+idIndex;
		var tweetBox=$("#"+id);
		for(var cursor in me.tweetIdMap){
			var tmpId = me.constMap.tweetIdPrefix+me.tweetIdMap[cursor];
			$("#"+tmpId).css("border-left-width","0px");
		}
		tweetBox.css("border-left-width","20px");
		var text= me.tweets[idIndex];
		me.tweetArea.val(text);
		me.state.selected = idIndex;
		me.autoResize(event);
		$("#TMTweetMode").text(me.constMap.modUpdate);
		me.showCursor(me);
	},
	updateTweet:function(event){
		var me = event.data.self;
		var text= event.data.text;
		var idIndex = event.data.idIndex;
		me.tweets[idIndex] =text;
		var id=me.constMap.tweetIdPrefix+idIndex;
		var tweetBox=$("#"+id);
		tweetBox.children(".tweetBoxText").eq(0).html(me.getFormatedTextCRLF(text));
	},
	deleteTweet:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		me.tweets[idIndex] =undefined;
console.log("AAA idIndex:"+idIndex+"/me.cursor:"+me.cursor+"/me.tweetIdMap:"+me.tweetIdMap.toSource());
		if(me.state.selected===idIndex){
			me.clearTweet(event);
		}
		me.tweetIdMap=MansikiMapUtil.del(me.tweetIdMap,idIndex);
		me.cursor=MansikiMapUtil.getMaxIndex(me.tweetIdMap);
		var id=me.constMap.tweetIdPrefix+idIndex;
		$("#"+id).parent().children("#"+id).eq(0).remove();
		me.initViewCursorObj({data:{self:me,idIndex:me.tweetIdMap[me.cursor]}});
console.log("idIndex:"+idIndex+"/me.cursor:"+me.cursor+"/me.tweetIdMap:"+me.tweetIdMap.toSource());
	},
	unionTweet:function(event){
		var me= event.data.self;
		
	},
	moveTweet:function(event){
		var me= event.data.self;
		var direct= event.data.direct;
		var idIndex = event.data.idIndex;
		var id = me.constMap.tweetIdPrefix+idIndex;
		var cursor = MansikiMapUtil.getKey(me.tweetIdMap,idIndex)*1;
		var oldMap = me.tweetIdMap;
		var newMap = {};
		var subject ;
		for(var tmpCursor in oldMap){
			newMap[tmpCursor] = oldMap[tmpCursor];
		}
		var offset = 0;
		if(direct==="up"){
			offset=-1;
		}else if(direct==="down"){
			offset=1;
		}
		for(var tmpCursor in oldMap){
			if(cursor+offset===tmpCursor*1){
				subject = oldMap[tmpCursor];
				newMap[cursor] = subject;
				newMap[tmpCursor] = oldMap[cursor];
				break;
			}
		}
		me.tweetIdMap = newMap;
console.log("idIndex:"+idIndex+"/subject:"+subject+"/direct:"+direct+"/cursor:"+cursor+"/offset:"+offset+"/newMap:"+newMap.toSource());
		if(subject !== undefined){
			me.cursor=cursor+offset;
			var subjectId = me.constMap.tweetIdPrefix+subject;
			var tweetBox = me.execBuildTweetBox(me,subject);
			$("#"+subjectId).remove();
			if(direct==="up"){
				$("#"+id).after(tweetBox);
			}else if(direct==="down"){
				$("#"+id).before(tweetBox);
			}
		}
		me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
	},
	rebuildAll:function(){
	
	},
	initViewCursorObj:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var offsetY = event.data.offsetY===undefined?0:event.data.offsetY;;
		var id = me.constMap.tweetIdPrefix+idIndex;
		var target = $("#"+id);
		if(target.length<1){return;}
console.log("aaaa  /id:"+id+"/target:"+target.length+"/me.cursor:"+me.cursor);
		var top = target.position().top;
		var left = target.position().left;
		var height = $("#"+id).css("height").replace("px","")*1;
console.log("aaaa top:"+top+"/left:"+left+"/height:"+height+"/id:"+id);
		if(me.state.selected === undefined){
			height+=10+height;
		}
		height-=(40+offsetY);
		$("#svgAreaArrow").css("top",(top*1+height)).css("left",left);
		me.cursor=MansikiMapUtil.getKey(me.tweetIdMap,idIndex);
		me.showCursor(me);
	},
	clearTweet:function(event){
		var me= event.data.self;
		for(var cursor in me.tweetIdMap){
			var tmpId = me.constMap.tweetIdPrefix+me.tweetIdMap[cursor];
			$("#"+tmpId).css("border-left-width","0px");
		}
		me.state.selected = undefined;
		me.tweetArea.val("");
		$("#TMTweetMode").text(me.constMap.modAdd);
		me.initViewCursorObj({data:{self:me,idIndex:me.tweetIdMap[me.cursor]}});
	},
	showCursor:function(me){
		$("#TMCursor").text(me.cursor*1+1);
	},
	showCmdBox:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var id = me.constMap.tweetIdPrefix+idIndex;
		var target = $("#"+id).children(".tweetBoxCmd").eq(0);
		target.css("display","block");
		me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:30}});
	},
	hideCmdBox:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var id = me.constMap.tweetIdPrefix+idIndex;
		var target = $("#"+id).children(".tweetBoxCmd").eq(0);
		target.css("display","none");
		me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
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
var MansikiMapUtil={
	insert:function(map,index,value){
		var oldMap = map;
		var newMap ={};
		for(var tmpCursor in oldMap){
			var offset = 0;
			if(tmpCursor*1>=index){
				offset = 1;
			}
			newMap[(tmpCursor*1+offset)] = oldMap [tmpCursor];
		}
		newMap[index] = value;
		return newMap;
	},
	after:function(map,index,value){
		var oldMap = map;
		var newMap ={};
		var hasProp =false;
console.log("after index:"+index+"/value:"+value);
		for(var tmpCursor in oldMap){
			var offset = 0;
console.log("after index:"+index+"/tmpCursor:"+tmpCursor);
			if(tmpCursor*1>=index){
				offset = 1;
			}
			hasProp=true;
			newMap[(tmpCursor*1+offset)] = oldMap [tmpCursor];
		}
		newMap[(index*1)] = value;
		
		return newMap;
	},
	del:function(map,value){
		var oldMap = map;
		var newMap ={};
		var hasProp =false;
		var targetIndex ;
		for(var tmpCursor in oldMap){
			var tmpVal = oldMap [tmpCursor];
			if(value*1===tmpVal*1){
				targetIndex = tmpCursor;
				break;
			}
		}
console.log("del targetIndex:"+targetIndex);
		for(var tmpCursor in oldMap){
			var newIndex = tmpCursor*1;
			var tmpVal = oldMap [newIndex];
console.log("del tmpCursor:"+newIndex+":"+tmpVal+"/targetIndex:"+targetIndex);
			if(targetIndex < newIndex && newIndex>0){
				newMap[(newIndex-1)] =tmpVal;
			}else if(targetIndex !== newIndex){
				newMap[(newIndex)] = tmpVal;
			}
		}
		return newMap;
	},
	add:function(map,value){
		var count = MansikiMapUtil.getCount(map);
		map[count]=value;
		return map;
	}
	,getMaxIndex:function(map){
		var max =0;
		for(var i in map){
			max=max<i?i:max;
		}
		return max;
	}
	,getCount:function(map){
		var count =0;
		for(var i in map){
			count++;
		}
		return count+1;
	}
	,getKey:function(map,value){
		for(var key in map){ 
console.log("getKey key:"+key+"/idIndex:"+value);
			if(map[key]===value){
				return key;
			}
		}
	}


}

var ManikiFunctions=function(){
	this.frame="";

}

ManikiFunctions.prototype={

}


