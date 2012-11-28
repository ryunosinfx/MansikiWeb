const LF = "\n";
const FLAG_ON = 1;
const FLAG_OFF= 0;
//---------------------------------------------
const SUBTITEL = "subtitle";
const NONBLE = "Nonble";
const PAGE = "Page";
const KOMA = "Koma";
const FUKIDASHI = "Fukidashi";
const SETTING = "Setting";
const NALATION = "Nalation";
const OBJECT = "Object";
const BACKGROUND = "Background";
const SOUND = "Sound";
const EFFECT = "Effect";
const QUOTE = "Quote";
const SEAN = "Sean";
const ACTOR = "Actor";
const FUKUSEN = "Fukusen";
//---------------------------------------------
//ナレーション、欄外、注釈、シーン（場所）、登場オブジェクト、状況、指示、設定、効果音、効果、伏線
//DeclareButton,ObjectButton,BackgroundButton,SoundButton,EffectButton,NalationButton,QuoteButton,SeanButton
const DEL = "delete";
const UPD = "update";
const INS = "insert";
const SUFFIX = "p1";
const ADD = "add";
const KEY = "key";
const SUPER = "super";
const SUPERCOUNT = "superCount";
const BY_SUPER_SUM = "bySuperSum";
const PRIMARY = "primary";
const UNDERBAR = "_";


