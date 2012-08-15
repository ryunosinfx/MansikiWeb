var HilightingEditor= function(id, width,height,ancer){
	this.prefix='';
	this.id= id;
	this.width = width;
	this.height = height;
	this.ancer = ancer;
	this.leftOffset = -2;
	this.topOffset = -78;
	this.charOffset =-9;
	this.topRowOffset = 1;
	this.lineHeight=18            ;
	this.init();
	this.textField = undefined;
	this.rowNum = 0;
	this.timeInterval=100;//ms
	this.nowTime = new Date().getTime();
	this.doc="";//
	this.mansikiTextWidthArray={};
	this.offsetOnRow=0;
	this.rowCount=0;
	this.dellCount=0;
	this.retCount=0;
	this.maxWidth=width;
	this.textWidth =0;
	this.isMouseDown=false;
	this.nowMouseDown=false;
	this.nowKeyInput=false;
	this.selectStartRows=-1;
	this.selectStartChars=-1;
	this.selectedRowTopOffset=this.height+this.lineHeight*2;
	this.selectedRowBottomOffset=this.height+this.lineHeight*4+4;
	this.selectedRowMiddleOffset=this.height+this.lineHeight*3+4;
	this.keyUpCount = 0;
	this.nowOffsetCharNo = 0;
	this.nowSelectedText = "";
	this.isCut = false;
	this.isPeast = false;
	this.isBk=false;
	this.isPreShortCuts = false;
	this.isSwithMouseDown = false;
	this.isNowSelecting = false;
	this.isEndNowSelecting = false;
	this.dellCountrowUpOffset=0;
	this.preAreaStartRowNo =0; 
	this.preAreaStartCharNo =0 
	this.preAreaEndRowNo =0; 
	this.preAreaEndCharNo =0
	this.lastInputedArray = [];
}

