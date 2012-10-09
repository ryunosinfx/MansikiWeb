var MansikiModeConst={
	page:{color:"#3C3C50"}
	,koma:{color:"#3C3C50"}

}

var MansikiTweetStyleEditor= function(id, width,height,ancer){
	this.doc;
	this.tweets={};
	this.tweetsFuncs={};
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
	};
	this.cmdButtonsState={};
	this.commands=[{id:"page",data:{}}];
	this.currentCmd="page";
	this.tweetBoxParent = $("#TWtweetBoxParent");
	this.scrollTimer;
	$(document).bind("scroll",{self:this},this.onScroll);
	this.funcs=new ManikiFunctions(this,0);
	this.funcs.add2Funcs(new ManikiFuncPage(this,0));
	this.funcs.add2Funcs(new ManikiFuncKoma(this,0));
	this.funcs.add2Funcs(new ManikiFuncFukidashi(this,0));
	this.funcs.add2Funcs(new ManikiFuncSetting(this,0));
	this.funcs.add2Funcs(new ManikiFuncActor(this,0));
	this.funcs.add2Funcs(new ManikiFuncObject(this,0));
	this.funcs.add2Funcs(new ManikiFuncBackground(this,0));
	this.funcs.add2Funcs(new ManikiFuncSound(this,0));
	this.funcs.add2Funcs(new ManikiFuncEffect(this,0));
	this.funcs.add2Funcs(new ManikiFuncNalation(this,0));
	this.funcs.add2Funcs(new ManikiFuncQuote(this,0));
	this.funcs.add2Funcs(new ManikiFuncSean(this,0));
	this.funcs.add2Funcs(new ManikiFuncFukusen(this,0));
	this.funcs.makeInputArea();
	this.currentFuncId="";
}
MansikiTweetStyleEditor.prototype={
	init:function(){
		this.viewList = $("#TMtweetList");
		this.bredgeArea= $("#TMtweetInput");
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
		$("#TMTweetMode").text(me.constMap.modAdd);
		me.cmdButtonsHilightInit();
	}, 
	cmdButtonsHilightInit:function(){
		var bottons = $(".commands div");
		var firstId;
		for(var i=0;i<bottons.length;i++){
			var button = bottons.eq(i);
			id= button.attr("id");
			if(firstId===undefined){
				firstId = id;
			}
//alert(button.length+"/i:"+i+"/id:"+id+"/"+button.css("background-color"));
			var buttonState = {};
			this.cmdButtonsState[id] = buttonState;
			buttonState["border"]=button.css("border");
			buttonState["color"]=button.css("color");
			buttonState["background-color"]=button.css("background-color");
			button.bind("click",{self:this,id:id},this.cmdButtonsHilight);
		}
		//first selected
		this.cmdButtonsHilight({data:{self:this,id:firstId}});
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
		me.currentFuncId =id;
	},
	//--------------------------------------------------------------------
	buildFuncs:function(me,idIndex){
		var func = me.funcs.getFunc(me.currentFuncId);
		func.text=me.tweets[idIndex];
		me.tweetsFuncs[idIndex]=func;
	},
	updateFuncs:function(me,idIndex){
		var func = me.tweetsFuncs[idIndex];
		var nowFunc = me.funcs.getFunc(me.currentFuncId);
		if(func===undefined || func.Id!==nowFunc.Id){
			delete me.tweetsFuncs[idIndex];
			me.tweetsFuncs[idIndex] = nowFunc;
			return true;
		}
		return false;
	},
	//--------------------------------------------------------------------
	addTweet:function(event){
		var me= event.data.self;
		me.funcs.addTweet();
		var text = me.bredgeArea.val();
		if(text!==undefined && text.length>0){
			event.data.text=text;
			if(me.state.selected === undefined){//add
				me.tweetIdCount++;
				event.data.idIndex=me.tweetIdCount;
				me.insertTweet(event);
console.log("addTweet idIndex:"+event.data.idIndex+"/me.cursor:"+me.cursor+"/me.tweetIdMap:"+me.tweetIdMap.toSource());
				me.cursor++;
				me.bredgeArea.val("");
				me.funcs.clearTweet();
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
		me.doInsertTweet(me,tweetBox);
		me.initViewCursorObj({data:{self:me,idIndex:me.tweetIdMap[me.cursor],offsetY:999}});
	},
	doInsertTweet:function(me,tweetBox){
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
	},
	buildTweetBox:function(event){
		var me= event.data.self;
		var text= event.data.text;
		var idIndex= event.data.idIndex;
		me.tweetIdMap = MansikiMapUtil.after(me.tweetIdMap,me.cursor,idIndex);
		me.tweets[idIndex]=text;
		me.buildFuncs(me,idIndex);
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
		var tweetBoxtext = $("<div class='tweetBoxText'>"+MansikiMapUtil.getFormatedTextCRLF(text)+"</div>");
		var tweetBoxSlot= $("<div class='tweetSlot'></div>");
		tweetBox.append(tweetBoxButtons);
		tweetBox.append(tweetBoxtext);
		tweetBox.append(tweetBoxSlot);
		tweetBoxButtons.append(twbButtonMoveDown).append(twbButtonMoveUp).append(twbButtonDel).append(twbButtonUnite);
		tweetBoxtext.bind("click",{self:me,idIndex:idIndex},me.loadTweet);
		twbButtonDel.bind("click",{self:me,idIndex:idIndex},me.deleteTweet);
		twbButtonMoveUp.bind("click",{self:me,idIndex:idIndex,direct:"up"},me.moveTweet);
		twbButtonMoveDown.bind("click",{self:me,idIndex:idIndex,direct:"down"},me.moveTweet);
		twbButtonUnite.bind("click",{self:me,idIndex:idIndex},me.unionTweet);
		tweetBox.bind("click",{self:me,idIndex:idIndex,offsetY:20},me.initViewCursorObj);
		tweetBox.bind("mouseover",{self:me,idIndex:idIndex},me.showCmdBox);
		tweetBox.bind("mouseout",{self:me,idIndex:idIndex},me.hideCmdBox);
		var func = me.tweetsFuncs[idIndex];
		if(func!==undefined){
			tweetBox.css("background-color",func.color);
		}
		func.addIndentClass(tweetBox);
		return tweetBox;
	},
	loadTweet:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var id=me.constMap.tweetIdPrefix+idIndex;
		var tweetBox=$("#"+id);
		for(var cursor in me.tweetIdMap){
			var tmpId = me.constMap.tweetIdPrefix+me.tweetIdMap[cursor];
			$("#"+tmpId).css("box-shadow","0px");
		}
		tweetBox.css("box-shadow","20px");
		var text= me.tweets[idIndex];
		var func = me.tweetsFuncs[idIndex];
		me.bredgeArea.val(text);
		me.funcs.loadTweet();
		me.cmdButtonsHilight({data:{self:me,id:func.getFullId()}});
		me.state.selected = idIndex;
		$("#TMTweetMode").text(me.constMap.modUpdate);
		me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:165}});
	},
	updateTweet:function(event){
		var me = event.data.self;
		var text= event.data.text;
		var idIndex = event.data.idIndex;
		me.tweets[idIndex] =text;
		var isTweetBoxUpdated = me.updateFuncs(me,idIndex);
		var id=me.constMap.tweetIdPrefix+idIndex;
		var tweetBox=$("#"+id);
		if(isTweetBoxUpdated === false){
			tweetBox.children(".tweetBoxText").eq(0).html(MansikiMapUtil.getFormatedTextCRLF(text));
		}else{
			tweetBox.remove();
			tweetBox = me.execBuildTweetBox(me,idIndex);
			me.doInsertTweet(me,tweetBox);
		}
	},
	deleteTweet:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		delete me.tweets[idIndex] ;
		delete me.tweetsFuncs[idIndex];
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
		if(me.state.selected ===undefined || idIndex===me.state.selected ){
			var id = me.constMap.tweetIdPrefix+idIndex;
			var target = $("#"+id);
			if(target.length<1){return;}
	//console.log("aaaa  /id:"+id+"/target:"+target.length+"/me.cursor:"+me.cursor);
			var top = target.position().top;
			var left = target.position().left;
			var height = $("#"+id).css("height").replace("px","")*1;
			if(offsetY===999){
				height=height;
				offsetY=-height;
			}
	//console.log("aaaa top:"+top+"/left:"+left+"/height:"+height+"/id:"+id+"/offsetY:"+offsetY);
			height+=(-height-offsetY);

			$("#svgAreaArrow").css("top",(top*1+height)).css("left",left);
			me.cursor=MansikiMapUtil.getKey(me.tweetIdMap,idIndex);
			me.showCursor(me);
		}
	},
	clearTweet:function(event){
		var me= event.data.self;
		for(var cursor in me.tweetIdMap){
			var tmpId = me.constMap.tweetIdPrefix+me.tweetIdMap[cursor];
			$("#"+tmpId).css("box-shadow","0px");
		}
		me.state.selected = undefined;
		me.bredgeArea.val("");
		me.funcs.clearTweet();
		$("#TMTweetMode").text(me.constMap.modAdd);
		me.initViewCursorObj({data:{self:me,idIndex:me.tweetIdMap[me.cursor],offsetY:20}});
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
		if(me.state.selected===idIndex){
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
		}else{
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:20}});
		}
	},
	hideCmdBox:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var id = me.constMap.tweetIdPrefix+idIndex;
		var target = $("#"+id).children(".tweetBoxCmd").eq(0);
		target.css("display","none");
		if(me.state.selected===idIndex){
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
		}else{
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:20}});
		}
	},
	changeObject:function(event){
		
	},
	calcStringLength:function(event){
		var me= event.data.self;
	},
	showToolTips:function(event){
		var me= event.data.self;
		var key=event.data.toolTipsKey;
		var toolTip=me.tooleTips[key];
	},
	onScroll:function(event){
		var me= event.data.self;
		if(me.scrollTimer!==undefined){
			clearTimeout(me.scrollTimer);	
		}
		me.scrollTimer = setTimeout(function(){me.doScroll(me);},10);
	},
	doScroll:function(me){
		var scrolltop = $("body").scrollTop()*1;
		scrolltop-= 120;
		scrolltop = scrolltop>0 ?scrolltop:0;
		me.tweetBoxParent.css("top",scrolltop);
	}
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
//console.log("getKey key:"+key+"/idIndex:"+value);
			if(map[key]===value){
				return key;
			}
		}
	},
	getFormatedTextCRLF:function(text){
		return text.replace(/(\r|\n|\r\n)/g, "<br />");
	}
}

