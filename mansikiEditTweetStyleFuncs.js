
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
		me.editor.onFocus({data:{self:me.editor}});
	},
	onBlur:function(event){
		var me= event.data.self;
		me.isFormFocusd=false;
		me.keyBindFunc.unbindActionToInputForm(me.tweetArea);
		me.editor.onBlur({data:{self:me.editor}});
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
	getDownerMovableCursor:function(){//ここの計算がおかしい。要するに越境する場合の考慮が怪しい。いや探索方法が間違っている。
	    //自分のカーソル位置から直近の移動先を撮ってくればいいはず。
		var state=this.editor.analizer.state;
		var editor = this.editor;
		var currentState = state[this.idIndex];
console.log("getUpperMovableCursor  this.idIndex:"+this.idIndex+"/currentState"+state.toSource());
		if(currentState!==undefined){
			var max=MansikiMapUtil.getMaxIndex(editor.tweetIdMap)*1;
			var cursor=max+1;
			var nowCoursor=max+1;
			var downerChildCount = 0;
			for(var i = max;i>=0;i--){//カーソル分回す下から
				var idIndexTmp = editor.tweetIdMap[i];
				if(idIndexTmp===undefined){
					continue;
				}
				if(idIndexTmp*1 === this.idIndex*1){
				    nowCoursor=i;
				    break;
				}
			}
			var isOverBorder = false;
			//ここですでにカーソル位置は確定
			for(var i = nowCoursor+1;i<=max;i++){//カーソル分回す下から
				var idIndexTmp = editor.tweetIdMap[i];
				if(idIndexTmp===undefined){
					continue;
				}
				var func = editor.tweetsFuncs[idIndexTmp];//該当のレベルを調査
console.log("getDownerMovableCursor idIndexTmp:"+idIndexTmp+"/this.idIndex:"+this.idIndex+"/i:"+i+"/func.level :"+func.level +"/this.level:"+this.level);
				if(func.level*1 === this.level*1){//自分と同じ
				    cursor=i;
				    downerChildCount = func.getChildCount();//移動先の子供を数える
				    break;
				}else if(func.level*1+1 === this.level*1){//自分より上位が来たら。
				    isOverBorder= true;
				}
				if(i ===max){
				    isOverBorder= false;//結果上位しかない場合
					cursor=nowCoursor>=max?max:nowCoursor+1+this.getChildCount();//移動１＋子供の分しかさせない
					break;
				}
			}
			
console.log("getDownerMovableCursor max:"+max+" cursor:"+cursor+"/downerChildCount:"+downerChildCount+"/editor.tweetIdMap:"+editor.tweetIdMap.toSource());
			var offset = isOverBorder===true ? -1:	downerChildCount;

			return cursor+offset;//越境する場合は一つ上と交換・越境しない場合は子供の分より下に行く。
		}
console.log("getDownerMovableCursor  0 cursor:"+0);
	    return 0;
	},
	getChildCount :function(){
		var editor = this.editor;
		var max=MansikiMapUtil.getMaxIndex(editor.tweetIdMap)*1;
		var cursor=max+1;
		var childCount = 0;
		for(var i = max;i>0;i--){//下からめくる
			var idIndexTmp = editor.tweetIdMap[i];
			if(idIndexTmp===undefined){
				continue;
			}
			if(idIndexTmp*1 === this.idIndex*1){
			    break;
			}
			var func = editor.tweetsFuncs[idIndexTmp];
console.log("getChildCount func.level :"+func.level+"/this.level:"+this.level +"/childCount:"+ childCount+"/idIndexTmp:"+idIndexTmp+"/this.idIndex:"+this.idIndex);
			if(func.level > this.level*1){
			    childCount++;
			}else{
			    childCount=0;//リセット
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
	this.nameLc="噴出";
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
