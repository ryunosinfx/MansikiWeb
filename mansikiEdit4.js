
var HilightingEditorGrobalSelfPointer ;
var HilightingEditor= function(id, width,height,ancer){
	this.prefix='';
	this.id= id;
	this.width = width;
	this.height = height;
	this.ancer = ancer;
	this.leftOffset = -2;
	this.topOffset = -80;
	this.charOffset =-9;
	this.topRowOffset = 1;
	this.lineHeight=15 ;
	this.fontSize=12;
	this.wordSpacing="0px";
	this.letterSpacing="0px";
	this.LeftBarAWidth=30;
	this.LeftBarBWidth=10;
	this.LeftBarCWidth=10;
	this.RightBarAWidth=40;
	this.RightBarBWidth=0;
	this.RightBarCWidth=0;
	this.fontFamily ='"Takao Pゴシック",monospace,"Takaoゴシック","ＭＳ ゴシック","Andale Mono",sans-serif';
	this.textareaOffsetTop=-1;
	this.textareaOffsetLeft=-1;
	this.textField = undefined;
	this.init();
	this.rowNum = 0;
	this.timeInterval=100;//ms
	this.nowTime = new Date().getTime();
	this.doc="";//
	this.mansikiTextWidthArray={};
	this.mansikiTextareaWidthArray={};
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
	this.SyntaxHilighter = new SyntaxHilighter();
	this.selectedRowTopOffset=this.height+this.lineHeight*2;
	this.selectedRowBottomOffset=this.height+this.lineHeight*4+4;
	this.selectedRowMiddleOffset=this.height+this.lineHeight*1+4;
	this.keyUpCount = 0;
	this.nowOffsetCharNo = 0;
	this.nowSelectedText = "";
	this.isCut = false;
	this.isPeast = false;
	this.isPreShortCuts = false;
	this.isNowSelecting = false;
	this.isEndNowSelecting = false;
	this.dellCountrowUpOffset=0;
	this.compositionupdateData="";
	this.isCompositionupdate=false;
	this.preX=0;
	this.preY=0;
	this.lastLineNum=0;
	this.viewAreaRecio=1;
	
	this.scrollBarHeight=-18;
	this.CurrentOffsetTop=0;
	this.lastInputedArray = [];
	
	this.isDorgableCodeMap = false;
	this.startClickYCodeMap = 0;
	this.startTopCodeMap = 0;
}