var ManikiFunctions=function(editor,idIndex){
	this.editor = editor;
	this.frame="";
	this.nameLc="日本語名";
	this.nameEn="EnglishName";
	this.idIndex=idIndex;
	this.color="#35FFDA";
	this.idPrefix ="add";
	this.idSufix ="Icon";
	this.text="";
	this.Funcs={};
	this.inputArea = $("#TMinputArea");
	this.tweetArea = $("#TMtweetTextarea");
	this.bridgeArea = $("#TMtweetInput");
	this.level=1;
	this.indentClassPrefix="indent";
}

ManikiFunctions.prototype={
	add2Funcs:function(func){
		this.Funcs[this.idPrefix+func.Id+this.idSufix]=func;
	},
	getFunc:function(id){
		if(this.Funcs[id]===undefined){
			return ;
		}
		return this.Funcs[id];
	},
	init:function(){
	
	},
	create:function(idIndex){
		return new ManikiFunctions(idIndex);
	},
	autoResize:function(event){
		var me= event.data.self;
		var textareaObj = me.tweetArea.get(0);
		 me.tweetArea.css("height",me.editor.constMap.tweetAreaHeight);
		var height = textareaObj.scrollHeight+12;
		if(me.editor.constMap.tweetAreaHeight< height){
		 	me.tweetArea.css("height",height);
		}
	},
	makeInputArea:function(){
		this.inputArea.empty();
		this.tweetArea = $('<textarea class="input" id="TMtweetTextarea"></textarea>');
		this.inputArea.append(this.tweetArea );
		this.tweetArea.bind("keyup",{self:this},this.autoResize);
	},
	loadTweet:function(){
		var text = this.bridgeArea.val();
		this.tweetArea.val(text);
		this.tweetArea.focus();
	},
	addIndentClass:function(tweetBox){
		tweetBox.addClass(this.indentClassPrefix+this.level);
	},
	addTweet:function(){
		var text = this.tweetArea.val();
		this.bridgeArea.val(this.convertTextToManikiSyntax(text));
		this.tweetArea.focus();
	},
	convertTextToManikiSyntax:function(text){
		return text;
	},
	getPureText:function(value){
		return value;
	},
	clearTweet:function(text){
		this.tweetArea.val("").focus();
		this.autoResize({data:{self:this}});
	},
	getFullId:function(){
		return this.idPrefix+this.Id+this.idSufix;
	}
}

