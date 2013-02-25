//コア
var MansikiModeConst={
	page:{color:"#3C3C50"}
	,koma:{color:"#3C3C50"}

}
if(MansikiModeConst.toSource===undefined){
    Object.defineProperty(Object.prototype, "toSource", { // 拡張
        configurable: true, // false is immutable
        enumerable: false,  // false is invisible
        writable: true,     // false is read-only
        value: function() {
            return JSON.stringify(this);
        }
    });
}
var MansikiTweetStyleEditor= function(id, width,height,ancer){
	this.keyMain="MansikiTweetStyleEditor_keyMain_"+id;
	this.doc;
	this.tweets={};
	this.tweetsFuncs={};
	this.tweetsFuncsIds={};
	this.tweetIdMap ={};
	this.tweetsSort=[];
	this.state={selected:undefined};
	this.cursor=0;
	this.tweetIdCount=0;;
	this.constMap={
		tweetIdPrefix:"TMid"
		,tweetAreaHeight:72
		,modAdd:"ADD"
		,modUpdate:"UPDATE"
		,modCursor:"----"
		,selectColor:"#AA9ED9"
		,unselectColor:"#C0C0FF"
	};
	this.cmdButtonsState={};
	this.commands=[{id:"page",data:{}}];
	this.currentCmd="page";
	this.tweetBoxParent = $("#TWtweetBoxParent");
	this.scrollTimer;
	this.MansikiTweetStyleKeyBind= new MansikiTweetStyleKeyBind(this);
	$(document).bind("scroll",{self:this},this.onScroll);
	this.funcs=new ManikiFunctions(this,0,this.MansikiTweetStyleKeyBind);
	this.funcs.add2Funcs(new ManikiFuncPage(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncKoma(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncFukidashi(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncSetting(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncActor(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncObject(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncBackground(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncSound(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncEffect(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncNalation(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncQuote(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncSean(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.add2Funcs(new ManikiFuncFukusen(this,0,this.MansikiTweetStyleKeyBind));
	this.funcs.makeInputArea();
	this.currentFuncId="";
	this.isFormFocusd=true;
	this.analizer= new MansikiTweetStateAnaliser(this);
}
MansikiTweetStyleEditor.prototype={
	init:function(){
		this.tweetHideTextarea = $("#TWtweetHideTextarea");
		this.field = $("form").eq(0);
		this.viewList = $("#TMtweetList");
		this.bredgeArea= $("#TMtweetInput");
		this.propInput= $("#TMinputProp");
		this.addButton= $("#TMadd");
		this.clearButton= $("#TMclear");
		this.twCmdAreaUpper = $("#TWcmdAreaUpper");
		this.twCmdAreaUnder = $("#TWcmdAreaUnder");
		this.SaveButton = $("#TMsaveButton");
		this.LoadButton = $("#TMloadButton");
		this.LoadButtonFile = $("#TMloadButtonFile");
		this.LSclear = $("#LSclear");
		this.initBinds(this);
		this.showCursor(this);
		this.initAndLoadLS();
		this.onScroll({data:{self:this}});
		this.onFocusToCmd({data:{self:this}});
		var me = this;
		setTimeout(function(){me.cursor =0;me.curosrMoveUp();},0);
	},
	initAndLoadLS:function(){
		var loadedData = MansikiMapUtil.loadFromLS(this.keyMain);
		if(loadedData !== null){
			this.tweetsFuncsIds = loadedData.tweetsFuncsIds;
			this.tweetIdMap = loadedData.tweetIdMap;
			this.tweets = loadedData.tweets;
			this.tweetIdCount = loadedData.tweetIdCount*1;

			this.analizer.loadTitleStates(loadedData.titleStates);;
			for(var idIndex in this.tweetsFuncsIds){
				var funcId = this.tweetsFuncsIds[idIndex];
				this.buildFuncs(this,idIndex,funcId);
			}
			this.reloadAllTweets();
			this.rebuildAll(this);
		}else{
			this.tweetsFuncsIds = {};
			this.tweetIdMap = {};
			this.tweets = {};
			this.tweetIdCount = 0;
			this.viewList.text("");
		}
	},
	//--------------------------------------------------------------
	startDownload:function (event) {
		var me= event.data.self;
		var loadedData = MansikiMapUtil.loadFromLS(me.keyMain);
		if(loadedData !== null && me.isSaveButtonClicked!==true){
		    	me.isSaveButtonClicked = true;
        	        var text = JSON.stringify(loadedData);
        	        var blob = new Blob([text]);
        	        var url = window.URL.createObjectURL(blob);
        	        var href = "data:application/octet-stream," + encodeURIComponent(text);
        	        document.getElementById('TMsaveButton').href = href;
        	        //me.SaveButton.click();
        	        //alert("startDownload url:"+url);
		}else{
		    me.isSaveButtonClicked=false;
		}
	},
	startLoad:function (event) {
		var me= event.data.self;
		
		event.preventDefault();
            // File オブジェクトを取得
            var file = me.LoadButtonFile.get(0).files[0];
            
            // 中身を読み込む
            var reader = new FileReader();                  // ファイルリーダー生成
            // ロード関数登録
            reader.onload = function(e) {
                var loadedData = e.target.result;
                MansikiMapUtil.saveToLSasPlane(me.keyMain,loadedData);
                me.initAndLoadLS();
            };
            
            // テキストとしてファイルを読み込む
            reader.readAsText(file);
	},
	doClearLS:function(event){
		var me= event.data.self;
		MansikiMapUtil.clearLS();
		me.initAndLoadLS();
	},
	//--------------------------------------------------------------
	initBinds:function(me){
		me.addButton.bind("click",{self:me},me.addTweet);
		me.clearButton.bind("click",{self:me},me.clearTweet);
		$("#TMTweetMode").text(me.constMap.modCursor);
		me.MansikiTweetStyleKeyBind.setKeyEventField(me.tweetHideTextarea);
		$("body").bind("mousemove",{self:me},me.onFocusToCmd);
		me.cmdButtonsHilightInit();
		me.SaveButton.bind("click",{self:me},me.startDownload);
		me.LoadButton.bind("click",{self:me},me.startLoad);
		me.LSclear.bind("click",{self:me},me.doClearLS);
	}, 
	cmdButtonsHilightInit:function(){
		var buttons = $(".commands>div");
		var firstId;
		for(var i=0;i<buttons.length;i++){
			var id= this.cmdButtonInfoInit(buttons.eq(i));
			if(firstId===undefined){
				firstId = id;
			}
//alert(buttons.eq(i).length+"/i:"+i+"/id:"+id+"/"+buttons.eq(i).css("background-color")+"/"+this.cmdButtonsState[id] );
		}
		//first selected
		this.cmdButtonsHilight({data:{self:this,id:firstId}});
	},
	cmdButtonInfoInit:function(button){
		var id= button.attr("id");
		if(id===undefined){
		    return ;
		}
		var buttonState = {};
		var func = this.funcs.getFunc(id);
		this.cmdButtonsState[id] = buttonState;
		var borderWidth = func.level*3;
		var width = button.css("width").match(/[0-9]*/)*1;
		button.css("width",width - borderWidth +7);
		button.css("padding-right",0);
		button.css("padding-left",0);
		button.css("border-left-width",borderWidth);
		buttonState["border-left-width"]=button.css("border-left-width");
		buttonState["border-color"]=button.css("border-color");
		buttonState["border-width"]=button.css("border-width");
		buttonState["border-style"]=button.css("border-style");
//alert(button.length+"/i:"+0+"/id:"+id+"/"+button.css("background-color")+"/"+buttonState["border-style"]+"/"+width);
		buttonState["color"]=button.css("color");
		button.bind("click",{self:this,id:id,level:func.level},this.cmdButtonsHilight);
		button.css("background-color",func.color);
		buttonState["background-color"]=button.css("background-color");
		var name = func.nameLc;
		var funcId = func.Id;
		var cmd = this.MansikiTweetStyleKeyBind.keyBindViewFuncs[funcId];
		button.children("div.TWFuncName").eq(0).text(name);
		button.children("div.TWFuncCommand").eq(0).text(cmd);
	    return id;
	},
	cmdButtonsHilight:function(event){
		var me= event.data.self;
		var fullId= event.data.id;
		var level= event.data.level;
		var bottons = $(".commands>div");
		if(level!==undefined){
			me.loadedFuncLevel = level;
		}
		for(var i=0;i<bottons.length;i++){
			var button = bottons.eq(i);
			var id= button.attr("id");
			var buttonState = me.cmdButtonsState[id] ;
			
			button
			.css("border-style",buttonState["border-style"])
			.css("border-width",buttonState["border-width"])
			.css("border-color",buttonState["border-color"])
			.css("border-left-width",buttonState["border-left-width"])
			.css("color",buttonState["color"])
			.css("background-color",buttonState["background-color"])
			.css("font-weight","nomal");
			var nowFunc = me.funcs.getFunc(id);
			if(level!==undefined && level > nowFunc.level 
				|| level!==undefined && level+1 < nowFunc.level 
				|| level===undefined && me.loadedFuncLevel !== undefined && me.loadedFuncLevel > nowFunc.level 
				|| level===undefined && nowFunc.level > 1
				){
			    button.css("opacity","0.3");
			    button.unbind("click");
			}else{
			    button.css("opacity","1");
			    button.bind("click",{self:me,id:id,level:nowFunc.level},me.cmdButtonsHilight);
			}
		}
		var buttonState = me.cmdButtonsState[fullId];
		var currentButton = $("#"+fullId);
		currentButton
		.css("border-color",buttonState["background-color"])
		.css("color","black")
		.css("font-weight","bold");
		me.twCmdAreaUpper.css("background-color",buttonState["background-color"]);
		me.twCmdAreaUnder.css("background-color",buttonState["background-color"]);
		me.currentFuncId =fullId;
	},
	//--------------------------------------------------------------------
	onFocusToCmd:function(event){
		var me= event.data.self;
		if(me.focusTimer!==undefined){
			clearTimeout(me.focusTimer);	
		}
		me.focusTimer = setTimeout(function(){me.doFocusToCmd(me);},10);
	},
	doFocusToCmd:function(me){
		var nowFunc = me.funcs.getFunc(me.currentFuncId);
		if(nowFunc.isFocusOnForm()!==true){
			me.tweetHideTextarea.focus();
			$("#TMTweetMode").text(me.constMap.modCursor);
//console.log("focus :"+me.tweetHideTextarea.val());
			me.tweetHideTextarea.val("");
			if(me.state.selected !==undefined)me.state.lastSelected = me.state.selected ;
			me.state.selected=undefined;
			for(var cursor in me.tweetIdMap){
				var tmpId = me.constMap.tweetIdPrefix+me.tweetIdMap[cursor];
				$("#"+tmpId).removeClass("TwselectedBox");
			}
			me.MansikiTweetStyleKeyBind.buidCmdAreaMain();
		}
	},
	onFocus:function(event){
		var me= event.data.self;
		me.isFormFocusd=true;
		$("body").unbind("mousemove",me.onFocusToCmd);
		me.addButton.text(BUTTON_UPDATE);
	},
	onBlur:function(event){
		var me= event.data.self;
		me.isFormFocusd=false;
		$("body").bind("mousemove",{self:me},me.onFocusToCmd);
		me.loadedFuncLevel = undefined; 
		me.addButton.text(BUTTON_ADD);
	},
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	buildFuncs:function(me,idIndex,funcId){
		funcId =funcId===undefined?me.currentFuncId:funcId;
console.log("buildFuncs funcId:"+funcId+"/"+me.funcs.getFunc(funcId)+"/"+me.MansikiTweetStyleKeyBind);
		var func = me.funcs.getFunc(funcId).create(idIndex,me.MansikiTweetStyleKeyBind);
		func.text=me.tweets[idIndex].text;
		func.prop=me.tweets[idIndex].prop;
		me.tweetsFuncs[idIndex]=func;
	},
	updateFuncs:function(me,idIndex){
		var func = me.tweetsFuncs[idIndex];
		var nowFunc = me.funcs.getFunc(me.currentFuncId);
		if(func===undefined || func.Id!==nowFunc.Id){
			delete me.tweetsFuncs[idIndex];
			me.tweetsFuncs[idIndex] = nowFunc.create(idIndex,me.MansikiTweetStyleKeyBind);
			return true;
		}
		return false;
	},
	//--------------------------------------------------------------------
	curosrMoveUp:function(){
		if(this.state.selected!==undefined){
			return ;
		}
		this.cursor--;
		if(this.cursor <0){
			this.cursor=0;
		}
		this.initViewCursorObj({data:{self:this,idIndex:this.tweetIdMap[this.cursor],offsetY:0,moveByKey:true}});
	},
	curosrMoveDown:function(){
		if(this.state.selected!==undefined){
			return ;
		}
		this.cursor++;
		var max=MansikiMapUtil.getMaxIndex(this.tweetIdMap);
		if(this.cursor> max){
			this.cursor = max;
		}
		this.initViewCursorObj({data:{self:this,idIndex:this.tweetIdMap[this.cursor],offsetY:0,moveByKey:true}});
	},
	//--------------------------------------------------------------------
	addTweet:function(event){
		var me= event.data.self;
		me.funcs.addTweet();
		var text = me.bredgeArea.val();
		var prop = me.propInput.val();
		if(text!==undefined && text.length>0){
			event.data.text=text;
			event.data.prop=prop;
			var currentFunc =me.funcs.getFunc(me.currentFuncId);
			if(me.state.selected !==undefined)me.state.lastSelected = me.state.selected ;
			var selectedFuncOnList = me.tweetsFuncs[me.state.lastSelected ];
			if(me.state.selected === undefined || selectedFuncOnList!==undefined && currentFunc.level > selectedFuncOnList.level){//add
				me.tweetIdCount++;
				event.data.idIndex=me.tweetIdCount;
//console.log("addTweet idIndex:"+event.data.idIndex+"/me.cursor:"+me.cursor+"/me.tweetIdMap:"+me.tweetIdMap.toSource());
				if( selectedFuncOnList!==undefined && currentFunc.level > selectedFuncOnList.level)me.cursor++;
				//alert("addTweet AAA currentFunc:"+currentFunc+"/selectedFuncOnList:"+selectedFuncOnList+"/me.state.lastSelected :"+me.state.lastSelected );
				me.insertTweet(event);
				me.cursor++;
				me.bredgeArea.val("");
				me.funcs.clearTweet();
				me.showCursor(me);
				me.state.selected = undefined;
			}else{//update
				event.data.idIndex=me.state.selected;
				me.updateTweet(event);
			}
			me.rebuildAll(me);
		}
		me.MansikiTweetStyleKeyBind.buidCmdAreaInput();
	},
	insertTweet:function(event){
		var me= event.data.self;
		var tweetBox=me.buildTweetBox(event);
		me.doInsertTweet(me,tweetBox);
		me.initViewCursorObj({data:{self:me,idIndex:me.tweetIdMap[me.cursor],offsetY:999}});
	},
	doInsertTweet:function(me,tweetBox){
		var currentFunc =me.funcs.getFunc(me.currentFuncId);
		var selectedFuncOnList = me.tweetsFuncs[me.state.lastSelected ];
console.log("doInsertTweet AAA currentFunc:"+currentFunc+"/selectedFuncOnList:"+selectedFuncOnList);
		if(me.cursor*1===0){
console.log("doInsertTweet AA0 currentFunc:"+currentFunc+"/selectedFuncOnList:"+selectedFuncOnList);
			if(me.viewList.children("div").length > 0){
				me.viewList.children("div").eq(0).before(tweetBox);
			}else{
				me.viewList.append(tweetBox);
			}
		}else if(selectedFuncOnList!==undefined && currentFunc!==undefined && currentFunc.level > selectedFuncOnList.level){
console.log("doInsertTweet AAB currentFunc:"+currentFunc+"/selectedFuncOnList:"+selectedFuncOnList);
			var preIdIndex=me.tweetIdMap[(me.cursor*1-1)];
			var preId=me.constMap.tweetIdPrefix+preIdIndex;
			var slot = $("#"+preId).find("div.tweetSlot").eq(0);
			//alert(slot.length+"/preId:"+preId+"/preIdIndex:"+preIdIndex+"/me.cursor:"+me.cursor);
			slot.prepend(tweetBox);
		}else{
console.log("doInsertTweet AAC currentFunc:"+currentFunc+"/selectedFuncOnList:"+selectedFuncOnList);
			var idIndex=me.tweetIdMap[me.cursor];
			var func = me.tweetsFuncs[idIndex];
			var preIdIndex=me.tweetIdMap[me.cursor-1];
			var preFunc = me.tweetsFuncs[preIdIndex];
			var preId=me.constMap.tweetIdPrefix+preIdIndex;
			var parentLevelObj = $("#"+preId).parent().parent().parent();
			var topLevelId = "TMtweetList";
			//alert("aaaa level:"+func.level+"/pre:"+preFunc.level+"/cursor:"+me.cursor+"/preIdIndex:"+preIdIndex+"/"+me.tweetIdMap.toSource());
			if(preFunc.level*1 === func.level*1){
				$("#"+preId).after(tweetBox);
			}else if(preFunc.level*1 <func.level*1){
				var slot = $("#"+preId).find("div.tweetSlot").eq(0);
				//alert(slot.length+"/level:"+func.level+"/pre:"+preFunc.level);
				slot.prepend(tweetBox);
			}else if( preFunc.level*1 === func.level*1+1){
			    if(parentLevelObj.parent().attr("id") === topLevelId){
				    parentLevelObj.find("div.twbConteinerFlame").eq(0).parent().eq(0).after(tweetBox);
			    }else{
				    parentLevelObj.parent().find("div.twbConteinerFlame").eq(0).parent().eq(0).after(tweetBox);
			    }
			}else if(preFunc.level*1 === func.level*1+2){
			    if(parentLevelObj.parent().parent().parent().attr("id") === topLevelId){
				    parentLevelObj.parent().parent().find("div.twbConteinerFlame").eq(0).parent().eq(0).after(tweetBox);
			    }else{
				    parentLevelObj.parent().parent().parent().find("div.twbConteinerFlame").eq(0).parent().eq(0).after(tweetBox);
			    }
			}else if(preFunc.level*1 === func.level*1+3){
			    if(parentLevelObj.parent().parent().parent().parent().parent().parent().attr("id") === topLevelId){
				    parentLevelObj.parent().parent().parent().parent().parent().find("div.twbConteinerFlame").eq(0).parent().eq(0).after(tweetBox);
			    }else{
				    parentLevelObj.parent().parent().parent().parent().parent().parent().find("div.twbConteinerFlame").eq(0).parent().eq(0).after(tweetBox);
			    }
			}
		}
		 
	},
	loadTweet:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var tweetBox=me.getTweetBoxObj(me,idIndex);
		for(var cursor in me.tweetIdMap){
			var tmpId = me.constMap.tweetIdPrefix+me.tweetIdMap[cursor];
			$("#"+tmpId).removeClass("TwselectedBox");
		}
		tweetBox.addClass("TwselectedBox");
		var tweet= me.tweets[idIndex];
		var func = me.tweetsFuncs[idIndex];
		me.bredgeArea.val(tweet.text);
		me.propInput.val(tweet.prop);
		me.funcs.loadTweet();
		me.cmdButtonsHilight({data:{self:me,id:func.getFullId(),level:func.level}});
		me.state.selected = idIndex;
		if(me.state.selected !==undefined)me.state.lastSelected = me.state.selected ;
		$("#TMTweetMode").text(me.constMap.modUpdate);
		me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
		me.MansikiTweetStyleKeyBind.buidCmdAreaInput();
	},
	updateTweet:function(event){
		var me = event.data.self;
		var text= event.data.text;
		var prop = event.data.prop;
		var idIndex = event.data.idIndex;
		me.tweets[idIndex] ={text:text,prop:prop};
		var isTweetBoxUpdated = me.updateFuncs(me,idIndex);
		var tweetBox=me.getTweetBoxObj(me,idIndex);
		if(isTweetBoxUpdated === false){
			tweetBox.find(".tweetBoxText").eq(0).html(MansikiMapUtil.getFormatedTextCRLF(text));
		}else{
			tweetBox.remove();
			tweetBox = me.execBuildTweetBox(me,idIndex);
			me.doInsertTweet(me,tweetBox);
		}
	},
	deleteTweet:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var id = me.constMap.tweetIdPrefix+idIndex;
		delete me.tweets[idIndex] ;
		delete me.tweetsFuncs[idIndex];
//console.log("AAA idIndex:"+idIndex+"/me.cursor:"+me.cursor+"/me.tweetIdMap:"+me.tweetIdMap.toSource());
		if(me.state.selected===idIndex){
			me.clearTweet(event);
			me.state.selected = undefined;
		}
		me.tweetIdMap=MansikiMapUtil.del(me.tweetIdMap,idIndex);
		me.cursor=MansikiMapUtil.getMaxIndex(me.tweetIdMap);
		me.getTweetBoxObj(me,idIndex).parent().parent().find("#"+id).eq(0).remove();
		me.initViewCursorObj({data:{self:me,idIndex:me.tweetIdMap[me.cursor]}});
//console.log("idIndex:"+idIndex+"/me.cursor:"+me.cursor+"/me.tweetIdMap:"+me.tweetIdMap.toSource());
		me.rebuildAll(me);
	},
	unionTweet:function(event){
		var me= event.data.self;
		me.rebuildAll(me);
	},
	moveTweet:function(event){
		var me= event.data.self;
		var direct= event.data.direct;
		var idIndex = event.data.idIndex;
		var cursor = MansikiMapUtil.getKey(me.tweetIdMap,idIndex*1)*1;
		var offset = 0;
		var func = me.tweetsFuncs[idIndex];
		var childCount = func.getChildCount() ;
		if(direct==="up"){
		    var upperTarget =  func.getUpperMovableCursor();
console.log("moveTweet up upperTarget:"+upperTarget+"/cursor:"+cursor);
		    offset= upperTarget>0 ? upperTarget - cursor :-1;
		}else if(direct==="down"){
		    var downerTarget =  func.getDownerMovableCursor();
console.log("moveTweet down downerTarget:"+downerTarget+"/cursor:"+cursor);
		    offset= downerTarget>0 ? downerTarget - cursor:1;
		}
console.log("moveTweet offset:"+offset);
		if(offset===0){
		    return ;
		}
		me.moveExecute(me,idIndex,cursor,offset,direct,func.level,childCount);
		me.hideCmdBox(event);
	},
	//実際にDOM上で動かす。
	moveExecute:function(me,idIndex,cursor,offset,direct,level,childCount){
		
console.log("moveExecute oldMap:"+me.tweetIdMap.toSource());
	    	//var subject = this.convertMovedNewMap(me,idIndex,cursor,offset,direct,level,childCount);
	    	var subject = this.convertMovedNewMap2(me,idIndex,direct);
console.log("moveExecute newMap:"+me.tweetIdMap.toSource()+"/subject:"+subject);
		var oldMap = me.tweetIdMap;
		var id = me.constMap.tweetIdPrefix+idIndex;
		var max=MansikiMapUtil.getMaxIndex(me.tweetIdMap)*1;
console.log("moveTweet idIndex:"+idIndex+"/subject:"+subject+"/direct:"+direct+"/cursor:"+cursor+"/offset:"+offset+"/oldMap:"+oldMap.toSource());
		if(subject !== undefined){

		    	var targetFunc = me.tweetsFuncs[idIndex];
		    	//var subFunc = me.tweetsFuncs[subject];
			var subjectId = me.constMap.tweetIdPrefix+subject;
			var subObj = document.getElementById(subjectId);//TweetBox
			var subParent = subObj.parentNode;
			var subParentId = subParent.id;
			me.cursor=cursor+offset;
			var target = document.getElementById(id);
			var parentSlot = target.parentNode;
			var parentId = parentSlot.id;
			var targetCursor=MansikiMapUtil.getKey(me.tweetIdMap,idIndex);
			if(parentSlot.id===""){
			    parentId = parentSlot.parentNode.parentNode.id;
			}
			if(subParent.id===""){
			    subParentId = subParent.parentNode.parentNode.id;
			}
console.log("moveTweetA idIndex:"+idIndex+"/"+subject+"/subject:"+subParentId+"/"+subParent.id+"/parent.id:"+parentId+"/"+parentSlot.id);
    			if(subParentId!=="" && subParentId===parentId){
        			var after = null;
        			var afterAfter = null;
        			var before = null;
        			var targetOrverd = false;
        			var count =0;
        			for(var childIndex in parentSlot.childNodes){
        			    var child = parentSlot.childNodes[childIndex];
        			    if(after !==null && child.id!==undefined){
        				afterAfter = child;
        				break;
        			    }
        			    if(targetOrverd ===true){
        				after = child;
        				count++;
        			    }
        			    if(child.id===id){
        				target=child;
        				targetOrverd=true;
        			    }else if(targetOrverd ===false){
        				before = child;
        			    }
 console.log("moveTweetHHHHS "+id+":"+child.id+"/"+parentId+"/"+parent.childNodes+"/"+(before!==null?before.id:null)+"/z"+(target.id)+"/y"+(after===null?"":after.id)
	 +"/"+(afterAfter===null?"":afterAfter.id)+"/"+(afterAfter===null)+"/x "+direct);
        			}
        			if(direct==="up"){
        			    parentSlot.insertBefore(target,before);
        			}else if(direct==="down"){
        			    console.log(afterAfter+"/"+(afterAfter===null));
        			    if((afterAfter===null)=="true"){
        				parentSlot.appendChild(target);
        			    }else{
            			    	//parent.appendChild(target);
        				parentSlot.insertBefore(target,afterAfter);
        			    }
        			}
			}else{//非対称の場合に限る,しかも越境に限るAfterは必ず上位
console.log("moveTweetVVVVVS "+id+"/"+parentId+"/"+parentSlot.getAttribute("class")+"/"+parentSlot.childNodes+"/b:"+before+"/z"+(target.id)+"/af:"+(after===undefined||after===null?"null":after.id)
					 +"/afaf:"+(afterAfter===undefined||afterAfter===null?"null":afterAfter.id)+"/"+(afterAfter===null)+"/x "+direct);

				if(direct==="up"){//ここに来る時点でソートは終了している。
console.log("moveTweetVVVVUPUP this.cursor:"+ this.cursor+"/childCount:"+childCount);			    //alert("upup");
				    var afterParentIndexId = me.tweetIdMap[(this.cursor*1 )];//この人のIDがおかしいような・・・
				    var afterParentFunc = me.tweetsFuncs[afterParentIndexId];
				    var levelOffset = targetFunc.level*1 - afterParentFunc.level*1;
				    //lert("levelOffset:"+levelOffset);
				    levelOffset = levelOffset===0?1:levelOffset;
				    var upperParentIndexId = me.tweetIdMap[(this.cursor*1  -levelOffset )];//この人のIDがおかしいような・・・ソート終わってるから子供は考慮いらんような・・・
        			    //var upperParentIndexId =  //me.getUpperParentIndexId(me,idIndex);//これが取ってくる者は何？ない場合もありうる。
        			    //ソートが終わったあとなので一個下ではないか・・・
        			    if(upperParentIndexId===undefined){
        				//break;
        			    }
        			    var upperParentId = me.constMap.tweetIdPrefix+upperParentIndexId;
				    var upperFunc = me.tweetsFuncs[upperParentIndexId];
        			    var upperParentObj = document.getElementById(upperParentId);
        			    var upperChildCount = upperFunc.getChildCount();
console.log("moveTweetVVVVUT targetFunc.level:"+targetFunc.level+"/max:"+max+"/offset:"+offset+"/upperFunc.level"+upperFunc.level+"/upperParentId:"+upperParentId+"/"+upperChildCount+"/idIndex:"+idIndex+"/upperParentIndexId:"+upperParentIndexId);
        			    if( targetFunc.level < upperFunc.level){
console.log("moveTweetVVVVUP targetFunc.level:"+targetFunc.level+"/max:"+max+"/offset:"+offset+"/upperFunc.level"+upperFunc.level+"/upperParentId:"+upperParentId+"/"+upperChildCount+"/idIndex:"+idIndex+"/upperParentIndexId:"+upperParentIndexId);
        			    }else if(upperChildCount > 0 && targetFunc.level===upperFunc.level){
console.log("moveTweetVVVVUO targetFunc.level:"+targetFunc.level+"/max:"+max+"/offset:"+offset+"/upperFunc.level"+upperFunc.level+"/upperParentId:"+upperParentId+"/"+upperChildCount+"/idIndex:"+idIndex+"/upperParentIndexId:"+upperParentIndexId);
       					var slot = upperParentObj.parentNode;
        				slot.appendChild(target);
        			    }else if(targetFunc.level===upperFunc.level){
console.log("moveTweetVVVVUS targetFunc.level:"+targetFunc.level+"/max:"+max+"/offset:"+offset+"/upperFunc.level"+upperFunc.level+"/upperParentId:"+upperParentId+"/"+upperChildCount+"/idIndex:"+idIndex+"/upperParentIndexId:"+upperParentIndexId);
        				var slot = upperParentObj.parentNode;//ここの認識がおかしい。うん、なんかおかしい上に子持ちがいたら上にいかない・・・おかしい
        				//slot.insertBefore(target,upperParentObj);
        				slot.appendChild(target,upperParentObj);
        			    }else if(targetFunc.level > upperFunc.level){
console.log("moveTweetVVVVUR targetFunc.level:"+targetFunc.level+"/max:"+max+"/offset:"+offset+"/upperFunc.level"+upperFunc.level+"/upperParentId:"+upperParentId+"/"+upperChildCount+"/idIndex:"+idIndex+"/upperParentIndexId:"+upperParentIndexId);

        				var slot = me.getSlotObj(upperParentObj);//upperParentObj.childNodes[slotDomObjIndex];upperParentIndexId
        				slot.appendChild(target);
        			    }else{
console.log("moveTweetVVVVUQ targetFunc.level:"+targetFunc.level+"/max:"+max+"/offset:"+offset+"/upperFunc.level"+upperFunc.level+"/upperParentId:"+upperParentId+"/"+upperChildCount+"/idIndex:"+idIndex+"/upperParentIndexId:"+upperParentIndexId);
        				var slot = me.getSlotObj(upperParentObj);//upperParentObj.childNodes[slotDomObjIndex];upperParentIndexId
        				slot.appendChild(target);
        			    }
        			}else if(direct==="down"){//ここの計算が狂っている、ここに来る時点でソートは終了している。
        			    var afterIdIndex = max<=targetCursor*1+1?null:me.tweetIdMap[(targetCursor*1+1)];//一個手前を取得
console.log("moveTweetVVVVVX afterIdIndex:"+afterIdIndex+"/max:"+max+"/targetCursor"+targetCursor);
        			    if(afterIdIndex!==null){
    					    	var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
        					var afterAfter = document.getElementById(afterId);
        				    	var afterFunc = me.tweetsFuncs[afterIdIndex];
        					target = document.getElementById(id);
console.log("moveTweetVVVVVY afterAfter:"+afterAfter+"/afterFunc:"+afterFunc+"/afterId"+afterId+"/target:"+target+"/afterFunc.level:"+afterFunc.level);	
						if(targetFunc.level<afterFunc.level){//slotの位置のよる,<は下位
						    var levelDiff = afterFunc.level-targetFunc.level;
						    var superParentNode =afterAfter;
console.log("moveTweetVVVVVE targetFunc.level:"+targetFunc.level+"/afterFunc.level:"+afterFunc.level+"/afterId"+afterId);
						    if(targetFunc.level===1){//上位の場合はこれ
							superParentNode = target.parentNode;;
						    }
						    //また後ろを取りに行く。子供数だけオフセットすると後ろが取れる。
						    var afterIdIndex = max<=targetCursor*1+childCount+1?null:me.tweetIdMap[(targetCursor*1+childCount+1)];
console.log("moveTweetVVVVVF max:"+max+"/targetFunc.level:"+targetFunc.level+"/afterFunc.level:"+afterFunc.level+"/afterIdIndex"+afterIdIndex+"/id:"+id+"/childCount:"+childCount);
						    if(afterIdIndex!==null){
							var afterAfter = document.getElementById(afterId);
							//この時点で逆にレベルが上位だった場合の考慮が抜けているsuperParentNode
							for(var h=0;h<3;h++){//想定階層分ずらして親をもらってくる。
							    var afterIdIndex = max<=targetCursor*1+childCount+1+h?null:me.tweetIdMap[(targetCursor*1+childCount+1+h)];
							    var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
							    //var afterAfterPre = afterAfter ;
							    afterAfter = document.getElementById(afterId);
							    var afterFunc = me.tweetsFuncs[afterIdIndex];//ヤバイなんかcoursorとidIndexが混ざってる！
console.log("moveTweetVVVVVH0 afterId:"+afterId+"/afterFunc:"+afterFunc+"/afterIdIndex:"+afterIdIndex+"/id:"+id+"/"+(targetCursor*1+childCount+1+h)+"/me.tweetIdMap:"+me.tweetIdMap.toSource());
console.log("moveTweetVVVVVH1 targetFunc.level:"+targetFunc.level+"/afterFunc.level:"+afterFunc.level+"/afterIdIndex:"+afterIdIndex+"/id:"+id);
							    if(afterIdIndex===null){
								alert("error");
							    }
							    if(afterFunc.level===targetFunc.level){//同一階層に限定
								superParentNode = afterAfter.parentNode;
								break;
							    }
							}
console.log("moveTweetVVVVVG afterId:"+afterId+"/afterFunc.level:"+afterFunc.level+"/afterIdIndex"+afterIdIndex+"/id:"+id);
							superParentNode.insertBefore(target,afterAfter);//エラー発生！
						    }else{
							for(var h=0;h<3;h++){//想定階層分ずらして親をもらってくる。
    								var afterIdIndex = max<=targetCursor*1-1-h?null:me.tweetIdMap[(targetCursor*1-1-h)];//一個上を取得
    								var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
    							    afterAfter = document.getElementById(afterId);
    							    var afterFunc = me.tweetsFuncs[afterIdIndex];//ヤバイなんかcoursorとidIndexが混ざってる！
console.log("moveTweetVVVVVI afterId:"+afterId+"/afterIdIndex"+afterIdIndex+"/id:"+id+"/afterAfter:"+afterAfter
	+"/afterFunc.level:"+afterFunc.level+"/targetFunc.level:"+targetFunc.level);
								//間違っているのはソートの方
							    if(afterFunc.level===targetFunc.level){//同一階層に限定
    								superParentNode=afterAfter.parentNode;
								break;
							    }
							}
							superParentNode.insertBefore(target,afterAfter);//最後尾なので追加
						    }

console.log("moveTweetVVVVVD afterAfter:"+afterAfter+"/afterFunc:"+afterFunc+"/afterId"+afterId);	    
						}else if(targetFunc.level===afterFunc.level){//slotの位置のよる
        					    var parentSlot = afterAfter.parentNode;
        					    parentSlot.insertBefore(target,afterAfter);
console.log("moveTweetVVVVVE afterAfter:"+afterAfter+"/afterFunc:"+afterFunc+"/afterId"+afterId);	
        					}else{//上位の場合は配置転換は終わっているので、一個上のものを取得
            	        			    var afterIdIndex = max===targetCursor*1+1?null:me.tweetIdMap[(targetCursor*1-1)];
        					    var afterId = me.constMap.tweetIdPrefix+afterIdIndex;//エラー発生！constMapがundefined
            					    var afterAfter = document.getElementById(afterId);
console.log("moveTweetVVVVVW afterAfter:"+afterAfter+"/afterFunc:"+afterFunc+"/afterId"+afterId);	

        					    //afterAfter.childNodes[slotDomObjIndex].appendChild(target);
    					    		me.getSlotObj(afterAfter).appendChild(target);
        					}
    					}else if(max===targetCursor*1){//配置転換は終わっているので、一個上のものを取得
    	        			    var afterIdIndex = max===targetCursor*1+1?null:me.tweetIdMap[(targetCursor*1-1)];
					    var afterFunc = me.tweetsFuncs[afterIdIndex];
console.log("moveTweetVVVVVC afterAfter:"+afterAfter+"/afterFunc:"+afterFunc+"/afterId:"+afterId);	
                                            if(targetFunc.level<afterFunc.level){//slotの位置のよる,<は子持ち！
						    var levelDiff = afterFunc.level-targetFunc.level;
						    var superParentNode =afterAfter;
console.log("moveTweetVVVVVE3 targetFunc.level:"+targetFunc.level+"/afterFunc.level:"+afterFunc.level+"/afterId"+afterId);
						    if(targetFunc.level===1){
							superParentNode = target.parentNode;;
						    }
						    //また後ろを取りに行く。子供数だけオフセットすると後ろが取れる。
						    var afterIdIndex = max<=targetCursor*1+childCount+1?null:me.tweetIdMap[(targetCursor*1+childCount+1)];
console.log("moveTweetVVVVVF3 targetFunc.level:"+targetFunc.level+"/afterFunc.level:"+afterFunc.level+"/afterIdIndex"+afterIdIndex+"/id:"+id);
						    if(afterIdIndex!==null){
							var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
							var afterAfter = document.getElementById(afterId);
							var afterFunc = me.tweetsFuncs[afterIdIndex];
console.log("moveTweetVVVVVG3 afterId:"+afterId+"/afterFunc.level:"+afterFunc.level+"/afterIdIndex"+afterIdIndex+"/id:"+id);
							superParentNode.insertBefore(target,afterAfter);
						    }else{
							superParentNode.appendChild(target);//最後尾なので追加
						    }
                                            }else{
                                        	var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
    					    	var afterAfter = document.getElementById(afterId);
console.log("moveTweetVVVVVZ afterAfter:"+afterAfter+"/afterFunc:"+afterFunc+"/afterId"+afterId);	//ここでafterAfterの階級考慮がない
					    	//afterAfter.childNodes[slotDomObjIndex].appendChild(target);
					    	me.getSlotObj(afterAfter).appendChild(target);
                                            }
    					}else if(max===targetCursor*1+1 && max >=3){//
    					    var afterIdIndex = me.tweetIdMap[(targetCursor*1-1)];//一個手前を取得
					    var afterFunc = me.tweetsFuncs[afterIdIndex];
                                    	    var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
					    var afterAfter = document.getElementById(afterId);
console.log("moveTweetVVVVVC afterAfter:"+afterAfter+"/afterFunc.level:"+afterFunc.level+"/afterId:"+afterId+"/targetFunc.level:"+targetFunc.level);	
                                            if(targetFunc.level<afterFunc.level){//slotの位置のよる,<は子持ち！
						    var levelDiff = afterFunc.level-targetFunc.level;
						    var superParentNode =afterAfter;
console.log("moveTweetVVVVVE2 targetFunc.level:"+targetFunc.level+"/afterFunc.level:"+afterFunc.level+"/afterId"+afterId);
						    if(targetFunc.level===1){
							superParentNode = target.parentNode;;
						    }else{
							//superParentNode = afterAfter.childNodes[slotDomObjIndex];
							superParentNode = me.getSlotObj(afterAfter);
						    }
						    //また後ろを取りに行く。子供数だけオフセットすると後ろが取れる。
						    var afterIdIndex = max <= targetCursor*1+childCount+1 ?null :me.tweetIdMap[(targetCursor*1+childCount+1)];
console.log("moveTweetVVVVVF2 targetFunc.level:"+targetFunc.level+"/afterFunc.level:"+afterFunc.level+"/afterIdIndex"+afterIdIndex+"/id:"+id);
						    if(afterIdIndex!==null){
							var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
							var afterAfter = document.getElementById(afterId);
							var afterFunc = me.tweetsFuncs[afterIdIndex];
console.log("moveTweetVVVVVG2 afterId:"+afterId+"/afterFunc.level:"+afterFunc.level+"/afterIdIndex"+afterIdIndex+"/id:"+id);
							superParentNode.insertBefore(target,afterAfter);
						    }else{
							superParentNode.appendChild(target);//最後尾なので追加
						    }
                                            }else if(targetFunc.level>afterFunc.level){//越境組
        					    var afterIdIndex = me.tweetIdMap[(targetCursor*1+1)];//一個手前を取得
                                            	    var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
        					    var afterObj = document.getElementById(afterId);
console.log("moveTweetVVVVVG4 afterId:"+afterId+"/afterFunc.level:"+afterFunc.level+"/afterIdIndex"+afterIdIndex+"/id:"+id+"/afterObj:"+afterObj+"/afterAfter:"+afterAfter+"/target:"+target);
						    var superParentNode =afterAfter;
						    //superParentNode.childNodes[slotDomObjIndex].insertBefore(target,afterObj);
						    me.getSlotObj(superParentNode).insertBefore(target,afterObj);
                                            }else{
                                        	var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
    					    	var afterAfter = document.getElementById(afterId);
console.log("moveTweetVVVVVG3 afterId:"+afterId+"/afterFunc.level:"+afterFunc.level+"/afterAfter"+afterAfter+"/afterIdIndex:"+afterIdIndex);
    					    	//afterAfter.childNodes[slotDomObjIndex].appendChild(target);
    					    	me.getSlotObj(afterAfter).appendChild(target);
                                            }
    					}
        			}
			}
		}
		me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
		me.rebuildAll(me);
	},
	getSlotObj:function(domObj){
	    var slotDomObjIndex=2;
	    return domObj.childNodes[1].childNodes[slotDomObjIndex];
	},
	//ソートのアルゴリズムを変える。we-
	convertMovedNewMap2:function(me,idIndex,direct){
		var id = me.constMap.tweetIdPrefix+idIndex;
		var oldMap = me.tweetIdMap;
		var newMap = {};
		var nextMoveIndexMap ={};
		var parentLevel =0 ;
		var subject = undefined;
		var remarkObjectsListByLevel ={};
		var corsole =0 ;
		var parentObj = undefined;
		var max = MansikiMapUtil.getMaxIndex(me.tweetIdMap)*1;
		//まずここで管理用のオブジェクトを構築
    		me.convertMovedNewMap2buildTree(me,parentLevel,parentObj,corsole,max,remarkObjectsListByLevel);
console.log("XXX remarkObjectsListByLevel:"+remarkObjectsListByLevel.toSource());
    		//ソートなる移動を実施
		
    		subject = me.convertMovedNewMap2MoveExecOnTree(me,max,idIndex,direct,remarkObjectsListByLevel);
//console.log("remarkObjects:"+remarkObjects.toSource());
console.log("convertMovedNewMap2buildTree XX remarkObjectsListByLevel:"+remarkObjectsListByLevel.toSource());
    		//スタックを構成
		var levelList = remarkObjectsListByLevel["Level"+1];
//console.log("levelList:"+levelList.toSource());
    		var stack = me.convertMovedNewMap2AfterMoveMakeStack(levelList,remarkObjectsListByLevel);
console.log("stack:"+stack.toSource());
    		for(var targetCursor =0 ;targetCursor<= max;targetCursor++){
		    newMap[targetCursor]=stack[targetCursor];
		}
		me.tweetIdMap = newMap;
    		return subject;
	},
	convertMovedNewMap2buildTree:function(me,parentLevel,parentObj,corsole,max,remarkObjectsListByLevel){//再帰ちゃん
	    var parentIndexId = -1;
	    var childrenObjects = [];//子供専用,この階層内で閉じて、ツリーを構成する。
	    var preObj = undefined;
	    var currentObj ={};
console.log("convertMovedNewMap2buildTree Z");
	    for(var i = corsole; i<=max;i++){
		    var indexIdTemp = me.tweetIdMap[i];
		    var indexIdParent = me.tweetIdMap[i-1];
		    if(parentLevel!==0 && indexIdParent!==undefined ){//なんだここは・・・
			var parentFunc = me.tweetsFuncs[indexIdParent];
			if(parentFunc.level ===parentLevel){
			    parentIndexId = indexIdParent;
			}
		    }else if(parentLevel === 0){
			parentIndexId=undefined;
		    }

console.log("convertMovedNewMap2buildTree CCC　indexIdTemp:"+indexIdTemp+"/corsole:"+corsole+"/i:"+i);
		    var func = me.tweetsFuncs[indexIdTemp];
		    currentObj = {indexID :indexIdTemp,level:func.level,parentIndexId:parentIndexId};

console.log("convertMovedNewMap2buildTree X==:i:"+i+"/parentLevel:"+parentLevel+"/func.level:"+func.level+"/indexIdParent:"+indexIdParent+"/indexIdTemp:"+indexIdTemp+"/childrenObjects:"+childrenObjects.toSource());
		    if(parentLevel+1 === func.level){
			preObj = currentObj;
			//本処理
			childrenObjects.push(currentObj);
			if(remarkObjectsListByLevel["Level"+func.level]===undefined){
			    remarkObjectsListByLevel["Level"+func.level] = [];
			}
			remarkObjectsListByLevel["Level"+func.level].push(MansikiMapUtil.deepCopyMap(currentObj));//参照を持てない。
			remarkObjectsListByLevel[indexIdTemp]=(childrenObjects);
			remarkObjectsListByLevel["LAST"] = indexIdTemp;//最終版がマスタ扱い。
console.log("convertMovedNewMap2buildTree  F:i:"+i+"/parentLevel:"+parentLevel+"/func.level:"+func.level+"/indexIdParent:"+indexIdParent+"/indexIdTemp:"+indexIdTemp+"/currentObj:"+currentObj.toSource());
		    }else if(parentLevel+2 === func.level){
console.log("convertMovedNewMap2buildTree  D1:i:"+i+"/parentLevel:"+parentLevel+"/func.level:"+func.level+"/indexIdParent:"+indexIdParent+"/indexIdTemp:"+indexIdTemp);
			
			//下位は再帰childrenObjects
			parentLevel++;
			i = me.convertMovedNewMap2buildTree(me,parentLevel,preObj ,i,max,remarkObjectsListByLevel)-1;
			
console.log("convertMovedNewMap2buildTree  D2:i:"+i+"/parentLevel:"+parentLevel+"/func.level:"+func.level+"/indexIdParent:"+indexIdParent+"/indexIdTemp:"+indexIdTemp);
			parentLevel--;
		    }else if(parentLevel >= func.level){//いきなり２ステップ以上上の可能性
console.log("convertMovedNewMap2buildTree  U:i:"+i+"/parentLevel:"+parentLevel+"/func.level:"+func.level+"/indexIdParent:"+indexIdParent+"/indexIdTemp:"+indexIdTemp);

                        if(parentObj!==undefined && childrenObjects.length >0){
console.log("convertMovedNewMap2buildTree T1:i:"+i+"/childrenObjectsUnder:"+childrenObjects.toSource());
                        	parentObj.children = childrenObjects;//なんかつけてる先がおかしい。最終端末の場合はなんか通らないのだが・・・
                        }
			return i;//上位はインデックス渡して終了
		    }
console.log("convertMovedNewMap2buildTree Y:i:"+i+"/func:" +func+"/indexIdTemp:"+indexIdTemp+"/currentObj:"+currentObj.toSource());
		currentObj =undefined;
	    }
            if(parentObj!==undefined && childrenObjects.length >0){
console.log("convertMovedNewMap2buildTree T2:i:"+i+"/childrenObjectsUnder:"+childrenObjects.toSource());
	 	parentObj.children = childrenObjects;//なんかつけてる先がおかしい。最終端末の場合はなんか通らないのだが・・・
	     }
	    return max+1;
	},
	getObjOnTheList:function(indexId,list){
	    for(var index in list){
		var tmpObj = list[index];
		if(indexId===tmpObj.indexID){
		    return tmpObj;
		}
	    }
	},
	getIndexOnTheList:function(indexId,list){
	    for(var index in list){
		var tmpObj = list[index];
		if(indexId===tmpObj.indexID){
		    return index;
		}
	    }
	    
	},
	convertMovedNewMap2MoveExecOnTree:function(me,max,indexId,diarect,remarkObjectsListByLevel){//再帰じゃないよ。しくじってるのこころ！
	    var subject = undefined;

	    var funcOfTarget = me.tweetsFuncs[indexId];
	    var parentLevel = funcOfTarget.level - 1;
	    for(var i = 0; i<=max;i++){
		    var indexIdTemp = me.tweetIdMap[i];
		    var func = me.tweetsFuncs[indexIdTemp];
console.log("convertMovedNewMap2MoveExecOnTree FirstXX:i:"+i+"/indexIdTemp:"+indexIdTemp+"/func.level:"+func.level+"/parentLevel+1:"+(parentLevel+1)+"/"
	+parentLevel+"/"+indexIdTemp+"/"+indexId);

		    if(parentLevel+1 === func.level && indexIdTemp*1===indexId*1){//対象がいたら。
			//本処理
			var levelList = remarkObjectsListByLevel["Level"+func.level];
console.log("convertMovedNewMap2buildTree A:i:"+i+"/indexIdTemp:"+indexIdTemp+"/func.level:"+func.level+"/levelList:"+levelList.toSource());
			var levelListLength = levelList.length;
			for(var index in levelList){
			    var targetObj = levelList[index];//各レベルの順番を抜く
			    if(indexId === targetObj.indexID ){//リスト上の自分
console.log("convertMovedNewMap2buildTree B:i:"+i+"/indexId:"+indexId+"/index:"+index+"/diarect:"+diarect+"/"+levelListLength);
        			    if(diarect ==="down" ){//下を取ってそこの配列にねじ込む。というかそこの配列のその順番の後ろにねじ込む
        				if(index < levelListLength-1){//まだ後ろがある
        				    var nextIndex = index*1+1;
        				    var changeObj = levelList[nextIndex];//あくまでも同じ階層なので
        				    if(changeObj.parentIndexId ===targetObj.parentIndexId){
        					//同じ親の配下
        					var remarkObjects = remarkObjectsListByLevel[indexIdTemp];//レベルは同じなので
        					
        	        	//alert("remarkObjects A:"+remarkObjects.toSource()
        	        	//	+"/indexIdTemp:"+indexIdTemp+"/changeObj.indexID:"+changeObj.indexID+"/targetObj.indexID:"+targetObj.indexID);
        					levelList.splice(index*1,2,changeObj,targetObj);//レベルリスト内で入れ替え
        					var changeObjTrue = me.getObjOnTheList(changeObj.indexID,remarkObjects);
        					var targetObjTrue = me.getObjOnTheList(targetObj.indexID,remarkObjects);
        					var indexTargetOntheList = me.getIndexOnTheList(targetObj.indexID,remarkObjects);
        					remarkObjects.splice(indexTargetOntheList,2,changeObjTrue,targetObjTrue);//これの齟齬はおこらないか？おんなじモノ見てるから大丈夫？
        					subject = changeObj.indexID;
        	        	//alert("remarkObjects B:"+remarkObjects.toSource()+"/indexIdTemp:"+indexIdTemp);
            					remarkObjectsListByLevel["Level"+func.level]=levelList;
        					remarkObjectsListByLevel[indexIdTemp]= remarkObjects;
        			//alert("remarkObjectsListByLevel:"+remarkObjectsListByLevel.toSource());
//console.log("convertMovedNewMap2buildTree B1:i:"+i+"/indexId:"+indexId+"/index:"+index+"/diarect:"+diarect);		
        				    }else{//あー間に上位の空が挟まっている場合の考慮漏れ
//console.log("convertMovedNewMap2buildTree B1Y:i:"+i+"/remarkObjectsListByLevel:"+remarkObjectsListByLevel.toSource());
        					var levelListParent = remarkObjectsListByLevel["Level"+(func.level*1-1)];	
        					for(var n=0,len =levelListParent.length;n<len;n++){
//console.log("convertMovedNewMap2buildTree B1a:i:"+i+"/indexId:"+indexId+"/index:"+index+"/diarect:"+diarect+"/targetObj.parentIndexId:"+targetObj.parentIndexId+"/levelListParent:"+levelListParent.toSource()+"/"+n);	
        					    var targetObjParent = levelListParent[n];
        					    if(targetObjParent.indexID === targetObj.parentIndexId){
            					    	var nextObjParent = levelListParent[n+1];
	        					var remarkObjectsParent = remarkObjectsListByLevel[targetObjParent.indexID];
    	        					var targetObjParentTrue = me.getObjOnTheList(targetObjParent.indexID,remarkObjectsParent);
	        					var remarkObjectsNext = remarkObjectsListByLevel[nextObjParent.indexID];
    	        					var nextObjParentTrue = me.getObjOnTheList(nextObjParent.indexID,remarkObjectsNext);
        						if(nextObjParent.indexID === changeObj.parentIndexId){
//console.log("convertMovedNewMap2buildTree B1ba:i:"+i+"/nextObjParentTrue:"+nextObjParentTrue.toSource());
        						    //重要なのはremarkObjectsListByLevelのリスト上でchildをきちんと管理すること
//console.log("convertMovedNewMap2buildTree B1V:i:"+i+"/remarkObjectsListByLevel:"+remarkObjectsListByLevel.toSource());
        	        					var targetObjTrue = targetObjParentTrue.children.pop();
        	        					remarkObjectsListByLevel[targetObjTrue.indexID]=[targetObjTrue];
//console.log("convertMovedNewMap2buildTree B1W:i:"+i+"/remarkObjectsListByLevel:"+remarkObjectsListByLevel.toSource());
        	        					nextObjParentTrue.children.unshift(targetObjTrue);
//console.log("convertMovedNewMap2buildTree B1Z:i:"+i+"/remarkObjectsListByLevel:"+remarkObjectsListByLevel.toSource());

//console.log("convertMovedNewMap2buildTree B1bb:i:"+i+"/nextObjParentTrue:"+nextObjParentTrue.toSource()+"/targetObjTrue:"+targetObjTrue.toSource());
        						}else{
        						    	var targetObjTrue =targetObjParentTrue.children.pop();
        	        					remarkObjectsListByLevel[targetObjTrue.indexID]=[targetObjTrue];
                					    	if(nextObjParentTrue.children===undefined){
                					    	    nextObjParentTrue.children=[];
                    					    	}
        	        					nextObjParentTrue.children.unshift(targetObjTrue);//結局こいつらがあるから再度調整が必要
//console.log("convertMovedNewMap2buildTree B1c:i:"+i+"/nextObjParentTrue:"+nextObjParentTrue.toSource());
        						}
//console.log("convertMovedNewMap2buildTree B1d:targetObjParent.indexID:"+targetObjParent.indexID+"/remarkObjectsParent:"+remarkObjectsParent.toSource());
	        					subject = nextObjParent.indexID;
        						levelListParent[n+1]=nextObjParent;
    						    	break;
        					    }
        					}
//console.log("convertMovedNewMap2buildTree B1A:i:"+i+"/indexId:"+indexId+"/index:"+index+"/diarect:"+diarect);
        					remarkObjectsListByLevel["Level"+(func.level*1-1)]=levelListParent;
        				    }
//console.log("convertMovedNewMap2buildTree B1X:i:"+i+"/remarkObjectsListByLevel:"+remarkObjectsListByLevel.toSource());
 //   console.log("convertMovedNewMap2buildTree B2:i:"+i+"/indexId:"+indexId+"/index:"+index+"/diarect:"+diarect+"/subject:"+subject);
        				    return subject;
        				}else if(targetObj.parentIndexId!==undefined){
        				    
        				    //上位がある場合はもういちどたぐる※なんかここが動いていない？
        					var levelListParent = remarkObjectsListByLevel["Level"+(func.level*1-1)];
//console.log("convertMovedNewMap2buildTree B4a:i:"+i+"/func.level:"+func.level+"/remarkObjectsListByLevel:"+remarkObjectsListByLevel.toSource());
        					
        					var levelListParentLength = levelListParent.length;
        					for(var indexParent in levelListParent){
        					    var parentObj = levelListParent[indexParent];
//console.log("convertMovedNewMap2buildTree B4b:i:"+i+"/indexParent:"+indexParent+"/index:"+index+"/diarect:"+diarect+"/parentObj.indexID:"+parentObj.indexID+"/"+targetObj.parentIndexId 
//	+"/levelListParentLength:"+levelListParentLength+"/"+(indexParent*1+1));
	
        					    if(parentObj.indexID === targetObj.parentIndexId && indexParent*1+1< levelListParentLength){
                					var remarkObjectsParent = remarkObjectsListByLevel[targetObj.parentIndexId];
							var nextObjParent = levelListParent[indexParent*1+1];
							
        	        				var targetObjParentTrue = me.getObjOnTheList(parentObj.indexID,remarkObjectsParent);
            					    	var parentObjNext = levelListParent[indexParent*1+1];
	        					var remarkObjectsNext = remarkObjectsListByLevel[parentObjNext.indexID];
    	        					var nextObjParentTrue = me.getObjOnTheList(nextObjParent.indexID,remarkObjectsNext);
	        					var targetObjTrue = targetObjParentTrue.children.pop();
	        					remarkObjectsListByLevel[targetObjTrue.indexID]=[targetObjTrue];
        						//この親の舌に入れる
            					    	if(nextObjParentTrue.children===undefined){
            					    	    nextObjParentTrue.children=[];
            					    	}
            					    	nextObjParentTrue.children.unshift(targetObjTrue);
	        					subject = parentObjNext.indexID;
        					    }
        					    
        					}
  //     console.log("convertMovedNewMap2buildTree B4:i:"+i+"/indexId:"+indexId+"/index:"+index+"/diarect:"+diarect);
        				}
        				//そもそも最下位の場合は放置？
        			    }else{//うっぺｒ−
        				if(index*1 > 0){
        				    var changeObj  = levelList[index*1-1];
        				    if(changeObj.parentIndexId ===targetObj.parentIndexId){
        					//同じ親の配下
        					levelList.splice(index*1-1,2,targetObj,changeObj);
        					var remarkObjects = remarkObjectsListByLevel[indexIdTemp];

        					var changeObjTrue = me.getObjOnTheList(changeObj.indexID,remarkObjects);
        					var targetObjTrue = me.getObjOnTheList(targetObj.indexID,remarkObjects);
        					var indexTargetOntheList = me.getIndexOnTheList(changeObjTrue.indexID,remarkObjects);
        					
        					remarkObjects.splice(indexTargetOntheList,2,targetObjTrue,changeObjTrue);
        					subject = changeObj.indexID;
        				    }else{//あー間に上位の空が挟まっている場合の考慮漏れ
        					var levelListParent = remarkObjectsListByLevel["Level"+(func.level*1-1)];
        					for(var n=0,len =levelListParent.length;n<len;n++){
        					    var targetObjParent = levelListParent[n];
        					    if(targetObjParent.indexID === targetObj.parentIndexId){
            					    	var nextObjParent = levelListParent[n-1];
	        					var remarkObjectsParent = remarkObjectsListByLevel[targetObjParent.indexID];
    	        					var targetObjParentTrue = me.getObjOnTheList(targetObjParent.indexID,remarkObjectsParent);
	        					var remarkObjectsNext = remarkObjectsListByLevel[nextObjParent.indexID];
    	        					var nextObjParentTrue = me.getObjOnTheList(nextObjParent.indexID,remarkObjectsNext);
        						if(nextObjParent.indexID === changeObj.parentIndexId){
        	        					//違う場合はlevelListに手は加えない
        	        					var targetObjTrue = targetObjParentTrue.children.shift();
        	        					remarkObjectsListByLevel[targetObjTrue.indexID]=[targetObjTrue];
        	        					var remarkObjectsTarget = remarkObjectsListByLevel[changeObj.indexID];
        	        					nextObjParentTrue.children.push(targetObjTrue);
        						    
        						}else{
        						    	var targetObjTrue =targetObjParentTrue.children.shift();
        	        					remarkObjectsListByLevel[targetObjTrue.indexID]=[targetObjTrue];
                					    	if(nextObjParentTrue.children===undefined){
                					    	    nextObjParentTrue.children=[];
                    					    	}
                					    	nextObjParentTrue.children.push(targetObjTrue);
        						}
                					subject = nextObjParent.indexID;
    						    	break;
        					    }
        					}
        				    }
   console.log("convertMovedNewMap2buildTree U1:i:"+i+"/indexId:"+indexId+"/index:"+index+"/diarect:"+diarect);
        				    return subject;
        				}else if(targetObj.parentIndexId!==undefined){
        				    //上位がある場合はもういちどたぐる
        				    var levelListParent = remarkObjectsListByLevel["Level"+(func.level*1-1)];

        					for(var indexParent in levelListParent){
        					    var parentObj = levelListParent[indexParent];
        					    if(parentObj.indexID === targetObj.parentIndexId && indexParent*1 > 0){
            					    	var nextObjParent = levelListParent[indexParent*1-1];
                					var remarkObjectsParent = remarkObjectsListByLevel[targetObj.parentIndexId];
        	        				var targetObjParentTrue = me.getObjOnTheList(parentObj.indexID,remarkObjectsParent);
            					    	var parentObjNext = levelListParent[(indexParent*1-1)];
	        					var remarkObjectsNext = remarkObjectsListByLevel[parentObjNext.indexID];
    	        					var nextObjParentTrue = me.getObjOnTheList(nextObjParent.indexID,remarkObjectsNext);
	        					var targetObjTrue = targetObjParentTrue.children.shift();
	        					remarkObjectsListByLevel[targetObjTrue.indexID]=[targetObjTrue];
        						//この親の舌に入れる
            					    	if(nextObjParentTrue.children===undefined){
            					    	    nextObjParentTrue.children=[];
            					    	}
            					    	nextObjParentTrue.children.push(targetObjTrue);
                					subject = nextObjParent.indexID;
            					    	//なんかこのあと作業をしないといけないような・・・もともと端っこだからカンケイナイ？
        					    }
        					}
    console.log("convertMovedNewMap2buildTree U2:i:"+i+"/indexId:"+indexId+"/index:"+index+"/diarect:"+diarect);
        				}
        			    }
			    }
			    preIndex= index;
			}
			return subject;
		    }
	    }
	    return subject;
	},
	//=======================================================================================================
	convertMovedNewMap2AfterMoveMakeStack:function(levelList,remarkObjectsListByLevel){//ここは階層考慮が抜けている？
	    var retStack = [];
		for(var i = 0,len= levelList.length ;i < len ;i++){
		    var currentObj = levelList[i];
		    var indexId = currentObj.indexID;
		    var listOfRef = remarkObjectsListByLevel[indexId];
		    var children =undefined;
		    for(var index in listOfRef){
			var tmpObj = listOfRef[index];
			if(tmpObj.indexID===indexId){
			    children = tmpObj.children;
			    break;
			}
		    }
		    retStack.push(indexId);
	console.log("indexId:"+indexId);
		    if(children!==undefined){
			var childStack = this.convertMovedNewMap2AfterMoveMakeStack(children,remarkObjectsListByLevel);
			retStack = retStack.concat(childStack);
		    }
		}
	    return retStack;
	},
	//これどうなってんだっけ？いるの？
	convertMovedNewMap2MoveExecSearch:function(me,parentLevel,remarkObjects,corsole,max,indexId,diarect,getObjParent,target){//再帰ちゃん
	    for(var i = corsole; i<=max;i++){
		    var indexIdTemp = me.tweetIdMap[i];
		    var func = me.tweetsFuncs[indexIdTemp];
		    if(target!==undefined  && target.indexID!==undefined){
			return max+1;
		    }
		    if(parentLevel+1 === func.level && indexIdTemp===indexId){//対象がいたら。
			//本処理
			target = remarkObjects[i];
			delete remarkObjects[i];
			return ;
		    }else if(parentLevel === func.level){
			parentLevel--;
			return i;//上位はインデックス渡して終了
		    }else if(parentLevel === func.level+1){
			//下位は再帰
			var remarkObjectsUnder = [];
			parentLevel++;
			i = me.convertMovedNewMap2MoveExec(me,parentLevel,remarkObjectsUnder ,corsole,max,indexId,diarect)-1;
			currentObj.children = remarkObjectsUnder;
		    }
	    }
	    return max+1;
	},
	//とにかくソートを実施する。古い。
	convertMovedNewMap:function(me,idIndex,currentCursor,offset,direct,level,childCount){
		var id = me.constMap.tweetIdPrefix+idIndex;
		var oldMap = me.tweetIdMap;
		var newMap = {};
		var nextMoveIndexMap ={};
		var corigionList =[];
		var remarkMap ={};
		var repeatList=[];
		var childrenList ={};
		var childrenStack=[];
		if(direct==="down"){
		    offset;//+=childCount;//offsetのした方向がおかしい？なんか
		}else{
		    offset;//上りは何もしない。
		}
		var max=MansikiMapUtil.getMaxIndex(me.tweetIdMap)*1;
		for(var tmpCursor=0;tmpCursor <= max;tmpCursor++ ){
		    corigionList.push([]) ;
		}
		for(var tmpCursor=0;tmpCursor <= max;tmpCursor++ ){
		    	//OK
			var idIndex = oldMap[tmpCursor];
			if(idIndex===undefined){
			    continue;
			}
console.log("convertMovedNewMapAAAA tmpCursor:"+tmpCursor+"/currentCursor:"+currentCursor+"/offset"+offset+"/id:"+id);
			if(tmpCursor === currentCursor){
			    idIndex = oldMap[tmpCursor];
			    var targetCurosor = tmpCursor+offset;
console.log("convertMovedNewMapAAAB targetCurosor:"+targetCurosor+"/currentCursor:"+currentCursor+"/offset"+offset+"/id:"+id);
			    corigionList[targetCurosor].push(idIndex);
			    nextMoveIndexMap[idIndex]=targetCurosor;
			    remarkMap[idIndex] = true;
			    for(var i = 1;i<=childCount ;i++){//ここは正常に作動している。
				idIndex = oldMap[tmpCursor+i];
				targetCurosor+=i;
				childrenList[idIndex]=true;//子供リストに搭載
				childrenStack.push(idIndex);
			    }
			}else if(nextMoveIndexMap[idIndex]===undefined){
			    nextMoveIndexMap[idIndex]=tmpCursor;
			    corigionList[tmpCursor].push(idIndex);
			}
		}
console.log("convertMovedNewMap corigionList:"+corigionList.toSource()+"/childrenStack:"+childrenStack.toSource()+"/childrenList:"+childrenList.toSource());
		var stack=[];
		var usedMap ={};
		//var hasMovedIndex =0;
		//var max=MansikiMapUtil.getMaxIndex(me.tweetIdMap)*1;
		var isDoubled =false;
		var subject = undefined;
		var a = direct==="down"? 1 :direct==="up"? -1:0;
		//ここから下で子供の移動が考慮されていない。子供は親が確定したあとに連続で入れるべき。
		//バグ：上に子供が動いていない。
		var currentIdIndex =false;
		for(var targetCursor =0 ;targetCursor<= max;targetCursor++){
		    var thisIndexs = corigionList[targetCursor];
console.log("convertMovedNewMap thisIndexs.toSource():"+thisIndexs.toSource()+"/targetCurosor:"+targetCursor+"/childCount:"+childCount);
console.log("convertMovedNewMap stack:"+stack.toSource());
                    if(currentIdIndex===true){//競合先が解消している場合。
                        for(var n=0;n<repeatList.length ;n++){
                    		stack.push(repeatList[n]);
                    		if(direct==="down"){
				    for(var m = 0;m<childrenStack.length;m++){
					    stack.push(childrenStack[m]);
				    }
                    		}
                        }
                        currentIdIndex=false;
                    }
		    if(thisIndexs===undefined || thisIndexs.length <1 || childrenList[thisIndexs[0]]!==undefined){
			//子供はすっとばす。
			continue;
		    }else if(thisIndexs.length===1){
			stack.push(thisIndexs[0]);
		    }else if(direct==="down"){
			for(var j=0;j<thisIndexs.length ;j++){//ここは競合リストに限定
			    var currentIdIndex = thisIndexs[j];
			    if(remarkMap[currentIdIndex]===undefined){
				if(subject===undefined ){
				    subject = currentIdIndex;
				}
				stack.push(currentIdIndex);
			    }else{
				repeatList.push(currentIdIndex) ;//こっちに移動主体が入る
			    }
			}
			currentIdIndex=true;
		    }else if(direct==="up"){
			for(var j=0;j<thisIndexs.length ;j++){//ここは競合リストに限定
			    currentIdIndex = thisIndexs[j];
			    if(remarkMap[currentIdIndex]!==undefined){
				stack.push(currentIdIndex);//こっちに移動主体が入る
				    for(var m = 0;m<childrenStack.length;m++){
					    stack.push(childrenStack[m]);
				    }
			    }else{
				if(subject===undefined ){
				    subject = currentIdIndex;
				}
				repeatList.push(currentIdIndex) ;
			    }
			}
			currentIdIndex=true;
		    }
		}
console.log("stackA:"+stack.toSource()+"/repeatList:"+repeatList.toSource()+"/childrenList:"+childrenList.toSource()+"/currentIdIndex:"+currentIdIndex);
                if(currentIdIndex===true){//競合先が解消している場合。
                    
                    for(var n=0;n<repeatList.length ;n++){
                		stack.push(repeatList[n]);
                		if(direct==="down"){
				    for(var m = 0;m<childrenStack.length;m++){
					    stack.push(childrenStack[m]);
				    }
                		}
                    }
                    currentIdIndex=false;
                }else{
                    if(repeatList.length===0 && childCount > 0){
        		if(direct==="down"){
			    for(var m = 0;m<childrenStack.length;m++){
				    stack.push(childrenStack[m]);
			    }
        		}
                	
                    }
                }
console.log("stackB:"+stack.toSource()+"/corigionList:"+corigionList.toSource()+"/repeatList:"+repeatList.toSource()+"/remarkMap:"+remarkMap.toSource()+"/childrenList:"+childrenList.toSource());
		for(var targetCursor =0 ;targetCursor<= max;targetCursor++){
		    newMap[targetCursor]=stack[targetCursor];
		}
		me.tweetIdMap = newMap;
		return subject;//for delete//この選択がおかしい。
	},
	getUpperParentIndexId:function(me,subject){//ここのOffsetがおかしい。
		var max=MansikiMapUtil.getMaxIndex(me.tweetIdMap)*1;
		var func = me.tweetsFuncs[subject];
		var upperLevelIndexId  = undefined;
		var upperIndexId = undefined;
		for(var targetCursor =0 ;targetCursor<= max;targetCursor++){
		    	var tempSubject =  me.tweetIdMap[targetCursor];
		    	if(tempSubject===subject){//Empty through自分自身が来たらエンド
		    	    if(upperIndexId===undefined && upperLevelIndexId !== undefined ){
		    		upperIndexId = upperIndexId;
		    	    }
		    	    break;
		    	}
		    	var upperFunc = me.tweetsFuncs[tempSubject];
		    	if(upperFunc.level+1 === func.level){
		    	    upperLevelIndexId =tempSubject;
		    	}
		    	if(upperFunc.level === func.level ){//SameLevel
		    	    upperIndexId = tempSubject;
		    	}
		}
console.log("getUpperParentIndexId upperIndexId:"+upperIndexId+"");
	    return upperIndexId;//OK
	},
	rebuildAll:function(me){
		console.log("rebuildAll START");
		me.analizer.fullAnalize();
		var saveData = {};
		me.tweetsFuncsIds={};
		for(var idIndex in me.tweetsFuncs){
			var func = me.tweetsFuncs[idIndex];
			func.showState();
			me.tweetsFuncsIds[idIndex]=func.getFullId();
		}
		saveData.tweetIdCount = me.tweetIdCount;
		saveData.tweets = me.tweets;
		saveData.tweetIdMap = me.tweetIdMap;
		saveData.tweetsFuncsIds = me.tweetsFuncsIds;
		saveData.titleStates = me.analizer.titleStates;
		MansikiMapUtil.saveToLS(me.keyMain,saveData);
		console.log("rebuildAll END");
	},
	reloadAllTweets:function(){
		console.log("reloadAllTweets START"); 
		var max=MansikiMapUtil.getMaxIndex(this.tweetIdMap)*1;
		this.cursor=0;
		for(var i = 0;i<= max;i++){
			var idIndex = this.tweetIdMap[i];
			if(idIndex===undefined){
				continue;
			}
			var tweetBox = this.execBuildTweetBox(this,idIndex);
			this.doInsertTweet(this,tweetBox);
			this.cursor++;
			this.initViewCursorObj({data:{self:this,idIndex:this.tweetIdMap[this.cursor],offsetY:999}});
		}
		console.log("reloadAllTweets END"); 
	},
	initViewCursorObj:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var moveByKey = event.data.moveByKey;
		var offsetY = event.data.offsetY===undefined?0:event.data.offsetY;
		var scrolltop = $("body").scrollTop()*1;
		var topToSet = 0;
		var clientHeight = $("body").get(0).clientHeight;
		var height = 0;
		var offset = 20;
		if(moveByKey===true || me.state.selected !==undefined && idIndex===me.state.selected ){
			var target = me.getTweetBoxObj(me,idIndex);
			if(target.length<1){return;}
//console.log("aaaa  initViewCursorObj /id:"+id+"/target:"+target.length+"/me.cursor:"+me.cursor+"/clientHeight:"+clientHeight);
			var top = target.position().top;
			var left = target.position().left;
			height = target.css("height").replace("px","")*1;
			if(offsetY===999){
				//height=height;
				offsetY=-height;
			}
	//console.log("aaaa top:"+top+"/left:"+left+"/height:"+height+"/id:"+id+"/offsetY:"+offsetY);
			height+=(-height-offsetY);
			topToSet = (top*1+height);
			
			$("#svgAreaArrow").css("top",topToSet).css("left",left);
			me.cursor=MansikiMapUtil.getKey(me.tweetIdMap,idIndex);
			me.showCursor(me);
		}else{
		    return ;
		}
console.log("bbbb top:"+top+"/left:"+left+"/height:"+height+"/clientHeight:"+clientHeight+"/scrolltop:"+scrolltop+"/offsetY:"+offsetY
			+"/idIndex:"+idIndex+"/"+me.state.selected+"/topToSet:"+topToSet);
		if(topToSet < scrolltop){
		    scrolltop = topToSet-offset;
console.log("aaaaA1 scrolltop:"+scrolltop);
		}else if (topToSet > clientHeight+scrolltop-offset){
		    scrolltop = topToSet - clientHeight +offset + height;
console.log("aaaaA2 scrolltop:"+scrolltop);
		}else if(top!==undefined){
		    scrolltop = top - offset;
		}else{
		    //scrolltop = 0;
console.log("aaaaA3 scrolltop:"+scrolltop);
		}
		//alert("scrolltop:"+scrolltop);
console.log("aaaa top:"+top+"/left:"+left+"/height:"+height+"/clientHeight:"+clientHeight+"/scrolltop:"+scrolltop+"/offsetY:"+offsetY
	+"/idIndex:"+idIndex+"/"+me.state.selected);
		clearTimeout(me.timerScrollAtAll);
		me.timerScrollAtAll = setTimeout(function(){$("body").scrollTop(scrolltop);},32);
	},
	clearTweet:function(event){
		var me= event.data.self;
		for(var cursor in me.tweetIdMap){
			me.getTweetBoxObj(me,me.tweetIdMap[cursor]).css("box-shadow","0px");
		}
		if(me.state.selected !==undefined)me.state.lastSelected = me.state.selected ;
		me.state.selected = undefined;
		me.bredgeArea.val("");
		me.funcs.clearTweet();
		$("#TMTweetMode").text(me.constMap.modAdd);
		me.initViewCursorObj({data:{self:me,idIndex:me.tweetIdMap[me.cursor],offsetY:20}});
		me.MansikiTweetStyleKeyBind.buidCmdAreaInput();
	},
	showCursor:function(me){
		$("#TMCursor").text(me.cursor*1+1);
		var idIndex = me.tweetIdMap[me.cursor];
		var func = me.tweetsFuncs[idIndex];
		if(func!==undefined){
			$("#TMTweetType").text(func.nameLc+"/L:"+func.level);
			$("#TMTweetType").css("background-color",func.color);

			me.cmdButtonsHilight({data:{self:me,id:func.getFullId(),level:func.level}});
		}else{
			$("#TMTweetType").text("");
			$("#TMTweetType").css("background-color","transparent");
		}
	},
	showCmdBox:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var id = me.constMap.tweetIdPrefix+idIndex;
		var target = me.getTweetBoxObj(me,idIndex).find(".tweetBoxCmdFrame").eq(0).find(".tweetBoxCmd").eq(0);
		target.css("visibility","visible");
		if(me.state.selected===idIndex){
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
		}else{
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:20}});
		}
		return false;
	},
	hideCmdBox:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var target = me.getTweetBoxObj(me,idIndex).find(".tweetBoxCmdFrame").eq(0).find(".tweetBoxCmd").eq(0);
		target.css("visibility","hidden");
		if(me.state.selected===idIndex){
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
		}else{
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:20}});
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
		//alert("doScroll");
	},
	buildTweetBox:function(event){
		var me= event.data.self;
		var text= event.data.text;
		var prop = event.data.prop;
		var idIndex= event.data.idIndex;
		me.tweetIdMap = MansikiMapUtil.after(me.tweetIdMap,me.cursor,idIndex);
		me.tweets[idIndex]={text:text,prop:prop};
		me.buildFuncs(me,idIndex);
		return me.execBuildTweetBox(me,idIndex);
	},
	execBuildTweetBox:function(me,idIndex){
//console.log("execBuildTweetBox idIndex:"+idIndex+"/me.tweets:"+me.tweets.toSource()+"/me.tweetIdMap:"+me.tweetIdMap.toSource()+"/text:"+me.tweets[idIndex]);
		var tweet = me.tweets[idIndex];
		var text = tweet.text;
		var prop = tweet.prop;
		var id=me.constMap.tweetIdPrefix+idIndex;
		var tweetBox=$("<div id='"+id+"'class='TMtweetBox' index='"+idIndex+"'>"+"</div>");
		var tweetBoxButtonsFrame = $("<div class='tweetBoxCmdFrame'></div>");
		var tweetBoxButtons = $("<div class='tweetBoxCmd'></div>");
		var twbButtonDel= $("<div class='tweetBoxCmdButton'>☓</div>");
		var twbButtonMoveUp= $("<div class='tweetBoxCmdButton'>▲</div>");
		var twbButtonMoveDown= $("<div class='tweetBoxCmdButton'>▼</div>");
		var twbButtonUnite= $("<div class='tweetBoxCmdButton'>＋</div>");
		var twbConteinerFlame= $("<div class='twbConteinerFlame'></div>");
		var twbSideBar= $("<div class='tweetBoxSideBar'></div>");
		var twbConteiner= $("<div class='tweetBoxConteiner'></div>");
		var tweetBoxInfo = $("<div class='tweetBoxInfo'>infoinfo</div>");
		var tweetBoxInfoCover = $("<div class='tweetBoxInfoCover'></div>");
		var tweetBoxtext = $("<div class='tweetBoxText'>"+MansikiMapUtil.getFormatedTextCRLF(text)+"</div>");
		var tweetBoxSlot= $("<div class='tweetSlot'></div>");
		tweetBoxButtonsFrame.append(tweetBoxButtons);
		tweetBox.append(twbSideBar);
		tweetBox.append(twbConteinerFlame);
		twbConteinerFlame.append(tweetBoxButtonsFrame);
		twbConteiner.append(tweetBoxInfo);
		twbConteiner.append(tweetBoxInfoCover);
		twbConteiner.append(tweetBoxtext);
		twbConteinerFlame.append(twbConteiner);
		twbConteinerFlame.append(tweetBoxSlot);
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
			func.initBindEventToTweetBox(tweetBox);
		}
		func.addIndentClass(tweetBox);
		return tweetBox;
	},
	setInfo:function(me,idIndex,info){
		var tweetBox = me.getTweetBoxObj(me,idIndex);
		me.getTweetBoxInfo(tweetBox).html(info);
	},
	getTweetBoxInfo:function(tweetBox){
		return tweetBox.find("div.tweetBoxConteiner").eq(0).find("div.tweetBoxInfo").eq(0);
	},
	getTweetBoxInfoCover:function(tweetBox){
		return tweetBox.find("div.tweetBoxConteiner").eq(0).find("div.tweetBoxInfoCover").eq(0);
	},
	addText:function(me,idIndex,addtionalText){
		var tweetBox = me.getTweetBoxObj(me,idIndex);
		var textBox = tweetBox.find("div.tweetBoxConteiner").eq(0).find("div.tweetBoxText").eq(0);
		textBox.html(MansikiMapUtil.getFormatedTextCRLF(me.tweets[idIndex].text)+addtionalText);
	},
	getTweetBoxObj:function(me,idIndex){
		var id=me.constMap.tweetIdPrefix+idIndex;
		return $("#"+id);
	},
	getTweetBoxObjByCursor:function(me,cursor){
		var idIndex = me.tweetIdMap[cursor];
		var id=me.constMap.tweetIdPrefix+idIndex;
		return $("#"+id);
	},
	getViewList:function(){
		return this.viewList;
	},
	getIdIndexByCousor:function(cursor){
		return this.tweetIdMap[cursor];
	},
	getCurrentIdIndexByCousor:function(){
		return this.getIdIndexByCousor(this.cursor);
	}
}



































