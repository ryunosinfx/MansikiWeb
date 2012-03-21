//	alert("here we are!");
var tab ="";
const caretLetter="|";
var HilightingEditor= function(id, width,height){
	this.layerTimes = -4;
	this.className="HilightingEditor";
	this.classIdPrefix =this.className+"_"+id;
	this.fontSize=12;
	this.lineHeight=2+this.fontSize;
	this.baseLineNumWidth = 30;
	this.data = new Array();
	this.dataConverted = new Array();
	this.nowTime=new Date().getTime();
	this.nowTimeFind=new Date().getTime();
	this.selectedRowsObj=[];
	this.waight=10;
	this.timer;
	this.basicRowColor="#000";
	this.caretRowColor="#FF00E6";
	this.SyntaxHilighter=new SyntaxHilighter();
	MansikiInit();
}

HilightingEditor.prototype={
	init:function(width,height,findInput){
		this.height = height;
		this.width = width;
		this.findInput=findInput;
		
		this.outerParent = $("<div class='"+this.className +"' id='"+this.classIdPrefix +"'></div>").css("overflow","hidden")
			.css("position","relative").width(width+20).height(height+40)
			.append("<div class='lineNum' id='"+this.classIdPrefix +"LineNum'><div class='lineNum' id='"+this.classIdPrefix +"LineNumInner'></div></div>")
			.append("<div class='"+this.classIdPrefix +"Outer' id='"+this.classIdPrefix +"Outer'></div>");
		this.outer = this.outerParent.children("."+this.classIdPrefix +"Outer").eq(0).css("overflow-x","scroll").css("overflow-y","scroll")
			.css("position","relative").width(width-this.baseLineNumWidth).height(height);
		this.outer.append("<div id='"+this.classIdPrefix +"Frame' style='width:"+width+";height:"+height+"'></div>");
		this.frame = this.outer.children("#"+this.classIdPrefix +"Frame").css("overflow","hidden");
		this.frame.append(
				"<textarea class='inputText'></textarea>" 
			+"<div class='viewText' id='"+this.classIdPrefix+"view'></div><div class='caretSpacer'></div>"
			+"<div class='selectionViewText' id='"+this.classIdPrefix+"selectionView'></div>"
			+"<div class='findViewText' id='"+this.classIdPrefix+"findView'></div>"
			+"<div class='caretSpacerUpper'id='"+this.classIdPrefix+"Upper'></div><div class='caret'></div>"
			);
		this.textarea = this.frame.children(".inputText").eq(0).css("letter-spacing","0px").css("word-wrap","keep-all");
		this.textarea2 = $(".inputText2").eq(0);
		this.textarea3 = $(".inputText3").eq(0);
		this.view = this.frame.children(".viewText").eq(0);
		this.selectionView = this.frame.children(".selectionViewText").eq(0);
		this.findView = this.frame.children(".findViewText").eq(0);
		this.lineNum = this.outerParent.children("#"+this.classIdPrefix +"LineNum");
		this.lineNumInner = this.lineNum.children("#"+this.classIdPrefix +"LineNumInner");
		this.caretSpacer = this.frame.children(".caretSpacer").eq(0);
		this.caret = this.frame.children(".caret").eq(0);
		this.caretSpacerUpper = this.frame.children(".caretSpacerUpper").eq(0);
		
		this.textarea
		.css("opacity",0.1).css("height",height).css("z-index",200).css("display","block").css("border","solid transparent 1px")
		.css("font-size",this.fontSize+"px").css("position","relative")
		.css("overflow","hidden").css("line-height",this.lineHeight+"px");
		
		this.view
		.css("opacity",0.5).css("width",(width-this.baseLineNumWidth)+"px")
		.css("height",height).css("z-index",10).css("border","solid 1px green ").css("position","relative")
		.css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("color","blue").css("top",((height)*-1));
		
		this.selectionView
		.css("opacity",0.5).css("width",(width-this.baseLineNumWidth)+"px")
		.css("height",height).css("z-index",12).css("border","solid 1px green ").css("position","relative")
		.css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("color","blue").css("top",((height)*-1));
		
		this.findView
		.css("opacity",0.5).css("width",(width-this.baseLineNumWidth)+"px")
		.css("height",height).css("z-index",11).css("border","solid 1px green ").css("position","relative")
		.css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("color","green").css("top",((height)*-1));
		
		this.lineNum//
		.css("opacity",0.9).css("position","absolute").css("width",this.baseLineNumWidth+"px")
		.css("height",height).css("z-index",210).css("border","solid black 1px")
		.css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden");
		
		this.caretSpacerUpper
		.css("position","relative").css("border","solid  1px yellow").css("z-index",10)
		.css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("padding","0px").css("margin","0px").css("color","red");

		this.caret
		.css("position","relative").css("border","solid 1px blue").css("z-index",10).css("background-color","green")
		.css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("padding","0px").css("margin","0px").css("color","red");
		
		this.caretSpacer
		.css("opacity",0.9).css("position","relative").css("width","0px")
		.css("height",height).css("z-index",15).css("border","solid black 0px")
		.css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("color","white")
		.css("back-ground-color","green").css("white-space","nowrap");
		
		this.textareaWidth = width-this.baseLineNumWidth;
		this.rule = new HilightingSyntaxRule("find","findHilight","",undefined,"STRING","LINE");
		this.findInput.bind("keypress",{"self":this},this.findInTheArea);
		
	},
	onEdit:function(event){
	
		var me = event.data.self;
		var nowTime=new Date().getTime();
		if(nowTime-me.nowTime<100){//指定時間内はスキップ
			me.timer = setTimeout(function(){me.onEdit(event);},10);
			return;
		}
		var text = me.getFormatedTextCRLF(me.textarea.val());
		me.textarea.val(text);
		var list = text.split("\n");
		var domRows = me.view.children(".rows");
		var rowNums = me.lineNumInner.children(".nums");
		var numsHPadding = 2;
		var viewWidthPlus = 0;
		var rowHeight = (me.lineHeight)*1+2;
		var numsWidth = me.baseLineNumWidth-(numsHPadding*2);
		var width = me.view.attr('scrollWidth')-viewWidthPlus*2;
		var maxWidth=me.textareaWidth;
		var currentCaret = me.textarea.get(0).selectionStart;//カーソル位置
		var currentEnd= me.textarea.get(0).selectionEnd;//カーソル位置
		var amountLength = 0;
		var alText="";
		var alText2="";
		me.caretSpacerUpper.width(width-viewWidthPlus).height(rowHeight);	//カーソル上空間
		me.caretSpacer.height(rowHeight-1);								//カーソル左空間
		var nowTotalHeight =list.length*rowHeight+100;
		var isAddedRows= nowTotalHeight>me.height;
		nowTotalHeight=isAddedRows?nowTotalHeight:me.height;
		var topLog="";
		var diff = domRows.length - list.length;
		var offsetYUpper = (me.selectionView.height()*(me.layerTimes*-1)+rowHeight*(isAddedRows && diff > 0 ? me.layerTimes+1:1)+3)*-1;
		var caretRowNo=0;
		var nowCaretLeft=0;
		//行単位で処理
		for(var i= 0;i<list.length;i++){
			var isCaretRow = false;
			var isCaretRowShowed = false;
			var rowText = list[i];					//本来その行に存在する文字列情報
			var domRow = domRows.eq(i).css("background-color",me.basicRowColor);				//行を表示している領域
			var rowTextLength = rowText.length;	//行文字数
			amountLength += rowTextLength;			//カーソル位置ー今までの全行文字数＋行の長さ//行トータルの集計
			maxWidth = maxWidth+2< domRow.width()?domRow.width()+2:maxWidth;
			alText+="/["+i+"]:"+rowTextLength+"@"+currentCaret;
			var atCurrentCaret = currentCaret + rowTextLength - amountLength-i;//キャレット位置
			//alert("a:"+(atCurrentCaret)+"/b:"+rowTextLength+"/i:"+i+"/c:"+rowText);
			if(isCaretRow===false && isCaretRowShowed==false && (0 <= atCurrentCaret && atCurrentCaret <= rowTextLength )){
				isCaretRow=true;
				isCaretRowShowed==true;
				caretRowNo=i;
			}else{
				isCaretRow=false;
			}
			if(me.data.length > i && me.data[i]===rowText && domRow.length > 0 && isCaretRow==false){//データが動いていないかつカーソルの行位以外はスルー
				continue;//次の行を処理する。
			}
			//行単位初期化
			var comverted =me.SyntaxHilighter.comvertStringToHTML(rowText);
			me.dataConverted[i] = comverted;													//データとして変換済みをリストに登録
			var offsetTextLength = 0;
			var rowNum = rowNums.eq(i);//行番号表示
	
			if(domRow.length < 1){//最後尾処理、実際表示に置く。
				me.view.append("<div class='rows' style='width:"+width+"px;'></div>");
				domRows = me.view.children(".rows");
				domRow = domRows.eq(i);//指定の行番号を取得
				domRow.css("line-height",me.lineHeight+"px").css("height",rowHeight-2+"px");//行の高さと実際の高さを指定
			}
			if(rowNum.length < 1){//行番号表示の処理
				me.lineNumInner.append("<div class='nums' style='width:"+numsWidth+"px;padding:0px " + numsHPadding + "px;'></div>");
				rowNums = me.lineNumInner.children(".nums");
				rowNum = rowNums.eq(i);//指定の行番号を取得
				rowNum.css("line-height",me.lineHeight+"px").css("height",(rowHeight-2)+"px");//行の高さと実際の高さを指定
			}
			rowNum.html(i+1);//行番号表示
			
			if(isCaretRow){//var stringAtCaret ="A";//キャレットの表示//caretsカーソル
				alText2+="/["+i+"]:"+rowTextLength;
				domRow = domRows.eq(i).css("background-color",me.caretRowColor);
				var position = domRow.position();//位置を取得
				var topCaret = position.top;//topLog+="/["+i+"]:"+topCaret;
				var left = position.left + rowNum.attr('clientWidth');
				var caretTop = topCaret+offsetYUpper+(isAddedRows ? rowHeight*(diff*2+(diff!=0 ? -2:0)):0)-2;
				me.caretSpacerUpper.css("top",caretTop);		//カーソル上空間
				me.caretSpacer.css("top",topCaret+offsetYUpper*2).width(0).html(comverted);	//カーソル左空間//カーソル上空間にカーソル位置より上空間に回りこみ断片を導入
			}
			me.textarea3.val(atCurrentCaret+":"+currentCaret+"/"+rowTextLength+"/"+amountLength+"/i:"+i+"/"+domRow.width()+"/"+maxWidth+"/\n"+alText);
			var rowId= domRow.attr('id');
			rowId= rowId===undefined ? me.classIdPrefix+(i+1):rowId;
			domRow.attr('id',rowId).width(0);
			var domRowDom = document.getElementById(rowId);
			domRowDom.innerHTML=comverted;
			var nowWidth=me.fetchWidth(domRowDom,rowHeight)+40;//domRow.attr('scrollWidth');//alert(nowWidth);
			if(maxWidth - nowWidth  < 0 ){
				me.view.width(nowWidth);
				if(isCaretRow){
					me.caretSpacerUpper.width(nowWidth);
					me.caretSpacer.width(nowWidth);
				}
				if(maxWidth+2<nowWidth){
					maxWidth=nowWidth;		
				}
			}
			domRow.width(nowWidth);
			if(isCaretRow){
//				me.caretSpacerUpper.html(me.SyntaxHilighter.comvertStringToHTML(rowText.substring(0,atCurrentCaret)));				//カーソルまでの修飾済み文字列を設定
				var html = me.SyntaxHilighter.comvertStringToHTMLHilight(rowText.substring(0,atCurrentCaret),mansikiWorkMng.getHilightRules(),me.SyntaxHilighter,i).getHtml();
				me.caretSpacerUpper.html(html);//カーソルまでの修飾済み文字列を設定
				me.caretSpacerUpper.width(0);
				me.caret.css("top",caretTop-rowHeight-2);//キャレット最終位置
				nowCaretLeft=me.fetchWidth(document.getElementById(me.classIdPrefix+"Upper"),rowHeight,true);
				me.caretSpacerUpper.width(nowCaretLeft);
				me.caret.css("left",nowCaretLeft).text("A");
				me.textarea2.val(atCurrentCaret+":"+currentCaret+"/"+rowTextLength+"/"+amountLength+"/i:"+i+"/caretTop:"+caretTop+"/diff:"+diff+"/offsetYUpper:"+offsetYUpper+"/rowHeight:"+rowHeight+"/a:"+(topCaret+offsetYUpper*1-rowHeight-2)+"/top:"+topCaret+"/left:"+left+"/width:"+width+"/html:"+rowText.substring(0,atCurrentCaret)+"/"+html+"\n"+topLog);
			}
		}
		//このあたりで行追加処理を入れる？
		//ここまでで処理が完了する。
		for(var n= list.length;n<domRows.length;n++){//各リストサイズを開始位置として行要素を設定
			domRows.eq(n).remove();//行要素を削除
			rowNums.eq(n).remove();//行番号も削除
		}
		//追加前のやつ。
		var domRowsArray = [];
		for(var j=0;j<domRows.length;j++){
			domRowsArray.push(domRows.eq(j));
		}
		mansikiWorkMng.startRefresh();
		var domRowsOffset=0;
		var overrideOffset=0;
		for(var j=0;j<domRowsArray.length;j++){
			domRow = domRowsArray[j];
			var domRowDom=document.getElementById(domRow.attr('id'));
			if(domRowDom!=null && maxWidth!=domRowDom.style.width.replace(/px/,"")*1){
				domRowDom.style.width=maxWidth;
			}
			if(rowText.substring(0,atCurrentCaret)===undefined ){
				alert("rowText.substring(0,atCurrentCaret)");
			}
			if(list[j] !== undefined){//ここで強制入力を反映
				var el = me.SyntaxHilighter.comvertStringToHTMLHilight(list[j],mansikiWorkMng.getHilightRules(),me.SyntaxHilighter);
				var rowData = el.getHtml();
				list[j] = el.getText();
				//console.log("el.getText():"+el.getText());
				overrideOffset+=el.getOverrideOffset();
				if(el.getBgColor()!==undefined ){
					domRow.html(rowData).css("background-color",el.getBgColor());
				}
			}
		}
		//選択範囲処理
		me.onSelected(me,currentCaret,currentEnd,text,caretRowNo,maxWidth,rowHeight,nowCaretLeft,nowTime);
		me.textarea.width(maxWidth).height(nowTotalHeight).val(list.join("\n"));	
		me.frame.width(maxWidth).height(nowTotalHeight);	
		me.lineNumInner.height(nowTotalHeight);		
		me.view.width(maxWidth+viewWidthPlus).height(nowTotalHeight).css("top",(nowTotalHeight)*-1);		
		me.selectionView.width(maxWidth+viewWidthPlus).height(nowTotalHeight).css("top",(nowTotalHeight)*-2-rowHeight);		
		me.findView.width(maxWidth+viewWidthPlus).height(nowTotalHeight).css("top",(nowTotalHeight)*-3-rowHeight-2);		
		me.data = list.concat();//データにリストをコピー
		me.findInTheArea({"data":{"self":me}});
		me.textarea.get(0).selectionStart=currentCaret+overrideOffset;//カーソル位置
		me.textarea.get(0).selectionEnd=currentEnd+overrideOffset;//カーソル位置
		me.nowTime=new Date().getTime();
		
	},
	onSelected:function(me,currentCaret,currentEnd,text,caretRowNo,maxWidth,rowHeight,nowCaretLeft,nowTime){
		if(currentCaret != currentEnd){
			if(nowTime-me.nowTime<100){//指定時間内はスキップ
				me.timer = setTimeout(function(){me.onSelected(me,currentCaret,currentEnd,text,caretRowNo,maxWidth,rowHeight,nowCaretLeft,nowTime);},1);
				return;
			}
			me.removeSelectedObjs(me);
			var selectList=me.getSelectedText(currentCaret,currentEnd,text).split("\n");
			for(var k=0;k<selectList.length;k++){//開始がX文字直後、Y文字数
				me.selectionView.append("<div class='selectedRows' style='width:"+0+"px;'>"+selectList[k]+"</div>");
				var domRow = me.selectionView.children(".selectedRows").eq(k);
				domRowDom=domRow.get();
				if(me.data[k+caretRowNo]==selectList[k] && selectList.length-1>k){//同じ場合
					nowWidth=maxWidth;
				}else if(nowCaretLeft > 0 && selectList.length>1){
					nowWidth=maxWidth - nowCaretLeft;
				}else{
					var rowId= domRow.attr('id');
					rowId= rowId===undefined ? me.classIdPrefix+"selectedRows"+(k+1):rowId;
					domRow.attr('id',rowId).width(0);
					var domRowDom = document.getElementById(rowId);
					nowWidth=me.fetchWidth(domRowDom,rowHeight,true);
				}
				domRow.width(nowWidth).height(rowHeight).css("left",nowCaretLeft).css("top",( caretRowNo)*rowHeight-2-2*(caretRowNo+k));
				nowCaretLeft=0;
			}
		}else {
			me.removeSelectedObjs(me);
		}
	},
	removeSelectedObjs:function(me){
		var rows=me.selectionView.children(".selectedRows");
		if(rows!==undefined && rows.length>0){//削除処理
			for(var i=0 ; i<rows.length;i++){
				rows.eq(i).remove();
			}
			me.selectionView.height(0);
		}
	},
	//スクロール時に表示？
	onScroll:function(event){
		var me = event.data.self;//自分自身を呼び出し
		var scrollTop = me.outer.scrollTop();//スクロールを付随
		var scrollLeft = me.outer.scrollLeft();
		me.lineNum.scrollTop(scrollTop);
	},
	onScrollOuterParent:function(event){
		var me = event.data.self;//自分自身を呼び出し
		var scrollTop = me.onScrollOuterParent.scrollTop();//スクロールを付随
		me.lineNum.scrollTop(scrollTop);
	},
	onMouseDown:function(event){
		var me = event.data.self;
		me.isMouseDown = true;
	},
	onMouseUp:function(event){
		var me = event.data.self;
		me.isMouseDown = false;
	},
	onMoveEdit:function(event){
		var me = event.data.self;
		if(me.isMouseDown){
			me.onEdit(event);
		}
	},
	attatchMainTre:function(attachPoint){
		attachPoint.append(this.outerParent);
		this.textarea.unbind("keyup",this.onEdit).bind("keyup",{"self":this},this.onEdit);
		this.textarea.unbind("click",this.onEdit).bind("click",{"self":this},this.onEdit);
		this.textarea.unbind("mousedown",this.onMouseDown).bind("mousedown",{"self":this},this.onMouseDown);
		this.textarea.unbind("mouseup",this.onMouseUp).bind("mouseup",{"self":this},this.onMouseUp);
		this.textarea.unbind("mousemove",this.onMoveEdit).bind("mousemove",{"self":this},this.onMoveEdit);
		this.textarea.unbind("select",this.onEdit).bind("select",{"self":this},this.onEdit);
		this.outer.unbind("scroll",this.onScroll).bind("scroll",{"self":this},this.onScroll);
		this.outerParent.unbind("scroll",this.onScrollOuterParent).bind("scroll",{"self":this},this.onScrollOuterParent);
		this.setFrameSize(this.baseLineNumWidth, this);
	},
	setFrameSize:function(size,me){
		var position = me.frame.position();
		var top = position.top;
		var left = position.left;
		var realLeft = left + size;
		var realWidth = (me.width - size);
		var height = me.textarea.height();
		me.frame.css("left",realLeft+"px");
		me.textarea.css("top","0px").css("left",0+"px").css("width",realWidth+"px");
		me.textarea2.css("top",top+200).css("left",(0+1200)+"px").css("width",realWidth+"px");
		me.textarea3.css("top",top+200).css("left",(0+1200)+"px").css("width",realWidth+"px");
		me.view.css("top",(height+3)*(me.layerTimes+3)).css("left",0+"px").css("width",realWidth+"px");
		me.selectionView.css("top",(height+3)*(me.layerTimes+2)-me.lineHeight).css("left",0+"px").css("width",realWidth+"px");
		me.findView.css("top",(height+3)*(me.layerTimes+1)-me.lineHeight).css("left",0+"px").css("width",realWidth+"px");
		me.caretSpacer.css("top",(height+3)*(me.layerTimes+2)).css("left",0+"px").css("width",realWidth+"px");
		me.caretSpacerUpper.css("top",(height+3)*(me.layerTimes+2)).css("left",0+"px").css("width",realWidth+"px");
		me.caret.css("top",(height+3)*-2).css("left",0+"px").css("width",10+"px").css("height",me.lineHeight+"px");
		me.lineNum.css("top",0).css("left",left);
		me.outer.css("left",me.baseLineNumWidth+"px");
		me.outer.width(document.getElementById(this.classIdPrefix +"Outer").scrollWidth-12);	
		me.outer.height(document.getElementById(this.classIdPrefix +"Outer").scrollHeight+14);
	},
	getFormatedTextCRLF:function(text){
		return text.replace(/\t/g, "    ").replace(/(\r|\n|\r\n)/g, "\n");
	},
    fetchWidth:function(domObj,rowHeight,isFit){
    	var count = 1;
    	var width = domObj.style.width.replace(/px/,"")*1 ;
    	width=width<1?domObj.scrollWidth:width;
    	domObj.style.width= width*count;
    	var height = domObj.scrollHeight;
    	width=width>50?50:width;//範囲を50pxに限定
    	while(height > rowHeight*1.5 && count <100){
    		count ++;
    		height = domObj.scrollHeight;
    		domObj.style.width = width*count;
    	}
		if(isFit==true && height < rowHeight*1.5){
			count=0;
    		var nowWidth = domObj.style.width.replace(/px/,"")*1;
			while(count < width*2){
				count++;
				domObj.style.width=nowWidth-count;
    			height = domObj.scrollHeight;
    			var scrollWidth = domObj.scrollWidth;
				if(height > rowHeight*1.5 || scrollWidth > nowWidth-count+1 && scrollWidth > width){
					domObj.style.width=nowWidth-count+1;
					break;
				}
				if(nowWidth-count<1){
					domObj.style.width=width;
					break;
				}
			}
		}
    	var ret = domObj.style.width.replace(/px/,"")*1;
    	return isNaN(ret)?width:ret;
    },
    getSelectedText:function(start,end,text){
    	return text.slice(start,end);
    },
    findInTheArea:function(event){
		var nowTime=new Date().getTime();
    	var me = event.data.self;
    	if(nowTime-me.nowTimeFind<300){//指定時間内はスキップ
			me.timerFind = setTimeout(function(){me.findInTheArea(event);},10);
			return;
		}
		//console(me.textarea.val());
    	me.rule.regix=me.findInput.val();
    	var textList = me.getFormatedTextCRLF(me.textarea.val()).split("\n");
    	var viewHTML = "";
    	var hsRule = new HilightingSyntax();
    	hsRule.addRule(me.rule);
    	
    	for(var rowIndex in textList){
    		viewHTML += me.SyntaxHilighter.comvertStringToHTMLHilight(textList[rowIndex],hsRule,me.SyntaxHilighter).getHtml()+"<br />";
    	}
    	me.findView.html(viewHTML);
    }
}

	