var ManikiFuncPage=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="頁";
	this.nameEn="Page";
	this.color="#35FFDA";
	this.Id ="Page";
	this.level =1;
}
ManikiFuncPage.prototype = new ManikiFunctions();
//ManikiFuncPage.prototype.
ManikiFuncPage.prototype.create=function(idIndex){
	return new ManikiFuncPage(idIndex);
}

var ManikiFuncKoma=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="コマ";
	this.nameEn="koma";
	this.color="#33FF7E";
	this.Id ="Koma";
	this.level =2;

}
ManikiFuncKoma.prototype = new ManikiFunctions();
//ManikiFuncPage.prototype.
ManikiFuncKoma.prototype.create=function(idIndex){
	return new ManikiFuncKoma(idIndex);
}


var ManikiFuncFukidashi=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="噴き出し";
	this.nameEn="Baloon";
	this.color="#33FF3D";
	this.Id ="Fukidashi";
	this.level =3;
}
ManikiFuncFukidashi.prototype = new ManikiFunctions();
//ManikiFuncPage.prototype.
ManikiFuncFukidashi.prototype.create=function(idIndex){
	return new ManikiFuncFukidashi(idIndex);
}


var ManikiFuncSetting=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="設定";
	this.nameEn="Settings";
	this.color="#7FFF35";
	this.Id ="Setting";
	this.level =3;
}
ManikiFuncSetting.prototype = new ManikiFunctions();
//ManikiFuncSetting.prototype.
ManikiFuncSetting.prototype.create=function(idIndex){
	return new ManikiFuncSetting(idIndex);
}