HilightingEditor.prototype={
	init:function(){
		this.charBox = $("<div id='"+this.prefix+"charBox'></div>").css("width","0px").css("position","absolute").css("opacity",0).css("overflow","hidden");
		var field = $("<div id='"+this.prefix+this.prefix+"field' contenteditable='true'></div>").css("width",this.width).css("height",this.height)
			.css("border-width","1px").css("border-style","solid").css("border-coloer","green").css("overflow","scroll").css("text-wrap","none")
			.css("cursor","text").css("line-Height",this.lineHeight+"px");
		this.ancer.append(field);
		var viewField = $("<div id='"+this.prefix+this.prefix+"View' contenteditable='true'></div>").css("width",this.width).css("height",this.height)
			.css("line-Height",this.lineHeight+"px")
			.css("overflow","hidden").css("text-wrap","none").css("position","relative").css("top",0).css("z-index","100").css("cursor","text");
			
		this.field = field;
		field.append(viewField);
		field.bind('keyup',{"self":this},this.onInput);
//		field.bind('mousedown',{"self":this},this.onMouseDown);
//		field.bind('mouseup',{"self":this},this.onMouseUp);
//		field.bind('mousemove',{"self":this},this.onMouseMove);
//		field.bind('click',{"self":this},this.onClick);
		this.ancer.append(this.charBox);
		this.charBoxDomObj = document.getElementById(this.prefix+"charBox");
		this.viewField = viewField;
	},
	onKeyHack:function(event){//ショートカットキー
	},
	onClick:function(event){
		var me = event.data.self;
		me.onSelect(event);
	},
	onMouseDown:function(event){
		var me = event.data.self;
		me.isMouseDown = true;
		me.isMouseDownNew = true;
		me.nowMouseDown = true;
		if(me.isMouseDown===true){
			me.onSelect(event);
		}
		me.nowMouseDown = false;
	},
	onMouseUp:function(event){
		var me = event.data.self;
		if(event.shiftKey===false && event.ctrlKey===false){
			me.isMouseDown = false;
		}
		me.isMouseDownNew = false;
		me.nowMouseDown = false;
	},
	onMouseMove:function(event){
		var me = event.data.self;
		me.nowMouseDown = false;
		if(me.isMouseDown===true && me.isMouseDownNew===true){
			me.onSelect(event);
		}
	},
	onSelect:function(event){
		var me = event.data.self;
		me.viewField.css("cursor","wait");
		var keyCode = event.keyCode;
		var wicth=event.which;
		var modifiers=event.modifiers;
		var x =event.clientX;
		var y =event.clientY;
		me.rowNum = me.nowKeyInput === false ?Math.floor((y+me.topOffset+me.lineHeight/1)/me.lineHeight)+1:me.rowNum;
		var rows = me.doc.split("\n");
		var newX = 0;
		if(rows.length < me.rowNum){
			newX = 0;
			me.rowNum = rows.length;
		}
		var nowTextWidth = me.culcTextWidth(me,rows[me.rowNum-1],x);
		var textWidth = me.textWidth!==undefined ?me.textWidth :nowTextWidth;
		if(textWidth!==undefined && me.nowKeyInput === true){
			newX = textWidth;
			//me.offsetOnRow = rows[me.rowNum-1]===undefined ?rows[0].length:rows[me.rowNum-1].length;
			console.log("☆☆☆★★★★"+me.offsetOnRow);
		
		}else{
			newX = nowTextWidth;
			console.log("☆☆★☆★★★");
		}
		if(me.rowNum <1) me.rowNum = 1;
		var areaStartRowNo = me.rowNum; 
		var areaStartCharNo = me.offsetOnRow; 
		var areaEndRowNo = me.rowNum; 
		var areaEndCharNo = me.offsetOnRow;
		var scrollY = me.field.scrollTop();
		var scrollX = me.field.scrollLeft();
			
		areaStartCharNo = areaStartRowNo > me.selectStartRows ? me.selectStartChars : areaStartCharNo ;
		areaEndCharNo = areaStartRowNo > me.selectStartRows ? areaEndCharNo:me.selectStartChars;
		areaStartRowNo = areaStartRowNo > me.selectStartRows ? me.selectStartRows : areaStartRowNo;
		areaEndRowNo = areaEndRowNo < me.selectStartRows ? me.selectStartRows : areaEndRowNo;
		if(me.isMouseDown===false && (me.isCut===true||me.isBk===true)){
			areaStartRowNo = me.preAreaStartRowNo ;
			areaStartCharNo = me.preAreaStartCharNo ;
			areaEndRowNo = me.preAreaEndRowNo ;
			areaEndCharNo = me.preAreaEndCharNo;
			console.log("areaStartRowNo:"+areaStartRowNo+"/areaStartCharNo:"+areaStartCharNo+"/areaEndRowNo:"+areaEndRowNo+"/areaEndCharNo:"+areaEndCharNo);
		}
		var rowNumDiff = areaEndRowNo-areaStartRowNo ;
		var textSelectStart = rows[areaStartRowNo-1]===undefined ? "":rows[areaStartRowNo-1];
		var textSelectEnd = rows[areaEndRowNo-1];
		textSelectEnd = textSelectEnd===undefined ?textSelectStart:textSelectEnd;
		
		if( textSelectEnd-textSelectStart <3 && rowNumDiff===0 && (me.nowKeyInput === false && event.shiftKey===false && event.ctrlKey===false)){
			me.isMouseDown==false;
			me.nowMouseDown==false ;
			me.isMouseDown=false;
			me.isNowSelecting=false;
			console.log("☆☆☆★★☆★★");
		}
		
		
		if(me.isMouseDown===false && me.nowMouseDown===false 
		|| me.isMouseDown===false && 
			(me.nowKeyInput === false || event.shiftKey===false && event.ctrlKey===false || me.isPeast===true||me.isCut===true||me.isBk===true)
		|| me.isMouseDownNew===false && (me.nowKeyInput === false && event.shiftKey===false && event.ctrlKey===false)
		||me.isPreShortCuts===true
		|| me.lastInputedArray.length>0 && me.isEndNowSelecting===true && me.isNowSelecting===false
		){
			if(me.isMouseDown===false && (me.nowKeyInput === true && event.shiftKey===false  || me.isPeast===true||me.isCut===true||me.isBk===true)){
				me.isNowSelecting = false;
			}
		}else if(me.nowMouseDown===true){
			me.culcTextWidth(me,rows[me.rowNum-1],x);
			me.selectStartRows=me.rowNum;
			me.selectStartChars=me.offsetOnRow;
			me.isNowSelecting = false;
			me.isEndNowSelecting=false;
			me.nowSelectedText="";
			console.log("☆☆☆★★☆");
		}else{
			var textOffsetStart = me.culcTextWidth(me,textSelectStart.substring(0,areaStartCharNo));
			var textWidthEnd = me.culcTextWidth(me,textSelectEnd.substring(0,areaEndCharNo));
			me.isNowSelecting = true;
			me.isEndNowSelecting=true;
			console.log("☆☆☆☆☆");
			
			me.preAreaStartRowNo =areaStartRowNo; 
			me.preAreaStartCharNo =areaStartCharNo; 
			me.preAreaEndRowNo =areaEndRowNo; 
			me.preAreaEndCharNo =areaEndCharNo;
		}
		if(me.isPreShortCuts===true){
			me.isPreShortCuts=false;
		}else if(me.isPeast===true||me.isCut===true){
			me.isPreShortCuts=true;
			me.isPeast=false;
			me.isCut=false;
		}else{
			me.isPreShortCuts===false;
		}
		if(me.rowNum <1) me.rowNum = 1;
		if(newX <0) newX = 0;
		me.textWidth=undefined ;
		me.nowKeyInput = false;
		me.isCut=false;
		me.isPeast=false;
		me.isSwithMouseDown=false;
		me.isBk=false;
		if(me.isNowSelecting===false){
			me.isEndNowSelecting=false;
		}
		me.viewField.css("cursor","text");
		//me.viewField.focus();
	},
	onDelete:function(event){
		var me = event.data.self;
		var k= event.keyCode;
		console.log("keyCode:"+event.keyCode+"/me.keyUpCount:"+me.keyUpCount);
	},
	onInput:function(event){
		var nowTime = new Date().getTime();
		var me = event.data.self;
		me.viewField.css("cursor","wait");
		me.keyUpCount ++;
		var keyCode = event.keyCode;
		var wicth=event.which;
		var modifiers=event.modifiers;
		var x =event.clientX;
		var y =event.clientY;
		var retCount =0;
		var isAddedRow=false;
		var isUp=false;
		var isNotCharKey=false;
		me.isCut=false;
		me.isPeast=false;
		me.isSwithMouseDown=false;
		me.isBk=false;
		var nowIsMouseDown = me.isMouseDown;
		console.log("x:"+x+"/y:"+y+"/keyCode:"+keyCode+"/wicth:"+wicth+"/modifiers:"+modifiers+"/event.ctrlKey:"+event.ctrlKey);
		if(keyCode=="38" && me.rowNum>1){//up
			me.rowNum--;
			isUp = true;
			isNotCharKey=event.shiftKey===true?false:true;
		}else
		if(keyCode=="40" && me.rowNum < me.rowCount){//down
			me.rowNum++;
			isAddedRow=true;
			isNotCharKey=event.shiftKey===true?false:true;
		}else
		if(keyCode=="37" && me.offsetOnRow >= 0){//left
			me.offsetOnRow--;
			isNotCharKey=event.shiftKey===true?false:true;
		}else
		if(keyCode=="39" ){//right
			me.offsetOnRow++;
			isNotCharKey=event.shiftKey===true?false:true;
		}else
		if(keyCode=="8" ){//delete
			me.dellCount++;
			isNotCharKey=true;
			me.isBk=true;
			
		}else
		if(keyCode=="13" ){//enter
			me.retCount++;
			//isNotCharKey=true;
		}
		if(keyCode=="8" && me.isMouseDown===true){//delete
			me.isMouseDown=false;
			me.nowMouseDown=false;
			isNotCharKey=true;
		}else
		if(keyCode=="8" && me.isNowSelecting===true){
			me.isMouseDown=false;
			me.nowMouseDown=false;
			isNotCharKey=true;
			me.isBk=true;
		}else
		if(event.shiftKey===true && me.isMouseDown===false){
			me.nowMouseDown=true;
			me.nowKeyInput =true;
			var rows = me.doc.split("\n");
			me.textWidth = me.culcTextWidth(me,rows[me.rowNum-1].substring(0,me.offsetOnRow));
			me.onSelect(event);
			me.nowKeyInput =false;
		}else{
			me.nowMouseDown=false;
		}
		if(event.shiftKey===false && event.ctrlKey===false ){//SHIFT押し以外
			me.isMouseDown=false;
			me.isNowSelecting=false;
		}else{
			me.isMouseDown=true;
		}
		if(keyCode=="67" && event.ctrlKey===true){//Copy
			me.clipBoard=me.nowSelectedText;
			me.isMouseDown=true;
		}else if(keyCode=="86" && event.ctrlKey===true){//peast
			me.isMouseDown=false;
			me.nowMouseDown=false;
			me.isPeast=true;
		}else if(keyCode=="88" && event.ctrlKey===true){//Cut
			me.isCut=true;
			me.isMouseDown=false;
			me.nowMouseDown=false;
		}else if(event.ctrlKey===true){//Ctl
		}
		
		if(me.isMouseDown!==nowIsMouseDown){
			me.isSwithMouseDown=true;
		}
		if(nowTime - me.nowTime > me.timeInterval){
			var resultText = me.viewField.text();
			
			var sel =window.getSelection() ;
			var range = sel.getRangeAt(0);
			console.log("resultText:"+resultText+"/start:"+me.viewField.get(0).selectionStart+"/rangeCount:"+sel.rangeCount+"/startOffset:"+range.startOffset);
			var rows = me.doc.split("\n");
			var rowUpOffset = 0;
			var rowUp = 0;
			var preCaret ="";
			me.doc = resultText;
			me.rowCount = rows.length;
			var isMod=false;
			me.textWidth = me.culcTextWidth(me,preCaret,undefined,true);
			me.nowKeyInput =true;
			
			//me.onSelect(event);
			var doc = me.doc;
			//me.viewField.html(me.doc.replace(/\n/g,"<br />"));
			if(isMod===true){
				me.viewField.css("width",me.maxWidth+me.lineHeight);
			}
			
			//me.viewField.focus();
			me.nowKeyInput = false;
			me.dellCount =0;
			me.retCount=0;
		}
		me.viewField.css("cursor","text");
	},
	culcTextWidth:function(me,text,target,flag ){
		var chars = text===undefined ?"":text.split("");
		var ret = 0;
		for(var i = 0 ; i< chars.length ;i++){
			var char = chars[i];
			var width = me.mansikiTextWidthArray[char];
			if(width ===undefined || isNaN(NaN)){
				width = me.searchTheCharWidth(me,char);
				me.mansikiTextWidthArray[char] = width;
			}
			var preret = ret;
			//console.log(char+"/"+width);
			ret += width;
			if(target === undefined){
				continue;
			}
			if(ret+me.charOffset >= target && preret+me.charOffset  <= target){
				me.offsetOnRow = i;
				return preret;
			}
		}
		if(flag===true){
			me.offsetOnRow = chars.length;
		}
		return ret ;
	},
	searchTheCharWidth:function(me,char){
		var width = 0;
		me.charBox.text(char);
		width = me.charBoxDomObj.scrollWidth;
		return width;
	}
	
}
