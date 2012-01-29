//	alert("here we are!");
var tab ="";

var HilightingEditor= function(id, width,height){
	this.className="HilightingEditor";
	this.classIdPrefix =this.className+"_"+id;
	this.lineHeight=18;
	this.fontSize=16;
	this.baseLineNumWidth = 30;
	this.data = new Array();
	this.dataConverted = new Array();
	this.nowTime=new Date().getTime();
	this.timer;
}

HilightingEditor.prototype={
	init:function(width,height){
		this.height = height;
		this.width = width;
		
		this.outerParent = $("<div class='"+this.className +"' id='"+this.classIdPrefix +"'></div>").css("overflow","hidden")
			.css("position","relative").width(width+20).height(height+40)
			.append("<div class='lineNum' id='"+this.classIdPrefix +"LineNum'><div class='lineNum' id='"+this.classIdPrefix +"LineNumInner'></div></div>")
			.append("<div class='"+this.classIdPrefix +"Outer' id='"+this.classIdPrefix +"Outer'></div>");
		this.outer = this.outerParent.children("."+this.classIdPrefix +"Outer").eq(0).css("overflow-x","scroll").css("overflow-y","scroll")
			.css("position","relative").width(width-this.baseLineNumWidth).height(height);
		this.outer.append("<div id='"+this.classIdPrefix +"Frame' style='width:"+width+";height:"+height+"'></div>");
		this.frame = this.outer.children("#"+this.classIdPrefix +"Frame");
		this.frame.append(
				"<textarea class='inputText'></textarea>" 
			+"<div class='viewText' id='"+this.classIdPrefix+"view'></div><div class='caretSpacer'></div><div class='caretSpacerUpper'id='"+this.classIdPrefix+"Upper'></div><div class='caret'></div>"
			);
		this.textarea = this.frame.children(".inputText").eq(0);
		this.textarea2 = $(".inputText2").eq(0);
		this.textarea3 = $(".inputText3").eq(0);
		this.view = this.frame.children(".viewText").eq(0);
		this.lineNum = this.outerParent.children("#"+this.classIdPrefix +"LineNum");
		this.lineNumInner = this.lineNum.children("#"+this.classIdPrefix +"LineNumInner");
		this.caretSpacer = this.frame.children(".caretSpacer").eq(0);
		this.caret = this.frame.children(".caret").eq(0);
		this.caretSpacerUpper = this.frame.children(".caretSpacerUpper").eq(0);
		
		this.frame.css("overflow","hidden");
		
		this.textarea
		.css("opacity",0.5).css("height",height).css("z-index",200).css("display","block").css("border","solid transparent 1px")
		.css("font-size",this.fontSize+"px").css("position","relative")
		.css("overflow","hidden").css("line-height",this.lineHeight+"px");
		//.css("word-break","keep-all").css("word-wrap","normal");
		
		this.view
		.css("opacity",0.5).css("width",(width-this.baseLineNumWidth)+"px")
		.css("height",height).css("z-index",10).css("border","solid 1px green ").css("position","relative")
		.css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("color","blue");
		
		var topView = this.view.position().top;//位置を取得
		this.view.css("top",((height)*-1));
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
	},
	onEdit:function(event){
	
		var me = event.data.self;
		var nowTime=new Date().getTime();
		if(nowTime-me.nowTime<100){//指定時間内はスキップ
			me.timer = setTimeout(function(){me.onEdit(event);},10);
			return;
		}
		var list = me.textarea.val().replace(/(\r|\n|\r\n)/g, "\n").split("\n");
		var domRows = me.view.children(".rows");
		var rowNums = me.lineNumInner.children(".nums");
		var numsHPadding = 2;
		var viewWidthPlus = 0;
		var rowHeight = (me.lineHeight)*1+2;
		var numsWidth = me.baseLineNumWidth-(numsHPadding*2);
		var width = me.view.attr('scrollWidth')-viewWidthPlus*2;
		var maxWidth=me.textareaWidth;
		var currentCaret = me.textarea.get(0).selectionStart;//カーソル位置
		var amountLength = 0;
		var alText="";
		var alText2="";
		me.caretSpacerUpper.width(width-viewWidthPlus).height(rowHeight);	//カーソル上空間
		me.caretSpacer.height(rowHeight-1);								//カーソル左空間
		var offsetYUpper = (me.view.height()+me.textarea.height()+rowHeight+3)*-1;
		//行単位で処理
		for(var i= 0;i<list.length;i++){
			var isCaretRow = false;
			var rowText = list[i];					//本来その行に存在する文字列情報
			var domRow = domRows.eq(i);				//行を表示している領域
			var rowTextLength = rowText.length;	//行文字数
			amountLength += rowTextLength;			//カーソル位置ー今までの全行文字数＋行の長さ//行トータルの集計
			maxWidth = maxWidth+2< domRow.width()?domRow.width()+2:maxWidth;
			alText+="/["+i+"]:"+rowTextLength+"@"+currentCaret;
			
			var atCurrentCaret = currentCaret + rowTextLength - amountLength-i;//キャレット位置
			//alert("a:"+(atCurrentCaret)+"/b:"+rowTextLength+"/i:"+i+"/c:"+rowText);
			if(isCaretRow===false && (atCurrentCaret <= rowTextLength && atCurrentCaret >= 0)){
				isCaretRow=true;
				me.textarea2.val("a:"+(atCurrentCaret)+"/b:"+rowTextLength+"/i:"+i+"/boolena:"+isCaretRow+"/c:"+rowText+"\n"
				+"/L:"+me.data.length +"/d:"+ me.data[i] +"/Rl:"+ domRow.length +"/"
				+(me.data.length > i && me.data[i]===rowText && domRow.length > 0 && isCaretRow==false));
			}
			if(me.data.length > i && me.data[i]===rowText && domRow.length > 0 && isCaretRow==false){//データが動いていないかつカーソルの行位以外はスルー
				continue;//次の行を処理する。
			}
			//行単位初期化
			var comverted =me.comvertStringToHTML(rowText);
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
				var position = domRow.position();//位置を取得
				var top = position.top;
				var left = position.left + rowNum.attr('clientWidth');
				me.caretSpacerUpper.css("top",top+offsetYUpper);//カーソル上空間
				me.caretSpacer.css("top",top+offsetYUpper*2).width(0);//カーソル左空間
				me.caretSpacer.html(comverted);//カーソル上空間にカーソル位置より上空間に回りこみ断片を導入
				//me.textarea2.val(atCurrentCaret+":"+currentCaret+"/"+rowTextLength+"/"+amountLength+"/i:"+i+"/"+domRow+"/"+domRow.width()+"/"+maxWidth+"/top:"+top+"/left:"+left+"/width:"+width);
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
				me.caretSpacerUpper.html(me.comvertStringToHTML(rowText.substring(0,atCurrentCaret)));				//カーソルまでの修飾済み文字列を設定
				me.caretSpacerUpper.width(0);
				var nowCaretLeft=me.fetchWidth(document.getElementById(me.classIdPrefix+"Upper"),rowHeight,true);
				me.caretSpacerUpper.width(nowCaretLeft);
				me.caret.css("left",nowCaretLeft).css("top",top+offsetYUpper*1-rowHeight-2).text("A");
			}
		}
		for(var n= list.length;n<domRows.length;n++){//各リストサイズを開始位置として行要素を設定
			domRows.eq(n).remove();//行要素を削除
			rowNums.eq(n).remove();//行番号も削除
		}
		var nowTotalHeight =list.length*rowHeight+100;
		nowTotalHeight=nowTotalHeight>me.height?nowTotalHeight:me.height;
		me.textarea.width(maxWidth).height(nowTotalHeight);	
		me.frame.width(maxWidth).height(nowTotalHeight);	
		me.lineNumInner.height(nowTotalHeight);		
		me.view.width(maxWidth+viewWidthPlus).height(nowTotalHeight).css("top",(nowTotalHeight)*-1);		
		me.data = list.concat();//データにリストをコピー
		me.nowTime=new Date().getTime();
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
	attatchMainTre:function(attachPoint){
		attachPoint.append(this.outerParent);
		this.textarea.unbind("keyup",this.onEdit);
		this.textarea.bind("keyup",{"self":this},this.onEdit);
		this.textarea.unbind("click",this.onEdit);
		this.textarea.bind("click",{"self":this},this.onEdit);
		this.outer.unbind("scroll",this.onScroll);
		this.outer.bind("scroll",{"self":this},this.onScroll);
		this.outerParent.unbind("scroll",this.onScrollOuterParent);
		this.outerParent.bind("scroll",{"self":this},this.onScrollOuterParent);
		this.setFrameSize(this.baseLineNumWidth, this);
	},
	setFrameSize:function(size,me){
		var position = me.frame.position();
		var top = position.top;
		var left = position.left;
		var realLeft = left + size;
		var realWidth = (me.width - size);
		me.frame.css("left",realLeft+"px");
		me.textarea.css("top",top).css("left",0+"px").css("width",realWidth+"px");
		me.textarea2.css("top",top+200).css("left",(0+1200)+"px").css("width",realWidth+"px");
		me.textarea3.css("top",top+200).css("left",(0+1200)+"px").css("width",realWidth+"px");
		me.view.css("top",(me.textarea.height()+3)*-1).css("left",0+"px").css("width",realWidth+"px");
		me.caretSpacer.css("top",(me.textarea.height()+3)*-2).css("left",0+"px").css("width",realWidth+"px");
		me.caretSpacerUpper.css("top",(me.textarea.height()+3)*-2).css("left",0+"px").css("width",realWidth+"px");
		me.caret.css("top",(me.textarea.height()+3)*-2).css("left",0+"px").css("width",10+"px").css("height",me.lineHeight+"px");
		me.lineNum.css("top",0).css("left",left);
		me.outer.css("left",me.baseLineNumWidth+"px");
		me.outer.width(document.getElementById(this.classIdPrefix +"Outer").scrollWidth-12);	
		me.outer.height(document.getElementById(this.classIdPrefix +"Outer").scrollHeight+14);
	},
	comvertStringToHTML:function(str){
		var reSpaceZen = new RegExp('b','g');
		//alert(str.replace(/[　]{1}/g,"<span class='space2'>ああ</span>"));
		str = str.replace(/&/g,"&amp;").replace(/[　]{1}/g,"&emsp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
		.replace(/\t/g,"<pre&nbsp;style='display:inline;border:0px;margin:0px;padding:0px;'>&_#_0_9_;</pre>")
		.replace(/\s/g,"&nbsp").replace(/&_#_0_9_;/g,"&#09;")
		.replace(/pre&nbsp;style/g,"pre style");
		return str.replace(/[　]{1}/g,"<span class='space2'>&emsp;</span>");
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
    	//alert(domObj.style.width.replace(/px/,"")*1);
    	var ret = domObj.style.width.replace(/px/,"")*1;
    	return isNaN(ret)?width:ret;
    }
}
	