var ManikiFuncActor=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="役者";
	this.nameEn="Actor";
	this.color="#CDFF34";
	this.Id ="Man";
	this.level =3;
}
ManikiFuncActor.prototype = new ManikiFunctions();
//ManikiFuncActor.prototype.
ManikiFuncActor.prototype.create=function(idIndex){
	return new ManikiFuncActor(idIndex);
}


var ManikiFuncObject=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="小道具";
	this.nameEn="Object";
	this.color="#FFEF34";
	this.Id ="Object";
	this.level =3;
}
ManikiFuncObject.prototype = new ManikiFunctions();
//ManikiFuncObject.prototype.
ManikiFuncObject.prototype.create=function(idIndex){
	return new ManikiFuncObject(idIndex);
}


var ManikiFuncBackground=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="背景";
	this.nameEn="Background";
	this.color="#FFBF34";
	this.Id ="Background";
	this.level =3;
}
ManikiFuncBackground.prototype = new ManikiFunctions();
//ManikiFuncBackground.prototype.
ManikiFuncBackground.prototype.create=function(idIndex){
	return new ManikiFuncBackground(idIndex);
}


var ManikiFuncSound=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="擬音";
	this.nameEn="Sound";
	this.color="#FFBF34";
	this.Id ="Sound";
	this.level =3;
}
ManikiFuncSound.prototype = new ManikiFunctions();
//ManikiFuncSound.prototype.
ManikiFuncSound.prototype.create=function(idIndex){
	return new ManikiFuncSound(idIndex);
}


var ManikiFuncEffect=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="効果";
	this.nameEn="Effect";
	this.color="#FF7E34";
	this.Id ="Effect";
}
ManikiFuncEffect.prototype = new ManikiFunctions();
//ManikiFuncEffect.prototype.
ManikiFuncEffect.prototype.create=function(idIndex){
	return new ManikiFuncEffect(idIndex);
}


var ManikiFuncNalation=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="説明";
	this.nameEn="Settings";
	this.color="#30FF64";
	this.Id ="Nalation";
	this.level =3;
}
ManikiFuncNalation.prototype = new ManikiFunctions();
//ManikiFuncNalation.prototype.
ManikiFuncNalation.prototype.create=function(idIndex){
	return new ManikiFuncNalation(idIndex);
}


var ManikiFuncQuote=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="注釈";
	this.nameEn="Quote";
	this.color="#FF337A";
	this.Id ="Quote";
	this.level =3;
}
ManikiFuncQuote.prototype = new ManikiFunctions();
//ManikiFuncQuote.prototype.
ManikiFuncQuote.prototype.create=function(idIndex){
	return new ManikiFuncQuote(idIndex);
}


var ManikiFuncSean=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="場所";
	this.nameEn="Sean";
	this.color="#FF31F5";
	this.Id ="Sean";
	this.level =3;
}
ManikiFuncSean.prototype = new ManikiFunctions();
//ManikiFuncSean.prototype.
ManikiFuncSean.prototype.create=function(idIndex){
	return new ManikiFuncSean(idIndex);
}


var ManikiFuncFukusen=function(editor,idIndex){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="伏線";
	this.nameEn="Settings";
	this.color="#BA2FFF";
	this.Id ="Fukusen";
	this.level =3;
}
ManikiFuncFukusen.prototype = new ManikiFunctions();
//ManikiFuncFukusen.prototype.
ManikiFuncFukusen.prototype.create=function(idIndex){
	return new ManikiFuncFukusen(idIndex);
}






