HilightingEditor.prototype={
	init:function(){
		//------------------------------------------
		this.charBox = this.setStanderdCSSops($("<div id='"+this.prefix+"charBox'></div>").css("width","0px").css("position","absolute").css("opacity",0).css("overflow","hidden").css("overflow","hidden"));
		this.charBoxTextarea = $("<textarea id='"+this.prefix+"charBoxTextarea' wrap='off'></textarea>").css("width","0px").css("position","absolute").css("opacity",0)
		.css("overflow","hidden").css("font-size",this.fontSize+"px").css("font-family",this.fontFamily).css("word-spacing",this.wordSpacing)
		.css("letter-spacing",this.letterSpacing).css("overflow","hidden");
		this.compositionupdateBox = this.setStanderdCSSops($("<div id='"+this.prefix+"compositionupdateBox'></div>").css("width","0px").css("opacity",0).css("overflow","hidden").css("position","relative").css("height",this.lineHeight).css("border-bottom-style","dotted").css("border-bottom-width","1px").css("border-bottom-color","red").css("background-color","none"));
		//----------------------------------------------
		var backPanel = $("<div id='"+this.prefix+"backPanel'></div>")
			.css("border-width","1px").css("border-style","solid").css("border-coloer","green").css("overflow","hidden");
		var field = $("<div id='"+this.prefix+"field'></div>")
			.css("border-width","0px").css("border-style","solid").css("border-coloer","green").css("overflow","scroll").css("text-wrap","none")
			.css("cursor","text").css("line-Height",this.lineHeight+"px").css("float","left").css("background-color","red").css("padding","0px").css("margin","0px");
		var middleField = $("<div id='"+this.prefix+"middleField'></div>")
			.css("border-width","1px").css("border-style","solid").css("border-coloer","red").css("overflow","hidden").css("text-wrap","none")
			.css("line-Height",this.lineHeight+"px");
		var selectTopRow = $("<div id='"+this.prefix+"selectTopRow'></div>")
			.css("border-width","1px").css("border-style","solid").css("border-coloer","blue").css("overflow","hidden").css("background-color","blue")
			.css("top",0-this.height).css("opacity",0.5).css("width",this.currentWidth).css("height",this.lineHeight).css("position","relative").css("z-index","150");
		var selectMiddleRow = $("<div id='"+this.prefix+"selectMiddleRow'></div>")
			.css("border-width","1px").css("border-style","solid").css("border-coloer","green").css("overflow","hidden").css("background-color","green")
			.css("top",0-this.height).css("opacity",0.5).css("width",this.currentWidth).css("height",this.lineHeight).css("position","relative").css("z-index","150");
		var selectBottomRow = $("<div id='"+this.prefix+"selectBottomRow'></div>")
			.css("border-width","1px").css("border-style","solid").css("border-coloer","gray").css("overflow","hidden").css("background-color","orange")
			.css("top",0-this.height).css("opacity",0.5).css("width",this.currentWidth).css("height",this.lineHeight).css("position","relative").css("z-index","150");
		var viewField = this.setStanderdCSSops($("<div id='"+this.prefix+"View'></div>")
			.css("overflow","hidden").css("position","relative").css("top",-this.lineHeight*2).css("z-index","100").css("cursor","text"));
		var viewArea = $("<div id='"+this.prefix+"viewArea'></div>")
			.css("border-width","1px").css("border-style","solid").css("border-coloer","blue").css("background-color","#0095FF")
			.css("opacity",0.5).css("width",this.currentWidth).css("height",this.lineHeight).css("position","relative").css("z-index","550");
		var rowNumRowHilight = $("<div id='"+this.prefix+"rowNumRowHilight'></div>")
			.css("border-width","1px").css("border-style","solid").css("border-coloer","blue").css("background-color","#0095FF")
			.css("opacity",0.5).css("height",this.lineHeight).css("position","relative").css("z-index","550").css("position","relative");
			
			
		var leftColumnFiled =this.setStanderdCSSops($("<div id='"+this.prefix+"leftColumn'></div>").css("background-color","green").css("float","left").css("overflow","hidden"));
		var numberFiled =this.setStanderdCSSops($("<div id='"+this.prefix+"numberField'></div>").css("background-color","#DDEBF2").css("text-align","right").css("float","left").css("overflow","hidden")).css("padding-right","2px").css("font-size",this.fontSize-2).css("position","relative").css("top",0-this.lineHeight-2);
		var rightColumnFiled =this.setStanderdCSSops($("<div id='"+this.prefix+"rightColumn'></div>").css("background-color","yellow").css("float","left").css("overflow","hidden"));
		
		this.ancer.append(backPanel);
		backPanel.append(leftColumnFiled);
		backPanel.append(field);
		backPanel.append(rightColumnFiled);
		leftColumnFiled.append(rowNumRowHilight);
		leftColumnFiled.append(numberFiled);
		rightColumnFiled.append(viewArea);
		this.backPanel = backPanel;
		this.leftColumnFiled = leftColumnFiled;
		this.leftColumnFiledDomObj = leftColumnFiled.get(0);
		this.rowNumRowHilight = rowNumRowHilight;
		this.rowNumRowHilightDomObj = rowNumRowHilight.get(0);
		this.numberFiled = numberFiled;
		this.numberFiledDomObj = numberFiled.get(0);
		this.field = field;
		this.fieldDomObj = field.get(0);
		this.rightColumnFiled = rightColumnFiled;
		this.rightColumnFiledDomObj = rightColumnFiled.get(0);
		this.viewArea = viewArea;
		this.viewAreaDomObj = viewArea.get(0);
		this.middleField = middleField;
		this.middleFieldDomObj = middleField.get(0);
		field.append(middleField);
		middleField.append(viewField);
		middleField.append(this.compositionupdateBox);
		middleField.append(selectTopRow);
		middleField.append(selectBottomRow);
		middleField.append(selectMiddleRow);
		this.ancer.append(this.charBox);
		this.ancer.append(this.charBoxTextarea);
		this.charBoxDomObj = document.getElementById(this.prefix+"charBox");
		this.charBoxTextareaDomObj = document.getElementById(this.prefix+"charBoxTextarea");
		this.compositionupdateBoxDomObj = document.getElementById(this.prefix+"charBoxTextarea");
		this.viewField = viewField;
		this.viewFieldDomObj = viewField.get(0);
		this.selectTopRow = selectTopRow;
		this.selectMiddleRow = selectMiddleRow;
		this.selectBottomRow = selectBottomRow;
		this.selectTopRow.css("visibility","hidden");
		this.selectMiddleRow.css("visibility","hidden");
		this.selectBottomRow.css("visibility","hidden");
		this.compositionupdateBox.css("visibility","hidden");
		this.isNowSelecting = false;
		this.createTextField(this);
		this.adjustSize(this);
		HilightingEditorGrobalSelfPointer = this;
		
		
		
	},
	adjustSize:function(me){
		var leftColumnFiledWidth = me.LeftBarAWidth+me.LeftBarBWidth+me.LeftBarCWidth;
		var rightColumnFiledWidth = me.RightBarAWidth+me.RightBarBWidth+me.RightBarCWidth;
		me.leftColumnFiledWidth = leftColumnFiledWidth;
		me.rightColumnFiledWidth = rightColumnFiledWidth;
		me.currentWidth = me.width - leftColumnFiledWidth*1 - rightColumnFiledWidth*1;
		
		me.scrollBarHeight=me.fieldDomObj.clientHeight-me.height;
		me.backPanel.css("width",me.width).css("height",me.height);
		me.field.css("width",me.currentWidth).css("height",me.height);
		me.middleField.css("width",me.currentWidth).css("height",me.height);
		me.selectMiddleRow.css("width",me.currentWidth);
		me.selectTopRow.css("width",me.currentWidth);
		me.selectBottomRow.css("width",me.currentWidth);
		me.viewField.css("width",me.currentWidth).css("height",me.height);
		me.leftColumnFiled.css("width",leftColumnFiledWidth).css("height",me.height);
		me.numberFiled.css("width",me.LeftBarAWidth).css("height",me.height);
		me.rowNumRowHilight.css("width",me.LeftBarAWidth);
		me.rightColumnFiled.css("width",rightColumnFiledWidth).css("height",me.height);
		//alert("aaa"+me.scrollBarHeight);
	},
	setStanderdCSSops:function(jQobj){
		return jQobj.css("line-Height",this.lineHeight+"px").css("font-size",this.fontSize+"px").css("font-family",this.fontFamily).css("word-spacing",this.wordSpacing).css("overflow","hidden").css("text-wrap","none").css("padding","0px").css("margin","0px");
	},
	createTextField:function(me){
		if(me.textField===undefined){
			me.textField = $("<textarea class='"+me.id+"textarea' wrap='off'></textarea>").css("position",'relative').css("overflow","hidden").css("word-break","keep-all").css("height",me.height);
			me.middleField.prepend(me.textField);
			me.textField.bind('keyup',{"self":me},me.onInput);
			me.textField.bind('click',{"self":me},me.focusOnTextArea);
			me.middleField.bind('mousemove',{"self":me},me.onMouseMove);
			me.textField.bind('keyup',{"self":me},me.onInput);
			me.field.bind('scroll',{"self":me},me.onScroll);
			me.textField.bind('blur',{"self":me},me.onBlur);
			me.textFieldDomObj = me.textField.get(0);//;
			me.textFieldDomObj.addEventListener('compositionstart',this.onCompositionX,false);
			me.textFieldDomObj.addEventListener('compositionupdate',this.onCompositionX,false);
			me.textFieldDomObj.addEventListener('compositionend',this.onCompositionX,false);
			me.textField.css("display",'block').css("border-style","solid").css("border-width","1px").css("border-color","blue").css("opacity",0.0)
			.css("z-index","200").css("width",me.width).css("line-Height",this.lineHeight+"px").css("font-size",this.fontSize+"px").css("font-family",me.fontFamily)
			.css("word-spacing",this.wordSpacing).css("letter-spacing",this.letterSpacing).css("top",me.textareaOffsetTop).css("left",me.textareaOffsetLeft);
			me.viewArea.bind('click',{"self":me},me.onClickCodeMap);
			me.viewArea.bind('mousedown',{"self":me},me.onMouseDownCodeMap);
			me.viewArea.bind('mouseup',{"self":me},me.onMouseUpCodeMap);
			me.viewArea.bind('mouseout',{"self":me},me.onMouseOutCodeMap);
			me.viewArea.bind('mousemove',{"self":me},me.onDragCodeMap);
		}
	},
	onBlur:function(event){
		var me = event.data.self;
		me.selectTopRow.css("visibility","visible");
	},
	onScroll:function(event){
		var me = event.data.self;
		me.numberFiled.css("height",me.middleFieldDomObj.height-me.scrollBarHeight);
		me.showViewArea(me);
		me.leftColumnFiledDomObj.scrollTop=me.fieldDomObj.scrollTop;
	},
	onClickCodeMap:function(event){
		var me = event.data.self;	
		
	},
	onMouseDownCodeMap:function(event){//mousemove
		var me = event.data.self;	
		me.isDorgableCodeMap = true;
		me.startClickYCodeMap = event.clientY;
		me.startTopCodeMap = me.viewArea.position().top;
		me.viewArea.css("cursor","move");
	},
	onMouseUpCodeMap:function(event){//mousemove
		var me = event.data.self;
		me.isDorgableCodeMap = false;
		me.viewArea.css("cursor","pointer");
	},
	onMouseOutCodeMap:function(event){//mousemove
		var me = event.data.self;	
		me.isDorgableCodeMap = false;
		me.viewArea.css("cursor","pointer");
	},
	onDragCodeMap:function(event){//mousemove
		var me = event.data.self;	
		var moveY = event.clientY - me.startClickYCodeMap ;
		me.viewArea.css("cursor","move");
		me.adjustViewArea(me,moveY);
	},
	onClick:function(event){
		var me = event.data.self;
		me.onSelect(event);
	},
	onCompositionX:function(event){
		var me = HilightingEditorGrobalSelfPointer;
		me.compositionupdateData = event.type ==="compositionstart" || event.type ==="compositionupdate" || event.type ==="compositionend" ?event.data:undefined;
		console.log("☆★★★★"+me.compositionupdateData+"/me:"+" / me.isCompositionupdate:"+me.isCompositionupdate);
		me.isCompositionupdate = true;
		me.onInput(event);
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
		var x =event.clientX;
		var y =event.clientY;
		if(me.preX!==x || me.preY!==y){
			me.onSelect(event);
		}
		me.preX=x;
		me.preY=y;
	},
	onSelect:function(event){
		//console.log("☆★★★★★★★★☆"+event.type);
		var me = event.data.self;
		me = me===undefined ? HilightingEditorGrobalSelfPointer:me;
		me.viewField.css("cursor","wait");
		var selection = window.getSelection();
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
		var nowTextWidth = rows[me.rowNum-1]===""?0:me.culcTextWidth(me,rows[me.rowNum-1],x);
		var textWidth = me.textWidth!==undefined ?me.textWidth :nowTextWidth;
		if(textWidth!==undefined && me.nowKeyInput === true){
			newX = textWidth;
		}else{
			newX = nowTextWidth;
		}
		if(me.rowNum <1) me.rowNum = 1;
		var scrollY = 0+me.CurrentOffsetTop;//me.field.scrollTop();
		var scrollX = 0;//-me.leftColumnFiledWidth;//me.field.scrollLeft();
		//--------------------------------------------------------
		var start = me.textField.get(0).selectionStart; 
		var end = me.textField.get(0).selectionEnd ;
		var rowsStart = me.doc.substring(0,start).split("\n");
		var rowsEnd = me.doc.substring(0,end).split("\n");
		var startPreCaret = rowsStart[rowsStart.length-1];
		var areaStartCharNo	=startPreCaret.length;
		var areaStartRowNo	=rowsStart.length;
		var areaEndCharNo	=rowsEnd[rowsEnd.length-1].length;
		var areaEndRowNo	=rowsEnd.length;
		
		me.CurrentRowNum = areaStartRowNo;
		me.rowNumRowHilight.css("top",(me.CurrentRowNum-1) * me.lineHeight);
		if(rowsStart.length*me.lineHeight >= (me.height+me.fieldDomObj.scrollTop)-me.lineHeight && me.nowKeyInput === true){
			me.fieldDomObj.scrollTop += me.lineHeight*2;
			
		}
			console.log("☆★★★★☆ me.fieldDomObj.scrollTop:"+me.fieldDomObj.scrollTop+"/rowsStart:"+rowsStart.length+"/rows.length:"+rows.length);
		//--------------------------------------------------------
		var offsetLeft= (startPreCaret===""?0:(me.culcTextWidth(me,startPreCaret)-me.culcTextWidth(me,startPreCaret,"textarea"))*1)+1;
		//--------------------------------------------------------
		
		var rowNumDiff = areaEndRowNo-areaStartRowNo ;
		var textSelectStart = rows[areaStartRowNo-1]===undefined ? "":rows[areaStartRowNo-1];
		var textSelectEnd = rows[areaEndRowNo-1];
		textSelectEnd = textSelectEnd===undefined ?textSelectStart:textSelectEnd;
		
		var textOffsetStart = areaStartCharNo===0?0:me.culcTextWidth(me,textSelectStart.substring(0,areaStartCharNo));
		var textWidthEnd = areaEndCharNo===0?0:me.culcTextWidth(me,textSelectEnd.substring(0,areaEndCharNo));
		
		if( textSelectEnd-textSelectStart <3 && rowNumDiff===0 && (me.nowKeyInput === false && event.shiftKey===false && event.ctrlKey===false)){
			me.isMouseDown==false;
			me.nowMouseDown==false ;
			me.selectMiddleRow.css("visibility","hidden");
			me.selectBottomRow.css("visibility","hidden");
			me.isMouseDown=false;
			me.isNowSelecting=false;
		}
		
		me.compositionupdateBox.text("");
		var rowAdjust = -1.2;
		var caretTop =(areaEndRowNo+rowAdjust)*me.lineHeight-me.selectedRowMiddleOffset +2+scrollY;
		if(me.compositionupdateBox !==undefined){
			//console.log("☆★★★★☆ me.compositionupdateData:"+me.compositionupdateData);
			var compositionOffsetWidth = me.culcTextWidth(me,me.compositionupdateData);
			me.compositionupdateBox.text(me.compositionupdateData);
			me.compositionupdateBox.css("left",textOffsetStart+scrollX-compositionOffsetWidth);
			me.compositionupdateBox.css("top",caretTop+me.lineHeight+3);
			me.compositionupdateBox.css("width",me.compositionupdateData===""?0:compositionOffsetWidth);
			me.compositionupdateBox.css("visibility","visible");
		}else{	
			me.compositionupdateBox.css("visibility","hidden");
		}
		//Caret
		if(areaStartCharNo == areaEndCharNo){
			me.selectTopRow.css("width",0).css("visibility","visible").css("left",textOffsetStart-0+scrollX);
		}
		me.selectTopRow.css("top",caretTop);
		console.log("☆☆☆★★☆ areaStartCharNo:"+areaStartCharNo+"/areaEndCharNo:"+areaEndCharNo+"/areaEndRowNo:"+areaEndRowNo+"/caretTop:"+caretTop+"/scrollY:"+scrollY);
		
		if(me.nowMouseDown===true){
			me.culcTextWidth(me,rows[me.rowNum-1],x);
			me.selectStartRows=me.rowNum;
			me.selectStartChars=me.offsetOnRow;
			me.selectMiddleRow.css("visibility","hidden");
			me.selectBottomRow.css("visibility","hidden");
			me.isNowSelecting = false;
			me.isEndNowSelecting=false;
			me.nowSelectedText="";
			console.log("☆☆☆★★☆★☆");
		}else{
			me.isNowSelecting = true;
			me.isEndNowSelecting=true;
			me.selectTopRow.css("visibility","visible");
			me.selectTopRow.css("top",(areaStartRowNo+1+rowAdjust)*me.lineHeight+me.topRowOffset-me.selectedRowTopOffset+scrollY);
			me.selectTopRow.css("left",textOffsetStart+scrollX);
			if(rowNumDiff == 1){
				me.selectTopRow.css("width",me.maxWidth-textOffsetStart);
				me.selectBottomRow.css("visibility","visible");
				me.selectMiddleRow.css("visibility","hidden");
				me.selectBottomRow.css("top",(areaEndRowNo+2+rowAdjust)*me.lineHeight+me.topRowOffset-me.selectedRowBottomOffset+2+scrollY);
				me.selectBottomRow.css("left",scrollX ).css("width",textWidthEnd);
				
				me.nowSelectedText = textSelectStart.substring(areaStartCharNo,textSelectStart.length);
								+ "\n"
								+ me.culcTextWidth(me,textSelectEnd.substring(0,areaEndCharNo));
				console.log("★★★☆☆");
			}else if(rowNumDiff  > 1){
				me.selectTopRow.css("width",me.maxWidth-textOffsetStart);
				me.selectBottomRow.css("visibility","visible");
				me.selectMiddleRow.css("visibility","visible");
				me.selectMiddleRow.css("top",(areaStartRowNo-1+rowAdjust)*me.lineHeight+me.topRowOffset-this.selectedRowMiddleOffset+scrollY);
				me.selectMiddleRow.css("left",scrollX).css("width",me.maxWidth).css("height",((rowNumDiff-1)*me.lineHeight-2));
				me.selectBottomRow.css("top",(areaEndRowNo+2+rowAdjust)*me.lineHeight-me.selectedRowBottomOffset +2+scrollY);
				me.selectBottomRow.css("left",scrollX ).css("width",textWidthEnd);
				me.nowSelectedText = textSelectStart.substring(areaStartCharNo,textSelectStart.length)+ "\n";
				for(var i = 0;i< rowNumDiff-1 ;i++){
					me.nowSelectedText +=rows[areaStartRowNo + i]+ "\n";
				}
				me.nowSelectedText+= textSelectEnd.substring(0,areaEndCharNo);
				console.log("☆★★★☆");
			}else{
				me.selectMiddleRow.css("visibility","hidden");
				me.selectBottomRow.css("visibility","hidden");
				me.selectTopRow.css("width",0).css("visibility","visible");
				
				me.nowSelectedText =textSelectStart.substring(areaStartCharNo,areaEndCharNo);
				var textWidthStart = me.nowSelectedText==="" ? 0:me.culcTextWidth(me, me.nowSelectedText );
				if(areaStartCharNo > areaEndCharNo){
					me.selectTopRow.css("left",textOffsetStart-textWidthStart+scrollX);
				}
				me.selectTopRow.css("width",textWidthStart);
				console.log("☆☆★☆☆");
			}
			//console.log("☆☆☆☆☆");
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
		me.nowKeyInput = false;
		me.isCut=false;
		me.isPeast=false;
		if(me.isNowSelecting===false){
			me.isEndNowSelecting=false;
		}
		me.viewField.css("cursor","text");
	},
	focusOnTextArea:function(event){
		var me = event.data.self;
		if(me.textField!==undefined)me.textField.focus();
	},
	onDelete:function(event){
		var me = event.data.self;
		var k= event.keyCode;
		if(me.keyUpCount >0){
			me.keyUpCount =0;
		}else{
			if(k=="8" || k=="37" || k=="38" || k=="39" || k=="40"  || k=="13" ){//連打
				me.onInput(event);
			}
		}
	},
	onInput:function(event){
		var nowTime = new Date().getTime();
		var me = event.data.self;
		me = me===undefined ? HilightingEditorGrobalSelfPointer:me;
		//console.log("☆★★★★★★★★☆★☆★☆"+me.textField);
		me.viewField.css("cursor","wait");//  
		me.keyUpCount ++;
		var keyCode = event.keyCode;
		var wicth=event.which;
		var modifiers=event.modifiers;
		var x =event.clientX;
		var y =event.clientY;
		var isAddedRow=false;
		var isUp=false;
		var isNotCharKey=false;
		me.isCut=false;
		me.isPeast=false;
		var nowIsMouseDown = me.isMouseDown;
		console.log("keyCode:"+keyCode+"/wicth:"+wicth+"/modifiers:"+modifiers+"/event.ctrlKey:"+event.ctrlKey);
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
		}
		if(keyCode=="13" ){//enter
			me.compositionupdateData="";
		}
		if(me.isCompositionupdate === false ){//enter
			me.compositionupdateData="";
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
		}else
		if(event.shiftKey===true && me.isMouseDown===false){
			me.nowMouseDown=true;
			me.nowKeyInput =true;
			var rows = me.doc.split("\n");
			me.onSelect(event);
			me.nowKeyInput =false;
		}else{
			me.nowMouseDown=false;
		}
		if(event.shiftKey===false && event.ctrlKey===false ){//SHIFT押し以外
			me.selectMiddleRow.css("visibility","hidden");
			me.selectBottomRow.css("visibility","hidden");
			me.isMouseDown=false;
			me.isNowSelecting=false;
		}else{
			me.isMouseDown=true;
		}
		if(keyCode=="67" && event.ctrlKey===true){//Copy
			me.isMouseDown=true;
		}else if(keyCode=="86" && event.ctrlKey===true){//peast
			me.isMouseDown=false;
			me.nowMouseDown=false;
			me.isPeast=true;
		}else if(keyCode=="88" && event.ctrlKey===true){//Cut
			me.isCut=true;
			me.isMouseDown=false;
			me.nowMouseDown=false;
		}
		if(nowTime - me.nowTime > me.timeInterval){
			me.doc = me.textField.val();
			var rows = me.doc.split("\n");
			var lineNum = rows.length;
			me.rowNum = rows.length;
			var doc = ""//me.doc;
			//decolate
			var br = "";
			var numberFiledValue ="";
			for(var i = 0; i<lineNum;i++ ){
				doc += br+ me.SyntaxHilighter.comvertStringToHTML(rows[i]);
				br = "<br />";
			}
			me.viewField.html(doc);//me.doc.replace(/\n/g,"<br />"));
			me.viewField.css("width",me.maxWidth+me.lineHeight);
			me.dellCount =0;
			var height =lineNum*me.lineHeight>200?lineNum*me.lineHeight:200;
			me.viewField.css("height",height);
			me.textField.css("height",height);
			var editorHeight = height+me.lineHeight*2;
			me.middleField.css("height",editorHeight);
			if(lineNum !== me.lastLineNum){
				var startLineNum = 10000+lineNum;
				br = "";
				for(var j = 10001; j<=startLineNum;j++ ){
					numberFiledValue+=br+(j+"").substring(1,5);
					br = "<br />";
				}
				me.numberFiled.html(numberFiledValue);
				me.lastLineNum = lineNum;
				me.numberFiled.css("height",editorHeight-me.scrollBarHeight);
				
				me.showViewArea(me,true);
			}else{
				me.showViewArea(me);
			}
			//console.log("☆★★★★☆★☆★☆★☆★☆"+me.fieldDomObj.scrollTop+"/"+me.leftColumnFiledDomObj.scrollTop);
			var height2 =height>200?(lineNum)*me.lineHeight*2-200:200;
			me.CurrentOffsetTop= -(height2-200)*1;
			me.viewField.css("top", - height*1);
			me.nowKeyInput = true;
			me.onSelect(event);
			me.nowKeyInput = false;
			me.textField.focus();
			me.leftColumnFiledDomObj.scrollTop=me.fieldDomObj.scrollTop;
			
			me.textField.css("width",me.width );
			var newWidthTextarea = me.textFieldDomObj.scrollWidth+100;
			if(me.width < newWidthTextarea){
				me.textField.css("width",newWidthTextarea);
			}
			me.viewField.css("width",me.width<=newWidthTextarea ?newWidthTextarea :me.width);
			me.middleField.css("width",me.width<=newWidthTextarea ?newWidthTextarea :me.width);
		}
		else{
			//me.timer = setTimeout(function(){me.onInput(event);},me.timeInterval+10);
		}
		me.isCompositionupdate =false;
		me.textField.focus();
		me.viewField.css("cursor","text");
	},
	culcTextWidth:function(me,text,target,flag ){
		var chars = text===undefined ?[]:text.split("");
		if(chars.length <1){
			return 0;
		}
		var ret = 0;
		var widthMap = target === "textarea" ? me.mansikiTextareaWidthArray :me.mansikiTextWidthArray ;
		var charMeasur = target === "textarea" ? me.searchTheCharWidthOnTextArea:me.searchTheCharWidth;
		for(var i = 0 ; i< chars.length ;i++){
			var char = chars[i];
			var width = widthMap[char];
			if(width ===undefined || isNaN(NaN)){
				width = charMeasur(me,char);
				widthMap[char] = width;
			}
			var preret = ret;
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
		me.charBox.html(me.SyntaxHilighter.comvertStringToHTML(char));
		width = me.charBoxDomObj.scrollWidth;
		return width;
	},
	culcTextWidthTextArea :function(me,preCaret){
		var width = 0;
		me.charBoxTextarea.css("width",0);
		me.charBoxTextarea.val(preCaret);
		width = me.charBoxTextareaDomObj.scrollWidth;
		return width;
	}, 
	searchTheCharWidthOnTextArea:function(me,char){
		var width = 0;
		me.charBoxTextarea.text(char);
		width = me.charBoxTextareaDomObj.scrollWidth;
		return width;
	},
	showViewArea:function(me,isRacioMove){
			//console.log("☆★★★★☆ isRacioMove:"+isRacioMove);
		var scrollTop  = me.fieldDomObj.scrollTop;
		if(isRacioMove===true){
			var heightAll = me.numberFiledDomObj.clientHeight;
			var heightView = me.fieldDomObj.clientHeight;
			var viewAreaRecio = heightView/heightAll;
			this.viewAreaRecio = viewAreaRecio;
			me.viewArea.css("height",viewAreaRecio*heightView);
			//console.log("☆★★★★☆★☆★☆★☆★☆"+heightView+"/"+viewAreaRecio);
		}
		me.viewArea.css("top",me.viewAreaRecio*scrollTop);
	},
	adjustViewArea:function(me,moveY){
		var top = me.startTopCodeMap+moveY;
		top = top < 0 ? 0 :top;
		top = top+me.viewArea.height()> me.fieldDomObj.clientHeight ? me.fieldDomObj.clientHeight-me.viewArea.height():top;
		me.viewArea.css("top",top);
		//console.log("☆★☆★★★ top :"+top+"/j:"+me.viewArea.height());
		me.fieldDomObj.scrollTop = top /me.viewAreaRecio;
	}
	
}
