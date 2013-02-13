
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