var MansikiModeConst={
	page:{color:"#3C3C50"}
	,koma:{color:"#3C3C50"}

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
	this.analizer= new MansikiTweetStateAnaliser(this);
}
MansikiTweetStyleEditor.prototype={
	init:function(){
		$("#LSclear").bind('click',MansikiMapUtil.clearLS);
		this.tweetHideTextarea = $("#TWtweetHideTextarea");
		this.field = $("form").eq(0);
		this.viewList = $("#TMtweetList");
		this.bredgeArea= $("#TMtweetInput");
		this.addButton= $("#TMadd");
		this.clearButton= $("#TMclear");
		this.twCmdAreaUpper = $("#TWcmdAreaUpper");
		this.twCmdAreaUnder = $("#TWcmdAreaUnder");
		this.initBinds(this);
		this.showCursor(this);
		this.initAndLoadLS();
		this.onScroll({data:{self:this}});
		this.onFocusToCmd({data:{self:this}});
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
		}
	},
	initBinds:function(me){
		me.addButton.bind("click",{self:me},me.addTweet);
		me.clearButton.bind("click",{self:me},me.clearTweet);
		$("#TMTweetMode").text(me.constMap.modCursor);
		me.MansikiTweetStyleKeyBind.setKeyEventField(me.tweetHideTextarea);
		$("body").bind("mousemove",{self:me},me.onFocusToCmd);
		me.cmdButtonsHilightInit();
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
//alert(button.length+"/i:"+0+"/id:"+id+"/"+button.css("background-color"));
		var buttonState = {};
		this.cmdButtonsState[id] = buttonState;
		buttonState["border"]=button.css("border");
		buttonState["color"]=button.css("color");
		button.bind("click",{self:this,id:id},this.cmdButtonsHilight);
		var func = this.funcs.getFunc(id);
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
		var bottons = $(".commands>div");
		for(var i=0;i<bottons.length;i++){
			var button = bottons.eq(i);
			id= button.attr("id");
			var buttonState = me.cmdButtonsState[id] ;
			button.css("border",buttonState["border"]).css("color",buttonState["color"]).css("background-color",buttonState["background-color"]);
			button.css("font-weight","nomal");
		}
		var id= event.data.id;
		var buttonState = me.cmdButtonsState[id];
		//alert("id:"+id);
		$("#"+id).css("border-color",buttonState["background-color"]);
		$("#"+id).css("color","black");
		$("#"+id).css("font-weight","bold");
		me.twCmdAreaUpper.css("background-color",buttonState["background-color"]);
		me.twCmdAreaUnder.css("background-color",buttonState["background-color"]);
		me.currentFuncId =id;
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
			me.state.selected=undefined;
			for(var cursor in me.tweetIdMap){
				var tmpId = me.constMap.tweetIdPrefix+me.tweetIdMap[cursor];
				$("#"+tmpId).removeClass("TwselectedBox");
			}
			this.MansikiTweetStyleKeyBind.buidCmdAreaMain();
		}
	},
	//--------------------------------------------------------------------
	//--------------------------------------------------------------------
	buildFuncs:function(me,idIndex,funcId){
		funcId =funcId===undefined?me.currentFuncId:funcId;
console.log("buildFuncs funcId:"+funcId+"/"+me.funcs.getFunc(funcId)+"/"+me.MansikiTweetStyleKeyBind);
		var func = me.funcs.getFunc(funcId).create(idIndex,me.MansikiTweetStyleKeyBind);
		func.text=me.tweets[idIndex];
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
		this.initViewCursorObj({data:{self:this,idIndex:this.tweetIdMap[this.cursor],offsetY:0}});
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
		this.initViewCursorObj({data:{self:this,idIndex:this.tweetIdMap[this.cursor],offsetY:0}});
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
//console.log("addTweet idIndex:"+event.data.idIndex+"/me.cursor:"+me.cursor+"/me.tweetIdMap:"+me.tweetIdMap.toSource());
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
		this.MansikiTweetStyleKeyBind.buidCmdAreaInput();
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
			var idIndex=me.tweetIdMap[me.cursor];
			var func = me.tweetsFuncs[idIndex];
			var preIdIndex=me.tweetIdMap[me.cursor-1];
			var preFunc = me.tweetsFuncs[preIdIndex];
			var preId=me.constMap.tweetIdPrefix+preIdIndex;
			if(preFunc.level === func.level){
				$("#"+preId).after(tweetBox);
			}else if(preFunc.level <func.level){
				var slot = $("#"+preId).children("div.tweetSlot").eq(0);
				//alert(slot.length);
				slot.prepend(tweetBox);
			}else if( preFunc.level === func.level+1){
				$("#"+preId).parent().parent().after(tweetBox);
			}else if(preFunc.level === func.level+2){
				$("#"+preId).parent().parent().parent().parent().after(tweetBox);
			}else if(preFunc.level === func.level+3){
				$("#"+preId).parent().parent().parent().parent().parent().parent().parent().after(tweetBox);
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
		var text= me.tweets[idIndex];
		var func = me.tweetsFuncs[idIndex];
		me.bredgeArea.val(text);
		me.funcs.loadTweet();
		me.cmdButtonsHilight({data:{self:me,id:func.getFullId()}});
		me.state.selected = idIndex;
		$("#TMTweetMode").text(me.constMap.modUpdate);
		me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
		me.MansikiTweetStyleKeyBind.buidCmdAreaInput();
	},
	updateTweet:function(event){
		var me = event.data.self;
		var text= event.data.text;
		var idIndex = event.data.idIndex;
		me.tweets[idIndex] =text;
		var isTweetBoxUpdated = me.updateFuncs(me,idIndex);
		var tweetBox=me.getTweetBoxObj(me,idIndex);
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
		me.getTweetBoxObj(me,idIndex).parent().children("#"+id).eq(0).remove();
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
		    offset= downerTarget>0 ? downerTarget - childCount - cursor:1;
		}
console.log("moveTweet offset:"+offset);
		if(offset===0){
		    return ;
		}
		me.moveExecute(me,idIndex,cursor,offset,direct,func.level,childCount);
		
	},
	moveExecute:function(me,idIndex,cursor,offset,direct,level,childCount){
console.log("moveExecute oldMap:"+me.tweetIdMap.toSource());
	    var slotDomObjIndex=2;
	    	var subject = this.convertMovedNewMap(me,idIndex,cursor,offset,direct,level,childCount);
console.log("moveExecute newMap:"+me.tweetIdMap.toSource()+"/subject:"+subject);
		var oldMap = me.tweetIdMap;
		var id = me.constMap.tweetIdPrefix+idIndex;
		var max=MansikiMapUtil.getMaxIndex(me.tweetIdMap)*1;
console.log("moveTweet idIndex:"+idIndex+"/subject:"+subject+"/direct:"+direct+"/cursor:"+cursor+"/offset:"+offset+"/oldMap:"+oldMap.toSource());
		if(subject !== undefined){

		    	var targetFunc = me.tweetsFuncs[idIndex];
		    	var subFunc = me.tweetsFuncs[subject];
			var subjectId = me.constMap.tweetIdPrefix+subject;
			var subObj = document.getElementById(subjectId);
			var subParent = subObj.parentNode;
			var subParentId = subParent.id;
			me.cursor=cursor+offset;
			var target = document.getElementById(id);
			var parent = target.parentNode;
			var parentId = parent.id;
			var targetCursor=MansikiMapUtil.getKey(me.tweetIdMap,idIndex);
			if(parent.id===""){
			    parentId = parent.parentNode.id;
			}
			if(subParent.id===""){
			    subParentId = subParent.parentNode.id;
			}
console.log("moveTweetA idIndex:"+idIndex+"/"+subject+"/subject:"+subParentId+"/"+subParent.id+"/parent.id:"+parentId+"/"+parent.id);
    			if(subParentId!=="" && subParentId===parentId){
        			var after = null;
        			var afterAfter = null;
        			var before = null;
        			var targetOrverd = false;
        			var count =0;
        			for(var childIndex in parent.childNodes){
        			    var child = parent.childNodes[childIndex];
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
        			    parent.insertBefore(target,before);
        			}else if(direct==="down"){
        			    console.log(afterAfter+"/"+(afterAfter===null));
        			    if((afterAfter===null)=="true"){
            			    	parent.appendChild(target);
        			    }else{
            			    	//parent.appendChild(target);
            			    	parent.insertBefore(target,afterAfter);
        			    }
        			}
			}else{//非対称の場合に限る,しかも越境に限るAfterは必ず上位
console.log("moveTweetVVVVVS "+id+"/"+parentId+"/"+parent.getAttribute("class")+"/"+parent.childNodes+"/b:"+before+"/z"+(target.id)+"/af:"+(after===undefined||after===null?"null":after.id)
					 +"/afaf:"+(afterAfter===undefined||afterAfter===null?"null":afterAfter.id)+"/"+(afterAfter===null)+"/x "+direct);

				if(direct==="up"){
				    //alert("upup");
        			    var upperParentIndexId = me.getUpperParentIndexId(me,idIndex);//これが取ってくる者は何？ない場合もありうる。
        			    if(upperParentIndexId===undefined){
        				
        			    }
        			    var upperParentId = me.constMap.tweetIdPrefix+upperParentIndexId;
				    var upperFunc = me.tweetsFuncs[upperParentIndexId];
        			    var upperParentObj = document.getElementById(upperParentId);
        			    if(targetFunc.level===upperFunc.level){
        				var slot = upperParentObj.parent;//ここの認識がおかしい。
        				slot.appendChild(target);
        			    }else{
        				var slot = upperParentObj.childNodes[slotDomObjIndex];
        				slot.appendChild(target);
        			    }
        			}else if(direct==="down"){//ここの計算が狂っている、ここに来る時点でソートは終了している。
        			    var afterIdIndex = max<=targetCursor*1+1?null:me.tweetIdMap[(targetCursor*1+1)];//一個手前を取得
console.log("moveTweetVVVVVX afterIdIndex:"+afterIdIndex+"/max:"+max+"/targetCursor"+targetCursor);
        			    
        			    if(afterIdIndex!==null){
    					    	var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
        					var afterAfter = document.getElementById(afterId);
        				    	var afterFunc = me.tweetsFuncs[afterIdIndex];
console.log("moveTweetVVVVVY afterAfter:"+afterAfter+"/afterFunc:"+afterFunc+"/afterId"+afterId+"/target:"+target+"/afterFunc.level:"+afterFunc.level);	
        					if(targetFunc.level<=afterFunc.level){//slotの位置のよる,<はありえないはず
        					    var parent = afterAfter.parentNode;
        					    parent.insertBefore(target,afterAfter);
        					}else{//上位の場合は配置転換は終わっているので、一個上のものを取得
            	        			    var afterIdIndex = max===targetCursor*1+1?null:me.tweetIdMap[(targetCursor*1-1)];
        					    var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
            					    var afterAfter = document.getElementById(afterId);
console.log("moveTweetVVVVVW afterAfter:"+afterAfter+"/afterFunc:"+afterFunc+"/afterId"+afterId);	
        					    afterAfter.childNodes[slotDomObjIndex].appendChild(target);
        					}
    					}else if(max===targetCursor*1){//配置転換は終わっているので、一個上のものを取得
    	        			    var afterIdIndex = max===targetCursor*1+1?null:me.tweetIdMap[(targetCursor*1-1)];
					    var afterId = me.constMap.tweetIdPrefix+afterIdIndex;
    					    var afterAfter = document.getElementById(afterId);
console.log("moveTweetVVVVVZ afterAfter:"+afterAfter+"/afterFunc:"+afterFunc+"/afterId"+afterId);	
					    afterAfter.childNodes[slotDomObjIndex].appendChild(target);
    					}
        			}
			}
		}
		me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
		me.rebuildAll(me);
	},
	convertMovedNewMap:function(me,idIndex,currentCursor,offset,direct,level,childCount){
		var id = me.constMap.tweetIdPrefix+idIndex;
		var oldMap = me.tweetIdMap;
		var newMap = {};
		var nextMoveIndexMap ={};
		var corigionList =[];
		var remarkMap ={};
		var remarkList =[];
		var repeatList=[];
		var max=MansikiMapUtil.getMaxIndex(me.tweetIdMap)*1;
		for(var tmpCursor=0;tmpCursor <= max;tmpCursor++ ){
		    corigionList.push([]) ;
		}
		for(var tmpCursor=0;tmpCursor <= max;tmpCursor++ ){
		    
			var idIndex = oldMap[tmpCursor];
			if(idIndex===undefined){
			    continue;
			}
			if(tmpCursor === currentCursor){
			    for(var i = 0;i<=childCount ;i++){
				idIndex = oldMap[tmpCursor+i];
				var targetCurosor = tmpCursor+offset+i;
				if(targetCurosor < 0){
				    targetCurosor =0;
				}
				if(targetCurosor > max){
				    targetCurosor =max;
				}
				corigionList[targetCurosor].push(idIndex);
				nextMoveIndexMap[idIndex]=tmpCursor+offset+i;
				remarkMap[idIndex] =true;
				remarkList.push(idIndex);
			    }
			}else if(nextMoveIndexMap[idIndex]===undefined){
			    nextMoveIndexMap[idIndex]=tmpCursor;
			    corigionList[tmpCursor].push(idIndex);
			}
		}
		var stack=[];
		var usedMap ={};
		//var hasMovedIndex =0;
		//var max=MansikiMapUtil.getMaxIndex(me.tweetIdMap)*1;
		var isDoubled =false;
		var subject = undefined;
		var a = direct==="down"? 1 :direct==="up"? -1:0;
		for(var targetCursor =0 ;targetCursor<= max;targetCursor++){
		    var thisIndexs = corigionList[targetCursor];
//console.log("thisIndexs.toSource():"+thisIndexs.toSource()+"/targetCurosor:"+targetCursor);
                    if(currentIdIndex===true){
                        for(var n=0;n<repeatList.length ;n++){
                    		stack.push(repeatList[n]);
                        }
                        currentIdIndex=false;
                    }
		    if(thisIndexs===undefined || thisIndexs.length <1){
			continue;
		    }else if(thisIndexs.length===1){
			stack.push(thisIndexs[0]);
		    }else if(direct==="down"){
			for(var j=0;j<thisIndexs.length ;j++){
			    var currentIdIndex = thisIndexs[j];
			    if(remarkMap[currentIdIndex]===undefined){
				if(subject===undefined ){
				    subject = currentIdIndex;
				}
				stack.push(currentIdIndex);
			    }else{
				repeatList.push(currentIdIndex) ;
			    }
			}
			currentIdIndex=true;
		    }else if(direct==="up"){
			for(var j=0;j<thisIndexs.length ;j++){
			    var currentIdIndex = thisIndexs[j];
			    if(remarkMap[currentIdIndex]!==undefined){
				stack.push(currentIdIndex);
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
		if(currentIdIndex===true){
		    for(var n=0;n<repeatList.length ;n++){
			stack.push(repeatList[n]);
		    }
		}
console.log("stack.toSource():"+stack.toSource()+"/corigionList:"+corigionList.toSource()+"/repeatList:"+repeatList.toSource()+"/remarkMap:"+remarkMap.toSource());
		for(var targetCursor =0 ;targetCursor<= max;targetCursor++){
		    newMap[targetCursor]=stack[targetCursor];
		}
		me.tweetIdMap = newMap;
		return subject;//for delete//この選択がおかしい。
	},
	getUpperParentIndexId:function(me,subject){
		var max=MansikiMapUtil.getMaxIndex(me.tweetIdMap)*1;
		var func = me.tweetsFuncs[subject];
		var upperIndexId = undefined;
		for(var targetCursor =0 ;targetCursor<= max;targetCursor++){
		    	var tempSubject =  me.tweetIdMap[targetCursor];
		    	if(tempSubject===subject){//Empty through
		    	    break;
		    	}
		    	var upperFunc = me.tweetsFuncs[tempSubject];
		    	if(upperFunc.level === func.level || upperFunc.level+1 === func.level){//SameLevel
		    	    upperIndexId = tempSubject;
		    	}
		}
console.log("getUpperParentIndexId upperIndexId:"+upperIndexId+"");
	    return upperIndexId;//OK
	},
	rebuildAll:function(me){
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
		
	},
	reloadAllTweets:function(){
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
	},
	initViewCursorObj:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var offsetY = event.data.offsetY===undefined?0:event.data.offsetY;
		var scrolltop = $("body").scrollTop()*1;
		var topToSet = 0;
		var clientHeight = $("body").get(0).clientHeight;
		var height = 0;
		if(me.state.selected ===undefined || idIndex===me.state.selected ){
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
		}
		if(topToSet < scrolltop){
		    scrolltop = topToSet-20;
		}else if (topToSet > clientHeight+scrolltop-20){
		    scrolltop = topToSet - clientHeight +20 + height;
		}
		$("body").scrollTop(scrolltop);
	},
	clearTweet:function(event){
		var me= event.data.self;
		for(var cursor in me.tweetIdMap){
			me.getTweetBoxObj(me,me.tweetIdMap[cursor]).css("box-shadow","0px");
		}
		me.state.selected = undefined;
		me.bredgeArea.val("");
		me.funcs.clearTweet();
		$("#TMTweetMode").text(me.constMap.modAdd);
		me.initViewCursorObj({data:{self:me,idIndex:me.tweetIdMap[me.cursor],offsetY:20}});
		me.MansikiTweetStyleKeyBind.buidCmdAreaInput();
	},
	showCursor:function(me){
		$("#TMCursor").text(me.cursor*1+1);
	},
	showCmdBox:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var id = me.constMap.tweetIdPrefix+idIndex;
		var target = me.getTweetBoxObj(me,idIndex).children(".tweetBoxCmdFrame").eq(0).children(".tweetBoxCmd").eq(0);
		target.css("visibility","visible");
		if(me.state.selected===idIndex){
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:0}});
		}else{
			me.initViewCursorObj({data:{self:me,idIndex:idIndex,offsetY:20}});
		}
	},
	hideCmdBox:function(event){
		var me= event.data.self;
		var idIndex = event.data.idIndex;
		var target = me.getTweetBoxObj(me,idIndex).children(".tweetBoxCmdFrame").eq(0).children(".tweetBoxCmd").eq(0);
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
//console.log("execBuildTweetBox idIndex:"+idIndex+"/me.tweets:"+me.tweets.toSource()+"/me.tweetIdMap:"+me.tweetIdMap.toSource()+"/text:"+me.tweets[idIndex]);
		var text = me.tweets[idIndex];
		var id=me.constMap.tweetIdPrefix+idIndex;
		var tweetBox=$("<div id='"+id+"'class='TMtweetBox' index='"+idIndex+"'>"+"</div>");
		var tweetBoxButtonsFrame = $("<div class='tweetBoxCmdFrame'></div>");
		var tweetBoxButtons = $("<div class='tweetBoxCmd'></div>");
		var twbButtonDel= $("<div class='tweetBoxCmdButton'>☓</div>");
		var twbButtonMoveUp= $("<div class='tweetBoxCmdButton'>▲</div>");
		var twbButtonMoveDown= $("<div class='tweetBoxCmdButton'>▼</div>");
		var twbButtonUnite= $("<div class='tweetBoxCmdButton'>＋</div>");
		var twbConteiner= $("<div class='tweetBoxConteiner'></div>");
		var tweetBoxInfo = $("<div class='tweetBoxInfo'>infoinfo</div>");
		var tweetBoxInfoCover = $("<div class='tweetBoxInfoCover'></div>");
		var tweetBoxtext = $("<div class='tweetBoxText'>"+MansikiMapUtil.getFormatedTextCRLF(text)+"</div>");
		var tweetBoxSlot= $("<div class='tweetSlot'></div>");
		tweetBoxButtonsFrame.append(tweetBoxButtons);
		tweetBox.append(tweetBoxButtonsFrame);
		twbConteiner.append(tweetBoxInfo);
		twbConteiner.append(tweetBoxInfoCover);
		twbConteiner.append(tweetBoxtext);
		tweetBox.append(twbConteiner);
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
		return tweetBox.children("div.tweetBoxConteiner").eq(0).children("div.tweetBoxInfo").eq(0);
	},
	getTweetBoxInfoCover:function(tweetBox){
		return tweetBox.children("div.tweetBoxConteiner").eq(0).children("div.tweetBoxInfoCover").eq(0);
	},
	addText:function(me,idIndex,addtionalText){
		var tweetBox = me.getTweetBoxObj(me,idIndex);
		var textBox = tweetBox.children("div.tweetBoxConteiner").eq(0).children("div.tweetBoxText").eq(0);
		textBox.html(MansikiMapUtil.getFormatedTextCRLF(me.tweets[idIndex])+addtionalText);
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
//console.log("after index:"+index+"/value:"+value);
		for(var tmpCursor in oldMap){
			var offset = 0;
//console.log("after index:"+index+"/tmpCursor:"+tmpCursor);
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
		var targetIndex = undefined;
		for(var tmpCursor in oldMap){
			var tmpVal = oldMap [tmpCursor];
			if(value*1===tmpVal*1){
				targetIndex = tmpCursor*1;
				break;
			}
		}
//console.log("del targetIndex:"+targetIndex);
		for(var tmpCursor in oldMap){
			var newIndex = tmpCursor*1;
			var tmpVal = oldMap [newIndex];
//console.log("del tmpCursor:"+newIndex+":"+tmpVal+"/targetIndex:"+targetIndex);
			if(targetIndex*1 === newIndex*1 ){
			    //skip
			}else if(targetIndex*1 < newIndex && newIndex>0){
				newMap[(newIndex-1)] =tmpVal;
			}else if(targetIndex !== newIndex){
				newMap[(newIndex)] = tmpVal;
			}
		}
//console.log("newMap:"+newMap.toSource());
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
			max=max<i*1?i*1:max;
		}
		return max;
	}
	,getCount:function(map){
		var count =0;
		for(var i in map){
			count++;
			i++;
		}
		return ++count;
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
		return text===undefined ?"":text.replace(/(\r|\n|\r\n)/g, "<br />");
	},
	deepCopyMap:function(originMap){
		var copyMap ={};
		var json = JSON.stringify(originMap);
		copyMap = JSON.parse(json);
		return copyMap;
	},
	saveToLS:function(key ,target){
		var value = JSON.stringify(target);
		localStorage.setItem(key,value);
	},
	loadFromLS:function(key){
		var joinStr = localStorage.getItem(key);
		return JSON.parse(joinStr);
	},
	removeFromLS:function(key){
		localStorage.removeItem(key);
	},
	clearLS:function(){
		localStorage.clear();
	}
}

