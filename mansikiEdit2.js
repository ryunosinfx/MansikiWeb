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
}

HilightingEditor.prototype={
	init:function(){
		this.charBox = $("<div id='"+this.prefix+"charBox'></div>").css("width","0px").css("position","absolute").css("opacity",0).css("overflow","hidden");
		var field = $("<div id='"+this.prefix+this.prefix+"'></div>").css("width",this.width).css("height",this.height)
			.css("border-width","1px").css("border-style","solid").css("border-coloer","green").css("overflow","scroll").css("text-wrap","none")
			.css("cursor","text").css("line-Height",this.lineHeight+"px");
		var selectTopRow = $("<div id='"+this.prefix+this.prefix+"selectTopRow'></div>").css("width",this.width).css("height",this.height)
			.css("border-width","1px").css("border-style","solid").css("border-coloer","blue").css("overflow","hidden").css("background-color","blue")
			.css("top",0-this.height).css("opacity",0.5).css("width",this.width).css("height",this.lineHeight).css("position","relative").css("z-index","150");
		var selectMiddleRow = $("<div id='"+this.prefix+this.prefix+"selectMiddleRow'></div>").css("width",this.width).css("height",this.height)
			.css("border-width","1px").css("border-style","solid").css("border-coloer","green").css("overflow","hidden").css("background-color","green")
			.css("top",0-this.height).css("opacity",0.5).css("width",this.width).css("height",this.lineHeight).css("position","relative").css("z-index","150");
		var selectBottomRow = $("<div id='"+this.prefix+this.prefix+"selectBottomRow'></div>").css("width",this.width).css("height",this.height)
			.css("border-width","1px").css("border-style","solid").css("border-coloer","gray").css("overflow","hidden").css("background-color","orange")
			.css("top",0-this.height).css("opacity",0.5).css("width",this.width).css("height",this.lineHeight).css("position","relative").css("z-index","150");
		var selectTextarea = $("<textarea id='"+this.prefix+this.prefix+"selectTextarea'></textarea>").css("visibility","hidden").val("aaa");
		this.ancer.append(field);
		var viewField = $("<div id='"+this.prefix+this.prefix+"View'></div>").css("width",this.width).css("height",this.height)
			.css("line-Height",this.lineHeight+"px")
			.css("overflow","hidden").css("text-wrap","none").css("position","relative").css("top",-this.lineHeight*2).css("z-index","100").css("cursor","text");
			
		this.field = field;
		field.append(viewField);
		field.append(selectTopRow);
		field.append(selectBottomRow);
		field.append(selectMiddleRow);
		field.append(selectTextarea);
		field.bind('keyup',{"self":this},this.onKeyHack);
		field.bind('mousedown',{"self":this},this.onMouseDown);
		field.bind('mouseup',{"self":this},this.onMouseUp);
		field.bind('mousemove',{"self":this},this.onMouseMove);
		field.bind('click',{"self":this},this.onClick);
		this.ancer.append(this.charBox);
		this.charBoxDomObj = document.getElementById(this.prefix+"charBox");
		//alert("this.charBoxDomObj;"+this.charBoxDomObj);
		this.viewField = viewField;
		this.selectTopRow = selectTopRow;
		this.selectMiddleRow = selectMiddleRow;
		this.selectBottomRow = selectBottomRow;
		this.selectTextarea = selectTextarea;
		this.selectTopRow.css("visibility","hidden");
		this.selectMiddleRow.css("visibility","hidden");
		this.selectBottomRow.css("visibility","hidden");
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
		me.nowMouseDown = false;
	},
	onMouseMove:function(event){
		var me = event.data.self;
		me.nowMouseDown = false;
		if(me.isMouseDown===true){
			me.onSelect(event);
		}
	},
	onSelect:function(event){
		var me = event.data.self;
		me.viewField.css("cursor","wait");
		var selection = window.getSelection();
		selection.removeAllRanges();
		var keyCode = event.keyCode;
		var wicth=event.which;
		var modifiers=event.modifiers;
		var x =event.clientX;
		var y =event.clientY;
		me.createTextField(me);
		me.rowNum = me.nowKeyInput === false ?Math.floor((y+me.topOffset)/me.lineHeight)+1:me.rowNum;
		var rows = me.doc.split("\n");
		var newX = 0;
		if(rows.length < me.rowNum){
			newX = 0;
			me.rowNum = rows.length;
		}
		var textWidth = me.textWidth!==undefined ?me.textWidth :me.culcTextWidth(me,rows[me.rowNum-1],x);
		if(textWidth!==undefined){
			newX = textWidth;
		}else{
			newX = x;
		}
		me.viewField.get(0).selectionStart = 0;
		me.viewField.get(0).selectionEnd = 10;
		
		var areaStartRowNo =me.rowNum; 
		var areaStartCharNo =me.offsetOnRow; 
		var areaEndRowNo =me.rowNum; 
		var areaEndCharNo =me.offsetOnRow;
		
		//select処理
		console.log("me.isMouseDown:"+me.isMouseDown+"/me.nowMouseDown:"+me.nowMouseDown+"/event.shiftKey:"+event.shiftKey+"/event.ctrlKey:"+event.ctrlKey
			+"/me.nowKeyInput:"+me.nowKeyInput+"/me.isCut:"+me.isCut);
			
		areaStartCharNo = areaStartRowNo > me.selectStartRows ? me.selectStartChars : areaStartCharNo ;
		areaEndCharNo = areaStartRowNo > me.selectStartRows ? areaEndCharNo:me.selectStartChars;
		areaStartRowNo = areaStartRowNo > me.selectStartRows ? me.selectStartRows : areaStartRowNo;
		areaEndRowNo = areaEndRowNo < me.selectStartRows ? me.selectStartRows : areaEndRowNo;
		var rowNumDiff = areaEndRowNo-areaStartRowNo ;
		var textSelectStart = rows[areaStartRowNo-1]===undefined ? "":rows[areaStartRowNo-1];
		var textSelectEnd = rows[areaEndRowNo-1];
		textSelectEnd = textSelectEnd===undefined ?textSelectStart:textSelectEnd;
		var textOffsetStart = me.culcTextWidth(me,textSelectStart.substring(0,areaStartCharNo));
		var textWidthEnd = me.culcTextWidth(me,textSelectEnd.substring(0,areaEndCharNo));
			
		if(me.isMouseDown===false && me.nowMouseDown===false 
		|| me.isMouseDown===false && (me.nowKeyInput === false || event.shiftKey===false && event.ctrlKey===false)){
			//me.selectStartRows=-1;
			//me.selectStartChars=-1;
			var retText="";
			if(rowNumDiff == 1){
				if(me.isCut === true){
					rows[areaStartRowNo-1]=textSelectStart.substring(0,areaStartCharNo);
					rows[areaEndRowNo-1]=textSelectEnd.substring(areaEndCharNo,textSelectEnd.length);
				}
			}else if(rowNumDiff  > 1){
				if(me.isCut === true){
					rows[areaStartRowNo-1]=textSelectStart.substring(0,areaStartCharNo);
					for(var i = 0;i< rowNumDiff-1 ;i++){
						rows[areaStartRowNo + i]="";
					}
					rows[areaEndRowNo-1]=textSelectEnd.substring(areaEndCharNo,textSelectEnd.length);
				}
			}else{
				if(me.isCut === true){
					rows[areaStartRowNo-1]=textSelectStart.substring(0,areaStartCharNo)+textSelectStart.substring(areaEndCharNo,textSelectStart.length);
		console.log("☆"+rows[areaStartRowNo-1]);
				}
			}
			for(var i=0;i<rows.length ;i++){
				if(rows[i]!==undefined){
					
				}
			}
			me.doc=rows.join("\n");
		}else if(me.nowMouseDown===true){
			me.selectStartRows=me.rowNum;
			me.selectStartChars=me.offsetOnRow;
			me.selectTopRow.css("visibility","hidden");
			me.selectMiddleRow.css("visibility","hidden");
			me.selectBottomRow.css("visibility","hidden");
			me.nowSelectedText="";
		}else{
			//console.log("CCCCCCCCCC rowNumDiff:"+rowNumDiff+"/me.selectStartChars:"+me.selectStartChars+"/textWidthEnd:"
			//	+textWidthEnd+"/me.selectStartRows :"+me.selectStartRows +"/me.offsetOnRow:"+me.offsetOnRow
			//	+"/me.rowNum:"+me.rowNum);
			me.selectTopRow.css("visibility","visible");
			me.selectTopRow.css("top",(areaStartRowNo-1)*me.lineHeight+me.topRowOffset-this.selectedRowTopOffset);
			
			me.selectTopRow.css("left",textOffsetStart);
			if(rowNumDiff == 1){
				me.selectTopRow.css("width",me.maxWidth-textOffsetStart);
				me.selectBottomRow.css("visibility","visible");
				me.selectMiddleRow.css("visibility","hidden");
				me.selectBottomRow.css("top",(areaEndRowNo)*me.lineHeight+me.topRowOffset-this.selectedRowBottomOffset+2);
				me.selectBottomRow.css("left",0 ).css("width",textWidthEnd);
				
				me.nowSelectedText = textSelectStart.substring(areaStartCharNo,textSelectStart.length);
								+ "\n"
								+ me.culcTextWidth(me,textSelectEnd.substring(0,areaEndCharNo));
			//console.log("DDDD rowNumDiff:"+rowNumDiff+"/areaStartRowNo:"+areaStartRowNo+"/areaEndRowNo:"
			//	+areaEndRowNo+"/me.selectStartRows :"+me.selectStartRows +"/me.selectStartChars:"+me.selectStartChars
			//	+"/me.rowNum:"+me.rowNum);	
			}else if(rowNumDiff  > 1){
				me.selectTopRow.css("width",me.maxWidth-textOffsetStart);
				me.selectBottomRow.css("visibility","visible");
				me.selectMiddleRow.css("visibility","visible");
				me.selectMiddleRow.css("top",(areaStartRowNo-1)*me.lineHeight+me.topRowOffset-this.selectedRowMiddleOffset);
				me.selectMiddleRow.css("left",0).css("width",me.maxWidth).css("height",((rowNumDiff-1)*me.lineHeight-2));
				me.selectBottomRow.css("top",(areaEndRowNo)*me.lineHeight-this.selectedRowBottomOffset +2);
				me.selectBottomRow.css("left",0 ).css("width",textWidthEnd);
			//console.log("EEEE rowNumDiff:"+rowNumDiff+"/areaStartRowNo:"+areaStartRowNo+"/areaEndRowNo:"
			//	+areaEndRowNo+"/me.selectStartRows :"+me.selectStartRows +"/me.selectStartChars:"+me.selectStartChars
			//	+"/me.rowNum:"+me.rowNum);
				me.nowSelectedText = textSelectStart.substring(areaStartCharNo,textSelectStart.length)+ "\n";
				for(var i = 0;i< rowNumDiff-1 ;i++){
					me.nowSelectedText +=rows[areaStartRowNo + i]+ "\n";
				}
				me.nowSelectedText+= textSelectEnd.substring(0,areaEndCharNo);
			}else{
				me.selectMiddleRow.css("visibility","hidden");
				me.selectBottomRow.css("visibility","hidden");
				me.nowSelectedText =textSelectStart.substring(areaStartCharNo,areaEndCharNo);
				var textWidthStart = me.culcTextWidth(me, me.nowSelectedText );
				if(areaStartCharNo > areaEndCharNo){
					me.selectTopRow.css("left",textOffsetStart-textWidthStart);
			//		console.log("FFFF areaStartCharNo:"+areaStartCharNo+"/textOffsetStart-textWidthStart:"+(textOffsetStart-textWidthStart)+"/areaEndCharNo:"
			//	+areaEndCharNo+"/me.newX :"+newX +"/me.textOffsetStart:"+textOffsetStart
			//	+"/textWidthStart:"+textWidthStart);
				}
				me.selectTopRow.css("width",textWidthStart);
			}console.log("☆☆☆☆☆");
		}
		me.selectTextarea.val(me.nowSelectedText);
	//	console.log("XXXXXXXX me.selectStartRows:"+me.selectStartRows+"/me.selectStartChars:"+me.selectStartChars+"/me.rowNum:"+me.rowNum
	//		+"/me.isMouseDown:"+me.isMouseDown+"/me.nowMouseDown:"+me.nowMouseDown+"/event.shiftKey:"+event.shiftKey
	//		+"/event.ctrlKey:"+event.ctrlKey+"/me.nowSelectedText:"+me.nowSelectedText);
		if(me.rowNum <1) me.rowNum = 1;
		if(newX <0) newX = 0;
		me.textField.css("top",(me.rowNum-1)*me.lineHeight+me.topRowOffset);
		me.textField.css("left",newX+me.leftOffset-0);
		me.textField.val(me.nowSelectedText).focus();
		selection.selectAllChildren(me.textField.get(0));
		me.textWidth=undefined ;
		me.nowKeyInput = false;
		me.viewField.css("cursor","text");
	},
	createTextField:function(me){
		if(me.textField===undefined){
			me.textField = $("<textarea class='"+me.id+"textarea'></textarea>").css("position",'relative').css("overflow","hidden").css("word-break","keep-all");
			me.field.prepend(me.textField);
			me.field.bind('keydown',{"self":me},me.onDelete);
			me.field.bind('keyup',{"self":me},me.onInput);
		}
		me.textField.css("display",'block').css("border-style","solid").css("border-width","1px").css("border-color","blue").css("opacity",0.5)
			.css("height",me.lineHeight*2).css("z-index","200");
	},
	onDelete:function(event){
		var me = event.data.self;
		var k= event.keyCode;
		console.log("keyCode:"+event.keyCode+"/me.keyUpCount:"+me.keyUpCount);
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
		me.isCut=false;
		console.log("keyCode:"+keyCode+"/wicth:"+wicth+"/modifiers:"+modifiers+"/event.ctrlKey:"+event.ctrlKey);
		if(keyCode=="38" && me.rowNum>1){//up
			me.rowNum--;
			isUp = true;
		}
		if(keyCode=="40" && me.rowNum < me.rowCount){//down
			me.rowNum++;
			isAddedRow=true;
			console.log("XXXX1 me.rowNum:"+me.rowNum+"/me.offsetOnRow:"+me.offsetOnRow+"/text:"+text+"/isAddedRow:"+isAddedRow);
		}
		if(keyCode=="37" && me.offsetOnRow >= 0){//left
			me.offsetOnRow--;
		}
		if(keyCode=="39" ){//right
			me.offsetOnRow++;
		}
		if(keyCode=="8" ){//delete
			me.dellCount++;
		}
		if(keyCode=="13" ){//enter
			me.retCount++;
		}
		
		if(event.ctrlKey===true){
			me.selectTextarea.focus();
		}else{
			me.textField.focus();
		}
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
		if(event.shiftKey===false && event.ctrlKey===false){//SHIFT押し以外
			me.selectTopRow.css("visibility","hidden");
			me.selectMiddleRow.css("visibility","hidden");
			me.selectBottomRow.css("visibility","hidden");
			me.isMouseDown=false;
		}else{
			me.isMouseDown=true;
		}
		var text = me.textField.val();
		if(keyCode=="67" && event.ctrlKey===true){//Copy
			me.clipBoard=me.nowSelectedText;
			//me.clipTime=new Date().getTime();
			text="";
			me.textField.val("");
			me.isMouseDown=true;
		}else if(keyCode=="86" && event.ctrlKey===true){//peast
			me.isMouseDown=false;
			me.nowMouseDown=false;
			me.textField.val("");
		}else if(keyCode=="88" && event.ctrlKey===true){//Cut
			me.isCut=true;
			me.isMouseDown=false;
			me.nowMouseDown=false;
			text="";
			me.textField.val("");
		}else if(event.ctrlKey===true){//Ctl
			text="";
			me.textField.val("");
		}
		if(nowTime - me.nowTime > me.timeInterval){
			
			me.textField.val("");
			//console.log("CCCCCCC1 me.rowNum:"+me.rowNum+"/me.offsetOnRow:"+me.offsetOnRow+"/text:"+text+"/event.shiftKey:"+event.shiftKey);
			//console.log("retCount:"+me.retCount+"/me.dellCount:"+me.dellCount+"/offsetOnRow:"+me.offsetOnRow);
			var addRowCount = text.split("\n").length-1;
			me.rowNum +=addRowCount;
			var rows = me.doc.split("\n");
			var rowUpOffset = 0;
			var rowUp = 0;
			
			//console.log("CCCCCCC2 me.rowNum:"+me.rowNum+"/me.offsetOnRow:"+me.offsetOnRow+"/addRowCount:"+addRowCount);
			if(text.length < 1){//FreeCaret
				if(rows[me.rowNum-1]!== undefined && me.rowNum < me.rowCount && me.offsetOnRow > rows[me.rowNum-1].length && isAddedRow===false && isUp===false){
					me.rowNum++;
					me.offsetOnRow=0;
				}
			//console.log("CCCCCCC3a me.rowNum:"+me.rowNum+"/me.offsetOnRow:"+me.offsetOnRow+"/preCaret:"+preCaret);
				if(rows[me.rowNum-2]!== undefined && rows[me.rowNum-1]!== undefined && me.rowNum > 0 && me.rowCount > 0 && me.offsetOnRow < 0){
					me.rowNum--;
					me.offsetOnRow = rows[me.rowNum-1].length + me.offsetOnRow+1;
				}
			//console.log("CCCCCCC3b me.rowNum:"+me.rowNum+"/me.offsetOnRow:"+me.offsetOnRow+"/preCaret:"+preCaret);
				if(rows[me.rowNum-2]!== undefined && rows[me.rowNum-1]!== undefined && me.rowNum > 0 && me.rowCount > 0 
					&& me.offsetOnRow  > rows[me.rowNum-1].length && isUp===false){
					me.offsetOnRow = rows[me.rowNum-2].length ;
					me.rowNum--;
				}
			}
			if(rows[me.rowNum]!==undefined){
				if(isAddedRow===true && me.offsetOnRow > rows[me.rowNum].length){
					me.rowNum++;
				}
			}
			//console.log("CCCCCCC4 me.rowNum:"+me.rowNum+"/me.offsetOnRow:"+me.offsetOnRow+"/preCaret:"+preCaret);
			if(rows[me.rowNum-1]!==undefined && me.offsetOnRow > rows[me.rowNum-1].length && addRowCount < 1){
				me.offsetOnRow = rows[me.rowNum-1].length;
			}
			
			//console.log("CCCCCCC5 me.rowNum:"+me.rowNum+"/me.offsetOnRow:"+me.offsetOnRow+"/preCaret:"+preCaret);
			if(me.dellCount > 0){
				var charCount = 0;
				var preCharCount = 0;
				var lfCount = 0;
				if(me.rowNum > 1 && me.offsetOnRow  < 1){
					me.rowNum--;
					me.offsetOnRow = rows[me.rowNum-1].length;
					rowUpOffset++;
				}
				for(var j = me.rowNum ; j >0  ;j--){
					preCharCount = charCount;
					lfCount = 1;
					if(rows[j-1]===undefined) break;
					charCount += rows[j-1].length + lfCount;
					if(me.offsetOnRow - charCount <0){
						break;
					}
					rowUpOffset++;
					rowUp++;
				}
				me.dellCount -=preCharCount;
				if(me.rowNum > rowUp){
					me.rowNum-=rowUp;
				}else{
					me.rowNum=1;
				}
			}
			
			//console.log("CCCCCCCxx me.rowNum:"+me.rowNum+"/me.offsetOnRow:"+me.offsetOnRow+"/preCaret:"+preCaret);
			if(me.retCount>0 && addRowCount >0){
				var preOnRow = rows[me.rowNum-2] ===undefined ? "":rows[me.rowNum-2];
				var offsetPreOnRow = me.offsetOnRow < preOnRow.length ?  me.offsetOnRow : preOnRow.length;
				rows[me.rowNum-2]=preOnRow.substring(0,offsetPreOnRow-me.dellCount)
					+text+preOnRow.substring(offsetPreOnRow-me.dellCount,preOnRow.length);
				me.offsetOnRow =0;
			//console.log("AAAAAAAAAAA offsetPreOnRow:"+offsetPreOnRow+"/me.offsetOnRow:"+me.offsetOnRow+"/preOnRow:"+preOnRow);
			}else{
				var testOnRow = rows[me.rowNum-1] ===undefined ? "":rows[me.rowNum-1];
				var offsetOnRow = me.offsetOnRow <testOnRow.length ? me.offsetOnRow : testOnRow.length;
				var preCaret = testOnRow.substring(0,offsetOnRow-me.dellCount+rowUpOffset)+text;
				rows[me.rowNum-1]= preCaret+testOnRow.substring(offsetOnRow,testOnRow.length);
			//console.log("BBBBBBBBBBB offsetOnRow:"+offsetOnRow+"/me.offsetOnRow:"+me.offsetOnRow+"/preCaret:"+preCaret);
			}
			
			var resultText = "";
			var lf = "";
			
			for(var n = 0 ;n<rows.length;n++){
				var rowtext = rows[n];
				if(me.dellCount>0 && n < me.rowNum + rowUpOffset &&  n >= me.rowNum ){//Del
					resultText += rowtext;
				}else{
					resultText += lf;
					if(n === me.rowNum-1){
						if(me.retCount>0){
							resultText+=rowtext.substring(0,me.offsetOnRow);
							for(var m=0 ;m<rowUpOffset-1;m++){
								resultText+="\n";
							}
							resultText+=rowtext.substring(me.offsetOnRow,rowtext.length);
						}else{
							resultText += rowtext;
						}
					}else{
						resultText += rowtext;
					}
				}
				lf = "\n";
			}
			me.doc = resultText;
			var rows2 = me.doc.split("\n");
			me.rowCount = rows2.length;
			var isMod=false;
			if(addRowCount > 0){//改行入り
				for(var i = 0; i< addRowCount ;i++){
					var currentRowWidth = me.culcTextWidth(me,rows2[me.rowNum-1+i]);
					if(currentRowWidth > me.maxWidth ){
						me.maxWidth=currentRowWidth;
						isMod=true;
					}
				}
			}else if (text.length > 0){//改行なし
				var currentRowWidth = me.culcTextWidth(me,rows2[me.rowNum-1]);
				if(currentRowWidth > me.maxWidth ){
					me.maxWidth=currentRowWidth;
					isMod=true;
				}
			}
			me.textWidth = me.culcTextWidth(me,preCaret);
			//me.textField.css("top",(me.rowNum-1)*me.lineHeight+me.topRowOffset*(me.rowNum-1));
			//me.textField.css("left",me.textWidth+me.leftOffset-0).focus();
			me.nowKeyInput =true;
			me.onSelect(event);
			var doc = me.doc;
			me.viewField.html(me.doc.replace(/\n/g,"<br />"));
			if(isMod===true){
				me.viewField.css("width",me.maxWidth+me.lineHeight);
			}
			me.nowKeyInput = false;
			me.dellCount =0;
			me.retCount=0;
		}
		me.viewField.css("cursor","text");
	},
	culcTextWidth:function(me,text,target){
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
		me.offsetOnRow = chars.length;
		//console.log(me.mansikiTextWidthArray.toSource()+ret+"/"+text);
		return ret ;
	},
	searchTheCharWidth:function(me,char){
		var width = 0;
		me.charBox.text(char);
		width = me.charBoxDomObj.scrollWidth;
		//console.log("width:"+width);
		return width;
	}
	
}

var MansikiKeyMap = function (key,obj){
	this.map={"0":0
		,"13":{}	//enter
		,"16":{}	//shift
		,"16":{}	//shift
		,"17":{}	//Ctrl
		,"32":{}	//space
	}
}
var baseFunc =function(event,executer){
	
}