var ManikiFunctions=function(editor,idIndex,keyBindFunc){
	this.editor = editor;
	this.frame="";
	this.nameLc="日本語名";
	this.nameEn="EnglishName";
	this.idIndex=idIndex;
	this.color="#35FFDA";
	this.idPrefix ="add";
	this.idSufix ="Icon";
	this.text="";
	this.level = 0;
	this.Funcs={};
	this.inputArea = $("#TMinputArea");
	this.tweetArea = $("#TMtweetTextarea");
	this.bridgeArea = $("#TMtweetInput");
	this.level=1;
	this.indentClassPrefix="indent";
	this.infoMap={};
	this.addInfo="";
	this.isFormFocusd=false;
	this.keyBindFunc = keyBindFunc;
console.log("ManikiFunctions:keyBindFunc:"+keyBindFunc);
	this.init();
}

ManikiFunctions.prototype={
	add2Funcs:function(func){
		this.Funcs[this.idPrefix+func.Id+this.idSufix]=func;
	},
	getFunc:function(id){
		if(this.Funcs[id]===undefined){
		    var fullId = this.idPrefix+id+this.idSufix
			if(this.Funcs[fullId]===undefined){
			    return ;
			}
		    return this.Funcs[fullId];
		}
//console.log("getFunc keyBindFuncLocal:"+this.keyBindFunc);
		return this.Funcs[id];
	},
	init:function(){
		this.tweetArea.unbind("focus");
		this.tweetArea.unbind("blur");
		this.tweetArea.bind("focus",{self:this},this.onFocus);
		this.tweetArea.bind("blur",{self:this},this.onBlur);
	},
	isFocusOnForm:function(){
		return this.isFormFocusd;
	},
	create:function(idIndex,keyBindFunc){
		this.keyBindFunc = this.keyBindFunc===undefined?this.editor.MansikiTweetStyleKeyBind:this.keyBindFunc;
		var keyBindFuncLocal = keyBindFunc===undefined?this.keyBindFunc:keyBindFunc;
console.log("create keyBindFuncLocal:"+keyBindFuncLocal);
		return new ManikiFunctions(this.editor,idIndex,keyBindFuncLocal);
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
	onFocus:function(event){
		var me= event.data.self;
		me.isFormFocusd=true;
		me.keyBindFunc.bindActionToInputForm(me.tweetArea);
	},
	onBlur:function(event){
		var me= event.data.self;
		me.isFormFocusd=false;
		me.keyBindFunc.unbindActionToInputForm(me.tweetArea);
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
	},
	showStateExec:function(){
		var state=this.editor.analizer.state;
		var currentState = state[this.idIndex];
		var info= this.nameLc+this.addInfo;
		if(currentState!==undefined){
			var count = currentState.rowStat[this.Id];
			info+="<div>"+count+"</div>";
		}
		this.editor.setInfo(this.editor, this.idIndex,info);
		this.editor.addText(this.editor, this.idIndex,"");//state[this.idIndex].toSource());
//console.log("state.toSource():"+state[this.idIndex].toSource()+"/this.Id:"+this.Id);
	},
	showState:function(){
	    this.showStateExec();
	    this.showStatePost();
	},
	showStatePost:function(){
	},
	getUpperMovableCursor:function(){
		var state=this.editor.analizer.state;
		var editor = this.editor;
		var currentState = state[this.idIndex];
console.log("getUpperMovableCursor this.idIndex:"+this.idIndex+"/currentState"+state.toSource());
		if(currentState!==undefined){
			var max=MansikiMapUtil.getMaxIndex(editor.tweetIdMap)*1;
			var cursor=-1;
			var beMovable = false;
			var FuncLevels=[];
			for(var i = 0;i<= max;i++){
				var idIndexTmp = editor.tweetIdMap[i];
				var funcA = editor.tweetsFuncs[idIndexTmp];
			    FuncLevels.push(idIndexTmp+":"+funcA.idIndex+":"+funcA.level);
			}
console.log("DgetUpperMovableCursor beMovable:"+beMovable+"/max:"+max+"/editor.tweetsFuncs:"+FuncLevels.toSource());
			for(var i = 0;i<= max;i++){
				var idIndexTmp = editor.tweetIdMap[i];
console.log("EgetUpperMovableCursor beMovable:"+beMovable+"/this.idIndex:"+this.idIndex+"/idIndexTmp:"+idIndexTmp+"/i:"+i);
				if(idIndexTmp===undefined){
					continue;
				}
				if(idIndexTmp*1 === this.idIndex*1){
				    if(beMovable===false || cursor ===-1){
					cursor=i;
				    }
				    break;
				}
				var func = editor.tweetsFuncs[idIndexTmp];

console.log("FgetUpperMovableCursor beMovable:"+beMovable+"/cursor:"+cursor+"/func.level:"+func.level+"/this.level:"+this.level+"/idIndexTmp:"+idIndexTmp);
				if((this.level*1 ===1 ||beMovable === true )
				&& (func.level*1 ===this.level*1 || func.level*1+1 ===this.level*1)){
					console.log("AgetUpperMovableCursor beMovable:"+beMovable+"/cursor:"+cursor);
				    cursor=i;
				}
				if(func.level*1 ===1 || func.level*1 === this.level*1+1){
					console.log("BgetUpperMovableCursor beMovable:"+beMovable);
				    beMovable=true;
				}
			}
			console.log("CgetUpperMovableCursor beMovable:"+beMovable);
			console.log("getUpperMovableCursor cursor:"+cursor);
			return cursor;
		}
		console.log("getUpperMovableCursor  0 cursor:"+0);
	    return 0;
	},
	getDownerMovableCursor:function(){
		var state=this.editor.analizer.state;
		var editor = this.editor;
		var currentState = state[this.idIndex];
console.log("getUpperMovableCursor  this.idIndex:"+this.idIndex+"/currentState"+state.toSource());
		if(currentState!==undefined){
			var max=MansikiMapUtil.getMaxIndex(editor.tweetIdMap)*1;
			var cursor=max+1;
			for(var i = max;i>0;i--){
				var idIndexTmp = editor.tweetIdMap[i];
				if(idIndexTmp===undefined){
					continue;
				}
				if(idIndexTmp*1 === this.idIndex*1){
				    if(cursor ===max + 1){
					cursor=i;
				    }
				    break;
				}
				var func = editor.tweetsFuncs[idIndexTmp];
console.log("getDownerMovableCursor idIndexTmp:"+idIndexTmp+"/this.idIndex:"+this.idIndex+"/i:"+i+"/func.level :"+func.level +"/this.level:"+this.level);
				if(func.level*1+1 === this.level*1 || func.level*1 === this.level*1){
				    cursor=i;
				}
			}
console.log("getDownerMovableCursor max:"+max+" cursor:"+cursor+"/editor.tweetIdMap:"+editor.tweetIdMap.toSource());
			return cursor;
		}
console.log("getDownerMovableCursor  0 cursor:"+0);
	    return 0;
	},
	getChildCount :function(){
		var editor = this.editor;
		var max=MansikiMapUtil.getMaxIndex(editor.tweetIdMap)*1;
		var cursor=max+1;
		var childCount = 0;
		for(var i = max;i>0;i--){
			var idIndexTmp = editor.tweetIdMap[i];
			if(idIndexTmp===undefined){
				continue;
			}
			if(idIndexTmp*1 === this.idIndex*1){
			    break;
			}
			var func = editor.tweetsFuncs[idIndexTmp];
			if(func.level > this.level*1){
			    childCount++;
			}else{
			    childCount=0;
			}
		}
		return childCount;
	    
	},
	initBindEventToTweetBox:function(tweetBox){
		tweetBox.css("background-color",this.color);
		var infoBoxCover = this.editor.getTweetBoxInfoCover(tweetBox);
		infoBoxCover.unbind("mousedown");
		infoBoxCover.bind("mousedown",{self:this,tweetBox:tweetBox},this.onMouseDown);
	},
	onMouseDown:function(event){
		var me=event.data.self;
		var tweetBox=event.data.tweetBox;
		var infoBoxCover = me.editor.getTweetBoxInfoCover(tweetBox);
		var viewList = me.editor.getViewList();
		var infoBox = me.editor.getTweetBoxInfo(tweetBox);
		infoBoxCover.css("height",infoBox.css("height"));
		var y =event.clientY;
		//var top= tweetBox.position().top;
		var height= tweetBox.get(0).height;
		tweetBox.css("border-left-color",me.editor.constMap.selectColor);
		infoBoxCover.unbind("mouseup");
		viewList.unbind("mousemove");
		viewList.unbind("mouseout");
		infoBoxCover.bind("mouseup",{self:me,infoBoxCover:infoBoxCover,tweetBox:tweetBox},me.onMouseUp);
		viewList.bind("mouseout",{self:me,infoBoxCover:infoBoxCover,tweetBox:tweetBox},me.onMouseUp);
		viewList.bind("mousemove",{self:me,tweetBox:tweetBox,start:y,height:height},me.onDrag);
		infoBoxCover.css("cursor","move");
	},
	onDrag:function(event){
		var me= event.data.self;
		var tweetBox=event.data.tweetBox;
		var start=event.data.start;
		var height= tweetBox.css("height").replace("px","");
		var y = event.clientY;
		if(me.dragTimer!==undefined){
			clearTimeout(me.dragTimer);	
		}
		me.dragTimer = setTimeout(function(){me.doDrag(me,tweetBox,start,height,y);},10);
	},
	doDrag:function(me,tweetBox,start,height,y){
		var top = tweetBox.position().top;
		var diff = y-start;
console.log("doDrag top:"+top+"/y:"+y+"/start:"+start+"/diff:"+diff+"/height:"+height);
		tweetBox.css("top",y-start);
		window.getSelection().removeAllRanges();
		
		if(Math.abs(diff)>height/4){
			if(diff< 0){
				me.editor.moveTweet({data:{self:me.editor,direct:"up",idIndex:me.idIndex}});
			}else{
				me.editor.moveTweet({data:{self:me.editor,direct:"down",idIndex:me.idIndex}});
			}
			var tweetBox = me.editor.getTweetBoxObj(me.editor,me.idIndex);
			var infoBoxCover = me.editor.getTweetBoxInfoCover(tweetBox);
			var infoBox = me.editor.getTweetBoxInfo(tweetBox);
			infoBoxCover.css("height",infoBox.css("height"));
			infoBoxCover.bind("mousedown",{self:me,tweetBox:tweetBox},me.onMouseDown);
			infoBoxCover.bind("mouseup",{self:me,tweetBox:tweetBox,infoBoxCover:infoBoxCover},me.onMouseUp);
		}
	},
	onMouseUp:function(event){
		var me=event.data.self;
		var infoBoxCover=event.data.infoBoxCover;
		var tweetBox=event.data.tweetBox;
		var viewList = me.editor.getViewList();
		viewList.unbind("mousemove");
		viewList.unbind("mouseout");
		if(tweetBox!==undefined){
			tweetBox.css("border-left-color",me.editor.constMap.unselectColor);
		}
		infoBoxCover.unbind("mouseup");
		infoBoxCover.css("cursor","pointer");
	}
}

var ManikiFuncTitle=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="作品";
	this.nameEn="Title";
	this.color="#35FF";
	this.Id =SUBTITEL;
	this.level =0;
	this.parentId="WORK";
	this.infoMap={Diarect:"right"};
}
ManikiFuncTitle.prototype = new ManikiFunctions();
//ManikiFuncPage.prototype.
ManikiFuncTitle.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncTitle(this.editor,idIndex,keyBindFunc);
}

var ManikiFuncPage=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="頁";
	this.nameEn="Page";
	this.color="#35FFDA";
	this.Id =PAGE;
	this.level =1;
	this.parentId="Title";
	this.infoMap={side:"right"};
}
ManikiFuncPage.prototype = new ManikiFunctions();
//ManikiFuncPage.prototype.
ManikiFuncPage.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncPage(this.editor,idIndex,keyBindFunc);
};
ManikiFuncPage.prototype.showState=function(){
	var state=this.editor.analizer.state;
console.log("AAAAAAAAAAAAAAAAAAAAAAAA"+"/this.idIndex:"+this.idIndex+"/"+(state[this.idIndex]===undefined?"":state[this.idIndex].toSource()));
	var currentState = state[this.idIndex].rowStat;
	var addInfo = currentState===undefined?"":currentState[this.editor.analizer.pageSide];
	this.addInfo = addInfo==="L"?"[左 ]":addInfo==="R"?"[ 右]":"";
//console.log("AAAAAAAAAAAAAAAAAAAAAAAA"+(state[this.idIndex]===undefined?"":state[this.idIndex].toSource()));
    this.showStateExec();
    this.showStatePost();
};

var ManikiFuncKoma=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="コマ";
	this.nameEn="koma";
	this.color="#33FF7E";
	this.Id =KOMA;
	this.level =2;
	this.parentId=PAGE;
	this.infoMap={};
}
ManikiFuncKoma.prototype = new ManikiFunctions();
//ManikiFuncPage.prototype.
ManikiFuncKoma.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncKoma(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncFukidashi=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="噴き出し";
	this.nameEn="Baloon";
	this.color="#33FF3D";
	this.Id =FUKIDASHI;
	this.level =3;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncFukidashi.prototype = new ManikiFunctions();
//ManikiFuncPage.prototype.
ManikiFuncFukidashi.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncFukidashi(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncSetting=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="設定";
	this.nameEn="Settings";
	this.color="#7FFF35";
	this.Id =SETTING;
	this.level =3;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncSetting.prototype = new ManikiFunctions();
//ManikiFuncSetting.prototype.
ManikiFuncSetting.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncSetting(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncActor=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="役者";
	this.nameEn="Actor";
	this.color="#CDFF34";
	this.Id =ACTOR;
	this.level =3;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncActor.prototype = new ManikiFunctions();
//ManikiFuncActor.prototype.
ManikiFuncActor.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncActor(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncObject=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="小道具";
	this.nameEn="Object";
	this.color="#FFEF34";
	this.Id =OBJECT;
	this.level =3;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncObject.prototype = new ManikiFunctions();
//ManikiFuncObject.prototype.
ManikiFuncObject.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncObject(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncBackground=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="背景";
	this.nameEn="Background";
	this.color="#FFBF34";
	this.Id =BACKGROUND;
	this.level =3;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncBackground.prototype = new ManikiFunctions();
//ManikiFuncBackground.prototype.
ManikiFuncBackground.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncBackground(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncSound=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="擬音";
	this.nameEn="Sound";
	this.color="#FFBF34";
	this.Id =SOUND;
	this.level =3;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncSound.prototype = new ManikiFunctions();
//ManikiFuncSound.prototype.
ManikiFuncSound.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncSound(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncEffect=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="効果";
	this.nameEn="Effect";
	this.color="#FF7E34";
	this.Id =EFFECT;
	this.level =4;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncEffect.prototype = new ManikiFunctions();
//ManikiFuncEffect.prototype.
ManikiFuncEffect.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncEffect(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncNalation=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="説明";
	this.nameEn="Settings";
	this.color="#30FF64";
	this.Id =NALATION;
	this.level =3;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncNalation.prototype = new ManikiFunctions();
//ManikiFuncNalation.prototype.
ManikiFuncNalation.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncNalation(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncQuote=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="注釈";
	this.nameEn="Quote";
	this.color="#FF337A";
	this.Id =QUOTE;
	this.level =3;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncQuote.prototype = new ManikiFunctions();
//ManikiFuncQuote.prototype.
ManikiFuncQuote.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncQuote(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncSean=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="場所";
	this.nameEn="Sean";
	this.color="#FF31F5";
	this.Id =SEAN;
	this.level =3;
	this.parentId=KOMA;
	this.infoMap={};
}
ManikiFuncSean.prototype = new ManikiFunctions();
//ManikiFuncSean.prototype.
ManikiFuncSean.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncSean(this.editor,idIndex,keyBindFunc);
}


var ManikiFuncFukusen=function(editor,idIndex,keyBindFunc){
	ManikiFunctions.apply(this, arguments);
	this.nameLc="伏線";
	this.nameEn="Settings";
	this.color="#BA2FFF";
	this.Id =FUKUSEN;
	this.level =3;
	this.parentId=SUBTITEL;
	this.infoMap={};
}
ManikiFuncFukusen.prototype = new ManikiFunctions();
//ManikiFuncFukusen.prototype.
ManikiFuncFukusen.prototype.create=function(idIndex,keyBindFunc){
	return new ManikiFuncFukusen(this.editor,idIndex,keyBindFunc);
}



MansikiTweetStateAnaliser=function(editor){
	this.state ={};
	this.editor=editor;	
	this.pageSide ="pageSide";
	this.margeOnChangeFunc={};//PAGEなど
	this.margeOnChangeFunc[PAGE]=this.onPageChange;
	this.margeStateRule={};//DEL,UPD,INS
	this.margeStateRule[OBJECT]={};
	this.margeStateRule[FUKUSEN]={};
	this.margeStateRule[SETTING]={};
	this.margeStateRule[SUBTITEL]={};
	this.margeStateRule[SUBTITEL][DEL]=[KOMA,FUKIDASHI,NALATION,BACKGROUND,SOUND,EFFECT,QUOTE,SEAN];
	this.margeStateRule[SUBTITEL][UPD]=[NONBLE];
	this.margeStateRule[SUBTITEL][INS]=[SUBTITEL,PAGE];
	this.margeStateRule[NONBLE]={};
	this.margeStateRule[NONBLE][UPD]=[NONBLE,PAGE];
	this.margeStateRule[PAGE]={};
	this.margeStateRule[PAGE][DEL]=[KOMA,FUKIDASHI,NALATION,BACKGROUND,SOUND,EFFECT,QUOTE,SEAN];
	this.margeStateRule[PAGE][UPD]=[PAGE,NONBLE];
	this.margeStateRule[KOMA]={};
	this.margeStateRule[KOMA][DEL]=[FUKIDASHI,NALATION,BACKGROUND,SOUND,EFFECT,QUOTE,SEAN];
	this.margeStateRule[KOMA][UPD]=[KOMA];
	this.margeStateRule[FUKIDASHI]={};
	this.margeStateRule[FUKIDASHI][UPD]=[FUKIDASHI];
	this.margeStateRule[ACTOR]={};
	this.margeStateRule[ACTOR][UPD]=[ACTOR];
	this.margeStateRule[OBJECT]={};
	this.margeStateRule[OBJECT][UPD]=[OBJECT];
	this.margeStateRule[NALATION]={};
	this.margeStateRule[NALATION][UPD]=[NALATION];
	this.margeStateRule[BACKGROUND]={};
	this.margeStateRule[BACKGROUND][UPD]=[BACKGROUND];
	this.margeStateRule[SOUND]={};
	this.margeStateRule[SOUND][UPD]=[SOUND];
	this.margeStateRule[EFFECT]={};
	this.margeStateRule[EFFECT][UPD]=[EFFECT];
	this.margeStateRule[QUOTE]={};
	this.margeStateRule[QUOTE][UPD]=[QUOTE];
	this.margeStateRule[SEAN]={};
	this.margeStateRule[SEAN][UPD]=[SEAN];
	this.pageDiarect="L";
	this.pageStartSide="L";
	this.rowDiarect="L";
	this.letterDiarect="V";
	this.init();
	this.titleStates={};
}
MansikiTweetStateAnaliser.prototype ={
	init:function(){
	    $("#TWPageDiarectR").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWPageDiarectL").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWPageStartR").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWPageStartL").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWRowDiarectR").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWRowDiarectL").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWLetterDiarectV").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWLetterDiarectH").bind("change",{self:this},this.getTitleInitSetting);
	},
	loadTitleStates:function(titleStates){
	    this.titleStates = titleStates===undefined ?{}:titleStates;
	    if(this.titleStates["pageDiarect"]!==undefined){
		if(this.titleStates["pageDiarect"]==="R"){
		    $("#TWPageDiarectR").attr("checked","checked");
		}else{
		    $("#TWPageDiarectL").attr("checked","checked");
		}
		this.pageDiarect=this.titleStates["PageDiarect"];
	    }
	    if(this.titleStates["pageStartSide"]!==undefined){
		if(this.titleStates["pageStartSide"]==="R"){
		    $("#TWPageStartR").attr("checked","checked");
		}else{
		    $("#TWPageStartL").attr("checked","checked");
		}
		this.pageStartSide=this.titleStates["pageStartSide"];
	    }
	    if(this.titleStates["rowDiarect"]!==undefined){
		if(this.titleStates["rowDiarect"]==="R"){
		    $("#TWRowDiarectR").attr("checked","checked");
		}else{
		    $("#TWRowDiarectL").attr("checked","checked");
		}
		this.rowDiarect=this.titleStates["rowDiarect"];
	    }
	    if(this.titleStates["letterDiarect"]!==undefined){
		if(this.titleStates["letterDiarect"]==="V"){
		    $("#TWLetterDiarectV").attr("checked","checked");
		}else{
		    $("#TWLetterDiarectH").attr("checked","checked");
		}
		this.letterDiarect=this.titleStates["letterDiarect"];
	    }
	},
	getTitleInitSetting:function(event){
	    var me  = event.data.self;
	    if($("#TWPageDiarectR").attr("checked")==="checked"){
		me.pageDiarect="R";
	    }else{
		me.pageDiarect="L";
	    }
	    if($("#TWPageStartR").attr("checked")==="checked"){
		me.pageStartSide="R";
	    }else{
		me.pageStartSide="L";
	    }
	    if($("#TWRowDiarectR").attr("checked")==="checked"){
		me.rowDiarect="R";
	    }else{
		me.rowDiarect="L";
	    }
	    if($("#TWLetterDiarectV").attr("checked")==="checked"){
		me.letterDiarect="V";
	    }else{
		me.letterDiarect="H";
	    }
	    me.titleStates["pageDiarect"] = me.pageDiarect;
	    me.titleStates["pageStartSide"] = me.pageStartSide;
	    me.titleStates["rowDiarect"] = me.rowDiarect;
	    me.titleStates["letterDiarect"] = me.letterDiarect;
	    me.fullAnalize();
	},
	fullAnalize:function(){
		this.state = {};
		var tweets = this.editor.tweets;
		var tweetsFuncs = this.editor.tweetsFuncs;
		var tweetIdMap = this.editor.tweetIdMap;
		var maxCursor = MansikiMapUtil.getMaxIndex(tweetIdMap);
		var preRowStat = {};
		var parent="title";
		for(var i=0;i<=maxCursor;i++){
			var idIndex = tweetIdMap[i];
			if(idIndex===undefined){
				continue;
			}
console.log("i:"+i+"idIndex:"+idIndex);
			var rowStat = {};
			var func = tweetsFuncs[idIndex];
			var id = func.Id;
			var addMap ={id:id,parent:func.parentId};
			rowStat = this.margeMap(addMap,preRowStat);
//console.log("fullAnalize:"+rowStat.toSource()+" / "+preRowStat.toSource());
			this.state[idIndex]={addMap:addMap,rowStat:rowStat};
			preRowStat = MansikiMapUtil.deepCopyMap(rowStat);
		}
		preRowStat["isLastMap"]={last:true};
	},
	margeMap:function(addMap,preRowStat){
//console.log("margeMap:"+addMap.toSource()+"/"+preRowStat.toSource());
		var rowState = MansikiMapUtil.deepCopyMap(preRowStat);
		var isLastMap = {};
		preRowStat["isLastMap"] = isLastMap;
		for(var key in addMap){
			var Id= addMap[key];
//console.log("margeMap key:"+key+"/"+this.margeStateRule[Id]+"/Id:"+Id);
			if(this.margeStateRule[Id]===undefined || key==="parent"){
				continue;
			}
			var rule = this.margeStateRule[Id];
//console.log("margeMap rule:"+rule.toSource());
			for(var index in rule[DEL]){
				isLastMap[rule[DEL][index]]=true;
				rowState[rule[DEL][index]] = FLAG_OFF;
			}
			for(var index in rule[UPD]){
				if(rowState[rule[UPD][index]]===undefined){
					rowState[rule[UPD][index]]=FLAG_OFF;
				}
				rowState[rule[UPD][index]]++;
			}
			for(var index in rule[INS]){
				rowState[rule[INS][index]] = FLAG_ON;
			}
			var func = this.margeOnChangeFunc[Id];
			if(func!==undefined){
			    func(this,rowState);
			}
		}
		return rowState;
	},
	onPageChange:function(self,rowState){
	    var index = rowState[PAGE];
	    var side = index%2;//奇数偶数頁
	    if(self.pageStartSide==="L"){//左始まり、左右送り＝奇数：右・偶数:左
		rowState[self.pageSide]=side===1?"R":"L";
	    }else {//左始まり、右左送り＝奇数：左・偶数:右
		rowState[self.pageSide]=side===1?"L":"R";
	    }
	}
}

MansikiTweetStyleKeyBind=function(editor){
	this.editor=editor;
	this.id=editor.id+"MansikiTweetStyleKeyBind";
	this.eventField ;
	this.nowTime = new Date().getTime();
	this.escapeKeyInput=["key27","key9","key116","ctl13","ctl8","ctl38","ctl40","ctl77","ctl82","ctl85"];
	this.escapeKeyMain=["key116"];
	
	this.keyBindViewInput={MOVEUP:"Ctrl+up",MOVEDOWN:"Ctrl+down",UPDATE:"Ctrl+Entr",FOCUSOUT:"Esc",CLEAR:"Ctrl+E"};
	this.keyBindViewMain={UP:"up",DOWN:"down",LOAD:"space",CLEAR:"Ctrl+E",DELETE:"Ctrl+Del"};
	this.keyBindViewFuncs ={};
	this.keyBindViewFuncs[SUBTITEL] = "Ctl+<";
	this.keyBindViewFuncs[NONBLE] = "Ctl+>";
	this.keyBindViewFuncs[PAGE] = "Ctl+1";
	this.keyBindViewFuncs[KOMA] = "Ctl+2";
	this.keyBindViewFuncs[FUKIDASHI] = "Ctl+3";
	this.keyBindViewFuncs[SETTING] = "Ctl+4";
	this.keyBindViewFuncs[NALATION] = "Ctl+5";
	this.keyBindViewFuncs[OBJECT] = "Ctl+6";
	this.keyBindViewFuncs[BACKGROUND] = "Ctl+7";
	this.keyBindViewFuncs[SOUND] = "Ctl+8";
	this.keyBindViewFuncs[EFFECT] = "Ctl+9";
	this.keyBindViewFuncs[QUOTE]= "Ctl+0";
	this.keyBindViewFuncs[SEAN] = "Ctl+q";
	this.keyBindViewFuncs[ACTOR] = "Ctl+i";
	this.keyBindViewFuncs[FUKUSEN] = "Ctl+w";
	this.buidCmdAreaMain();
}
MansikiTweetStyleKeyBind.prototype ={
	buidCmdAreaInput:function(){
	    this.buidCmdArea(this.keyBindViewInput);
	},
        buidCmdAreaMain:function(){
            this.buidCmdArea(this.keyBindViewMain);
        },
	buidCmdArea:function(ShortCutMap){
	    var html = "";
	    for(var key in ShortCutMap){
		var shortCutText = ShortCutMap[key];
		html+="<span id='"+this.id+key+"'>"+key+"</span>|"+shortCutText;
	    }
	    $("#TWcommandList").html(html);
	},
	hilightCmd:function(key){
	    var id =this.id+key;
	    $("#"+id).addClass("TwcommandHliright");
	    this.hilightTimer = setTimeout(function(){$("#"+id).removeClass("TwcommandHliright");},500);
	},
	setKeyEventField:function(eventField){
		this.eventField  = eventField;
		this.eventField.unbind('keydown');
		this.eventField.bind('keydown',{self:this,escapeKeyList:this.escapeKeyMain},this.blockBubbleEvent);
		this.eventField.unbind('keyup');
		this.eventField.bind('keyup',{self:this},this.doMainKeyEvent);
	}
	,isEscapeKeyInput:function(event){
		var keyCode = event.keyCode;
		var escapeKeyList = event.data.escapeKeyList;
		var shiftKey = event.shiftKey===true?"sft":"";
		var ctrlKey = event.ctrlKey===true?"ctl":"";
		var key = shiftKey.length >0 || ctrlKey.length >0 ?"":"key";
		var keyInputed = shiftKey+ctrlKey+key+keyCode;
		for(var i = 0;i<escapeKeyList.length;i++){
			if(escapeKeyList[i]===keyInputed){
				return true;
			}
		}
		return false;
	}
	,blockBubbleEvent:function(event){
		var me = event.data.self;
		var convert = event.data.convert;
		if(me.isEscapeKeyInput(event)===true ||
				(convert === true && me.isEscapeKeyInput(event)!==true )
			){
			return ;
		}
		event.returnValue=false;//伝播は防御
		event.preventDefault();//伝播は防御
		event.stopPropagation();//伝播は防御
	}
	,bindActionToInputForm:function(target){
		if(target!==undefined){
			target.unbind('keyup');
			target.bind('keyup',{self:this},this.doInputFormKeyEvent);
			target.unbind('keydown');
			target.bind('keydown',{self:this,escapeKeyList:this.escapeKeyInput,convert:true},this.blockBubbleEvent);
		}
	}
	,unbindActionToInputForm:function(target){
		if(target!==undefined){
			target.unbind('keyup');
		}
	}
	,doInputFormKeyEvent:function(event){
		var me = event.data.self;
		var nowTime = new Date().getTime();
		me.eventField.css("cursor","wait");//  
		me.keyUpCount ++;
		var keyCode = event.keyCode;
		var isShiftKey = event.shiftKey;
		var isCtrlKey = event.ctrlKey;
		var wicth= event.which;
		var modifiers=event.modifiers;
		var x =event.clientX;
		var y =event.clientY;
		if(keyCode===9 ){//Tab
			me.blockBubbleEvent(event);
			me.eventField.focus();
		}		
console.log("doInputFormKeyEvent keyCode:"+keyCode+"/wicth:"+wicth+"/modifiers:"+modifiers+"/event.ctrlKey:"+event.ctrlKey);
		if(keyCode=="38" ){//up
		}else if(keyCode=="40" ){//down
		}else if(keyCode=="37" ){//left
		}else if(keyCode=="39" ){//right
		}else if(keyCode=="27" ){//escape
			me.moveCursorToOuter();
		}else if(isShiftKey===false && isCtrlKey===true ){
			if(keyCode=="85" ){//u 
				me.undo();
			}else if(keyCode=="82" ){//r 
				me.redo();
			}else if(keyCode=="8" ){//delete 
				me.cursorDelete();
			}else if(keyCode=="69" ){//e
				me.clear();
			}else if(keyCode=="38" ){//up
				me.moveUp();
			}else if(keyCode=="40" ){//down
				me.moveDown();
			}else if(keyCode=="13" ){//enter
				me.addupdate();
			}else if(keyCode=="77" ){//m
				me.moveCursorToOuter();
			}else if(keyCode=="49" ){//1
				me.callCmdButtonsHilight(PAGE);
			}else if(keyCode=="50" ){//2
				me.callCmdButtonsHilight(KOMA);
			}else if(keyCode=="51" ){//3
				me.callCmdButtonsHilight(FUKIDASHI);
			}else if(keyCode=="52" ){//4
				me.callCmdButtonsHilight(SETTING);
			}else if(keyCode=="53" ){//5
				me.callCmdButtonsHilight(NALATION);
			}else if(keyCode=="54" ){//6
				me.callCmdButtonsHilight(OBJECT);
			}else if(keyCode=="55" ){//7
				me.callCmdButtonsHilight(BACKGROUND);
			}else if(keyCode=="56" ){//8
				me.callCmdButtonsHilight(SOUND);
			}else if(keyCode=="57" ){//9
				me.callCmdButtonsHilight(EFFECT);
			}else if(keyCode=="48" ){//0
				me.callCmdButtonsHilight(QUOTE);
			}else if(keyCode=="81" ){//q
				me.callCmdButtonsHilight(SEAN);
			}else if(keyCode=="73" ){//i
				me.callCmdButtonsHilight(ACTOR);
			}else if(keyCode=="87" ){//w
				me.callCmdButtonsHilight(FUKUSEN);
			}
		}else if(isShiftKey===true && isCtrlKey===false ){
			
		}
	}
	,doMainKeyEvent:function(event){
		var me = event.data.self;
		var nowTime = new Date().getTime();
		me.eventField.css("cursor","wait");//  
		me.keyUpCount ++;
		var keyCode = event.keyCode;
		var isShiftKey = event.shiftKey;
		var isCtrlKey = event.ctrlKey;
		var wicth= event.which;
		var modifiers=event.modifiers;
		var x =event.clientX;
		var y =event.clientY;
		if(keyCode===9 ){//Tab
			me.blockBubbleEvent(event);
			me.eventField.focus();
		}
console.log("doMainKeyEvent keyCode:"+keyCode+"/wicth:"+wicth+"/modifiers:"+modifiers+"/event.ctrlKey:"+event.ctrlKey);
		if(keyCode=="38" ){//up
			me.cursorUp();
		}else if(keyCode=="40" ){//down
			me.cursorDown();
		}else if(keyCode=="37" ){//left
		}else if(keyCode=="39" ){//right
		}else if(keyCode=="32" ){//space
			me.cursorSelect();
			
		}else if(isShiftKey===false && isCtrlKey===true ){
			if(keyCode=="85" ){//z 
				me.undo();
			}else if(keyCode=="82" ){//y
				me.redo();
			}else if(keyCode=="8" ){//delete 
				me.cursorDelete();
			}else if(keyCode=="69" ){//e
				me.clear();
			}else if(keyCode=="38" ){//up
				me.moveUp();
			}else if(keyCode=="40" ){//down
				me.moveDown();
			}else if(keyCode=="13" ){//enter
				me.addupdate();
			}else if(keyCode=="83" ){//s
				me.cursorSelect();
			}else if(keyCode=="78" ){//n
				me.clear();
			}else if(keyCode=="49" ){//1
				me.callCmdButtonsHilight(PAGE);
			}else if(keyCode=="50" ){//2
				me.callCmdButtonsHilight(KOMA);
			}else if(keyCode=="51" ){//3
				me.callCmdButtonsHilight(FUKIDASHI);
			}else if(keyCode=="52" ){//4
				me.callCmdButtonsHilight(SETTING);
			}else if(keyCode=="53" ){//5
				me.callCmdButtonsHilight(NALATION);
			}else if(keyCode=="54" ){//6
				me.callCmdButtonsHilight(OBJECT);
			}else if(keyCode=="55" ){//7
				me.callCmdButtonsHilight(BACKGROUND);
			}else if(keyCode=="56" ){//8
				me.callCmdButtonsHilight(SOUND);
			}else if(keyCode=="57" ){//9
				me.callCmdButtonsHilight(EFFECT);
			}else if(keyCode=="48" ){//0
				me.callCmdButtonsHilight(QUOTE);
			}else if(keyCode=="81" ){//q
				me.callCmdButtonsHilight(SEAN);
			}else if(keyCode=="73" ){//i
				me.callCmdButtonsHilight(ACTOR);
			}else if(keyCode=="87" ){//w
				me.callCmdButtonsHilight(FUKUSEN);
			}
		}else if(isShiftKey===true && isCtrlKey===false ){
			
		}
		
		/**
			if(keyCode=="67" && event.ctrlKey===true){//Copy
			}else if(keyCode=="86" && event.ctrlKey===true){//peast
			}else if(keyCode=="88" && event.ctrlKey===true){//Cut
			}
		**/
		me.eventField.val();
		me.eventField.css("cursor","text");
	}
	,cursorUp:function(){
		console.log("cursorUp cursor:"+this.editor.cursor);
		this.editor.curosrMoveUp();
		this.hilightCmd("UP");
	}
	,cursorDown:function(){
		console.log("cursorDown cursor:"+this.editor.cursor);
		this.editor.curosrMoveDown();
		this.hilightCmd("DOWN");
	}
	,cursorDelete:function(){
		console.log("cursorDelete cursor:"+this.editor.cursor);
		var idIndex =this.editor.getCurrentIdIndexByCousor();
		this.editor.deleteTweet({data:{self:this.editor,idIndex:idIndex}});
		this.hilightCmd("DELETE");
	}
	,cursorSelect:function(){
		console.log("cursorSelect cursor:"+this.editor.cursor);
		var idIndex =this.editor.getCurrentIdIndexByCousor();
		this.editor.loadTweet({data:{self:this.editor,idIndex:idIndex}});
		this.hilightCmd("DELETE");
	}
	,clear:function(){
		console.log("clear cursor:"+this.editor.cursor);
		this.editor.clearTweet({data:{self:this.editor}});
		this.hilightCmd("CLEAR");
	}
	,moveUp:function(){
		console.log("moveUp cursor:"+this.editor.cursor);
		var selected  = this.editor.state.selected;
		if(selected!==undefined){
			this.editor.moveTweet({data:{self:this.editor,idIndex:selected,direct:"up"}});
		}
		this.hilightCmd("MOVEUP");
	}
	,moveDown:function(){
		console.log("moveDown cursor:"+this.editor.cursor);
		var selected  = this.editor.state.selected;
		if(selected!==undefined){
			this.editor.moveTweet({data:{self:this.editor,idIndex:selected,direct:"down"}});
		}
		this.hilightCmd("MOVEDOWN");
	}
	,addupdate:function(){
		console.log("addupdate cursor:"+this.editor.cursor);
		this.editor.addTweet({data:{self:this.editor}});
	}
	,undo:function(){
		console.log("undo cursor:"+this.editor.cursor);
	}
	,redo:function(){
		console.log("redo cursor:"+this.editor.cursor);
	}
	,newTweet:function(){
		console.log("newTweet cursor:"+this.editor.cursor);
		this.editor.clearTweet({data:{self:this.editor}});
		this.hilightCmd("UPDATE");
	}
	,moveCursorToOuter:function(){
		console.log("coursorMovable cursor:"+this.editor.cursor);
		this.editor.clearTweet({data:{self:this.editor}});
		this.editor.onFocusToCmd({data:{self:this.editor}});
		this.hilightCmd("FOCUSOUT");
	},
	callCmdButtonsHilight:function(funcId){
	    var func = this.editor.funcs.getFunc(funcId);
	    this.editor.cmdButtonsHilight({data:{self:this.editor,id:func.getFullId()}});
	}
}

































