//	alert("here we are!");
var tab ="";
const caretLetter="|";
var HilightingEditor= function(id, width,height){
	this.height = height;
	this.layerTimes = -4;//レイヤー数（）
	this.className="HilightingEditor";
	this.classIdPrefix =this.className+"_"+id;
	this.fontSize=12;
	this.lineHeight=2+this.fontSize;
	this.baseLineNumWidth = 30;
	this.numsHPadding = 2;
	this.waight=10;
	this.data = new Array();
	this.dataConverted = new Array();
	this.nowTime=new Date().getTime();
	this.nowTimeFind=new Date().getTime();
	this.selectedRowsObj=[];
	this.timer;
	this.basicRowColor="#EDFFF5";
	this.caretRowColor="#FF00E6";
	this.viewWidthOffset  = 0;
	//初期化の部
	this.SyntaxHilighter = new SyntaxHilighter();
	this.hilightData = new MansikiHiliteData();//文字列ハイライトに必要なデータを本処理からひっペガス
	this.hilightData.classIdPrefix = this.classIdPrefix;
	this.hilightData.editCallCount = 0;
	this.editCallCount = 0;
	//計算の部
	this.rowHeight = (this.lineHeight)*1+2;
	this.numsWidth = this.baseLineNumWidth-(this.numsHPadding*2);
	this.tran=false;
	this.mwh = new mansikiWorkerHandler();
	this.text = '';
	this.joind='';
	this.joindList=[];
	this.hilightData.text='-1';
	this.bkText='';
	this.caretLength=0;
	this.caretRowCount=0;
	MansikiInit();
}

HilightingEditor.prototype={
	bindFuncButtons:function(me){
		var saveId = 'save';
		var loadId = 'load';
		var fileId = 'loadFile';
		var mfu = new MansikiFileUtil();
		mfu.bindSave(mfu,$('#'+saveId),'click',me.textarea);
		mfu.bindLoad(mfu,$('#'+loadId),'click',document.getElementById(fileId),me.textarea,me.onEdit,me);
	},
	initEditor:function(width,height,findInput){
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
				"<textarea class='inputText' id='"+this.className+"_inputText'></textarea>" 
			+"<div class='viewText' id='"+this.classIdPrefix+"view'></div><div class='caretSpacer'></div>"
			+"<div class='selectionViewText' id='"+this.classIdPrefix+"selectionView'></div>"
			+"<div class='findViewText' id='"+this.classIdPrefix+"findView'></div>"
			+"<div class='caretSpacerUpper'id='"+this.classIdPrefix+"Upper'></div><div class='caret'></div>"
			);
		this.textarea = this.frame.children(".inputText").eq(0).css("letter-spacing","0px").css("word-wrap","keep-all");
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
		.css("overflow","hidden").css("padding","0px").css("margin","0px").css("color","red").css("opacity",0.9);
		
		this.caretSpacer
		.css("opacity",0.9).css("position","relative").css("width","0px")
		.css("height",height).css("z-index",15).css("border","solid black 0px")
		.css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("color","white")
		.css("back-ground-color","green").css("white-space","nowrap");
		
		this.textareaWidth = width-this.baseLineNumWidth;
		this.rule = new HilightingSyntaxRule("find","findHilight","",undefined,"STRING","LINE");
		this.findInput.bind("keypress",{"self":this},this.findInTheArea);
		this.bindFuncButtons(this);
	},
	onEdit:function(event){//将来は背景を全部Canvasにすべき？
		var me = event!==undefined && event.data.self===undefined  ? event:event.data.self;
		//var me = event.data.self;
		var nowTime=new Date().getTime()+me.editCallCount%10;
		var currentCaret = me.textarea.get(0).selectionStart;//カーソル位置// TODO DOM
		me.hilightData.currentCaret=currentCaret;
		var currentEnd= me.textarea.get(0).selectionEnd;//カーソル位置// TODO DOM
		var domRows = me.view.children(".rows");// TODO DOM
		var text = me.getFormatedTextCRLF(me.textarea.val());
		var isTheFirefoxBug=false;
		var inTheFirefoxBugInputText = '';
		
		//Firefox Bug?対応
		me.hilightData.list = text.split("\n");
		
		var diff = domRows.length - me.hilightData.list.length;//行数変動を観測
		for(var i= 0;i<me.hilightData.list.length && i<domRows.length;i++){
			me.topCaret = domRows.eq(i).position().top;//topLog+="/["+i+"]:"+topCaret;// TODO DOM
			var caretTop = me.topCaret+me.offsetYUpper+(me.hilightData.isAddedRows ? me.rowHeight*(diff*2):0)-2;
			if(nowTime-me.nowTime<20+me.editCallCount%10 && me.hilightData.isCaretRowList[i]===true && caretTop <1 && me.caretRowCount  > 1){
				isTheFirefoxBug=true;
				break;
			}
		}
		if(nowTime-me.nowTime<200+me.editCallCount%10 && me.caretRowCount >1 && me.hilightData.list.length <3){
			isTheFirefoxBug=true;
			inTheFirefoxBugInputText = text;
		}
		if( isTheFirefoxBug || me.hilightData.list.length <2 && text.length <2 && text!==me.bkText && me.bkText.length > 1){//処理完了までに入力があった場合。見分ける方法は。短時間にX行が１行になった場合。
			 text = me.bkText;
			clearTimeout(me.timer);
			 me.lineNum.focus();
			 me.textarea.val(me.bkText+inTheFirefoxBugInputText);
			 me.textarea.focus();
			 me.textarea.get(0).selectionEnd = me.caretLength;
			 
			//console.log('text.length!'+text.length+'/'+(text!==me.bkText)+'/'+me.bkText.length+'/'+me.caretLength+'/'+me.caretRowCount );
			 me.timer = setTimeout(function(){me.tran=false;me.onEdit(event);},2);
			return;
		}
		this.text= text ;
		//console.log('text!'+me.textarea.val()+'/'+me.bkText);
		if(this.joind===this.text){
			//console.log('SAME!SAME! diff:'+diff);
			return ;
		}
		if(nowTime-me.nowTime<200+me.editCallCount%10  && me.tran!==false){//指定時間内はスキップただし行数変動は除く
			clearTimeout(me.timer);
			me.timer = setTimeout(function(){me.tran=false;me.onEdit(event);},200);
			//console.log('TIME NOT CAME!');
			return;
		}
		//me.textarea.val(text);// TODO DOM
		me.event=event;//後方キャンセル用に保持
		me.editCallCount ++;
		me.hilightData.editCallCount = me.editCallCount;//ピーコする
		var rowNums = me.lineNumInner.children(".nums");// TODO DOM
		var width = me.view.attr('scrollWidth')-me.viewWidthOffset*2;// TODO DOM
		me.caretSpacerUpper.width(width-me.viewWidthOffset).height(me.rowHeight);	//カーソル上空間// TODO DOM
		me.caretSpacer.height(me.rowHeight-1);								//カーソル左空間// TODO DOM
		me.hilightData.diff = diff;
		
		me.maxWidth = me.textareaWidth;
		var nowTotalHeight =me.hilightData.list.length*me.rowHeight+100;
		var isAddedRows= nowTotalHeight>me.height;
		me.hilightData.isAddedRows = isAddedRows;
		nowTotalHeight=isAddedRows ? nowTotalHeight:me.height;
		me.offsetYUpper = (me.selectionView.height()*(me.layerTimes*-1)+me.rowHeight*(me.hilightData.isAddedRows && me.hilightData.diff > 0 ? me.layerTimes+1:1)+3)*-1;// TODO DOM
		me.hilightData.caretRowNo = 0;
		var nowCaretLeft=0;
		var htmlConvertedToCaret ="";
		var textAtCaretRow ="";
		var fetchWidthAtCaretRow =0;
		var domRowsArray = [];
		me.hilightData.domRowsExist = [];
		me.hilightData.rowIdList = [];
		me.hilightData.shDataList = [];
		//行単位で処理
		for(var i= 0;i<me.hilightData.list.length;i++){//ここで行数を確定させる
			var domRow = domRows.eq(i);				//行を表示している領域// TODO DOM
			if(domRow.length < 1){//最後尾処理、実際表示に置く。
				me.view.append("<div class='rows' style='width:"+width+"px;'></div>");// TODO DOM
				domRows = me.view.children(".rows");// TODO DOM
				domRow = domRows.eq(i);//指定の行番号を取得// TODO DOM
				domRow.css("line-height",me.lineHeight+"px").css("height",me.rowHeight-2+"px");//行の高さと実際の高さを指定// TODO DOM
				domRow.attr('id',me.hilightData.classIdPrefix+'_'+nowTime+'_'+i);
			}
			me.maxWidth = me.maxWidth+2< domRow.width()? domRow.width()+2 :me.maxWidth;// TODO DOM
			me.hilightData.rowIdList.push(domRow.attr('id'));// TODO DOM
			
			var rowNum = rowNums.eq(i);//行番号表示// TODO DOM
			
			if(rowNum.length < 1){//行番号表示の処理
				me.lineNumInner.append("<div class='nums' style='width:"+me.numsWidth+"px;padding:0px " + me.numsHPadding + "px;'></div>");// TODO DOM
				rowNums = me.lineNumInner.children(".nums");// TODO DOM
				rowNum = rowNums.eq(i);//指定の行番号を取得// TODO DOM
				rowNum.css("line-height",me.lineHeight+"px").css("height",(me.rowHeight-2)+"px");//行の高さと実際の高さを指定// TODO DOM
			}
			rowNum.html(i+1);//行番号表示// TODO DOM
			domRowsArray.push(domRow);// TODO DOM
			me.SyntaxHilighter.setPreData(me.SyntaxHilighter,me.hilightData.list[i],mansikiWorkMng.getHilightRules(mansikiWorkMng),undefined,i,me.diff < 0,0);
			me.hilightData.shDataList.push(me.SyntaxHilighter.getPreDataObj(me.SyntaxHilighter));
		}
		//このあたりで行追加処理を入れる？
		//ここまでで処理が完了する。
		for(var n= me.hilightData.list.length;n<domRows.length;n++){//各リストサイズを開始位置として行要素を設定
			domRows.eq(n).remove();//行要素を削除
			rowNums.eq(n).remove();//行番号も削除
		}
		me.domRows=domRows;
		me.rowNums=rowNums;
		setTimeout(function(){me.onEditPreWorker(me);},0);
	},
	onEditPreWorker:function(me){
		if(me.hilightData.editCallCount !== me.editCallCount){//すでに新しい入力が走っている場合はキャンセル。
			return ;
		}
		me.hilightData.text = me.text;
		//me.mwh.execute(me.mwh,me.hilightData,me.onEditAfterCallBack,me);//ここからWorkerに投げる！
		me.onEditAfterCallBack(me,executeTheJob(me.SyntaxHilighter,me.hilightData));
	},
	onEditAfterCallBack:function(me,hilightData){//単位を行じゃなくて1アクションに集約
		//ここからWorker CallBack
		me.hilightDataAfter=hilightData;
		var lineLength = me.hilightDataAfter.list.length;
		me.joindList =[];
		me.tran=true;
		
		console.log("AAAAXXX/");
		//Firefox Bug?IME対応
		for(var i= 0;i<me.hilightDataAfter.list.length;i++){
			var domRow = me.domRows.eq(i);// TODO DOM
			if(me.hilightDataAfter.isThrowList[i]===true){
				domRow.css("background-color",me.basicRowColor);
				continue;//変更なし行はこちら。
			}
			console.log("AAAA"+i+'/'+me.hilightDataAfter.list.length);
			if(me.hilightDataAfter.isCaretRowList[i]===true && domRow.position()!==null){//var stringAtCaret ="A";//キャレットの表示//caretsカーソル
				var position = domRow.position();//位置を取得// TODO DOM
				me.topCaret = position.top;//topLog+="/["+i+"]:"+topCaret;// TODO DOM
				var left = position.left + me.rowNums.eq(i).attr('clientWidth');// TODO DOM
				var caretTop = me.topCaret+me.offsetYUpper+(me.hilightDataAfter.isAddedRows ? 
					me.rowHeight*(me.hilightDataAfter.diff*2):0)-2;
				me.caretSpacerUpper.css("top",caretTop);		//カーソル上空間// TODO DOM
				me.caretSpacer.css("top",me.topCaret+me.offsetYUpper*2-(me.hilightDataAfter.diff!=0 ? -2:0)).width(0).html(me.hilightData.dataConverted[i]);	
				// TODO DOM//カーソル左空間//カーソル上空間にカーソル位置より上空間に回りこみ断片を導入
			}
			domRow.attr('id',me.hilightDataAfter.rowIdList[i]).width(0);// TODO DOM
			var domRowDom = document.getElementById(me.hilightDataAfter.rowIdList[i]);// TODO DOM
			if(domRowDom===undefined || domRowDom===null){//指定時間内はスキップただし行数変動は除く
				me.timer = setTimeout(function(){me.onEdit(me.event);},70);
				return;
			}
			domRowDom.innerHTML=me.hilightDataAfter.dataConverted[i];// TODO DOM
			var nowWidth=me.fetchWidth(domRowDom,me.rowHeight)+40;//domRow.attr('scrollWidth');//alert(nowWidth);//TODO DOM
			if(me.maxWidth - nowWidth  < 0 ){
				me.view.width(nowWidth);
				if(me.maxWidth + 2 < nowWidth){
					me.maxWidth = nowWidth;		
				}
			}
			domRow.width(nowWidth);//TODO DOM
			if(me.hilightDataAfter.isCaretRowList[i]===true){//TODO　まだキャレットがうまく行を指定できていない。
				if(me.maxWidth - nowWidth  < 0 ){
					me.caretSpacerUpper.width(nowWidth);// TODO DOM
					me.caretSpacer.width(nowWidth);// TODO DOM
				}
				domRow.css("background-color",me.caretRowColor);
				//キャレット部分だけ再計算
				var elAtCaret=me.SyntaxHilighter.comvertStringToHTMLHilight(
					me.SyntaxHilighter,me.hilightDataAfter.list[i].substring(0,me.hilightDataAfter.atCurrentCaret )
					,mansikiWorkMng.getHilightRules(mansikiWorkMng),me.SyntaxHilighter,i,me.hilightDataAfter.diff < 0,i);
				me.caretSpacerUpper.html(elAtCaret.html);//カーソルまでの修飾済み文字列を設定
				me.caretSpacerUpper.width(0);
				me.caret.css("top",caretTop-me.rowHeight-2);//キャレット最終位置
				nowCaretLeft=me.fetchWidth(document.getElementById(me.hilightDataAfter.classIdPrefix+"Upper"),me.rowHeight,true);
				me.caretSpacerUpper.width(nowCaretLeft);
				me.caret.css("left",nowCaretLeft).text(caretLetter);
			}else{
				domRow.css("background-color",me.basicRowColor);
			}
			me.onEditAfterCallBackByRow(me,me.hilightDataAfter.elList[i]);
			me.joindList.push(me.hilightDataAfter.elList[i].text);
		}
		//console.log('now:'+lineLength+'/'+me.hilightDataAfter.list.length);
		me.elAtCaret=elAtCaret;
		me.onEditDoLast(me);
	},
	onEditAfterCallBackByRow:function(me,el){//単位を行じゃなくて1アクションに集約
		me.hilightDataAfter.resultMap[el.rowIndex]="executed!";
		//追加前のやつ。
		mansikiWorkMng.startRefresh();
		me.overrideOffset=0;
		
		var domRow = me.domRows.eq(el.rowIndex);
		var domRowDom=document.getElementById(domRow.attr('id'));
		if(domRowDom!=null && me.maxWidth!=domRowDom.style.width.replace(/px/,"")*1){
			domRowDom.style.width=me.maxWidth;
		}
		me.hilightDataAfter.list[el.rowIndex] = el.text;
		me.overrideOffset += el.overrideOffset;
		if(me.hilightDataAfter.caretRowNo==el.rowIndex){
			me.elAtCaret=el;
		}else if(el.bgColor!==undefined ){
			domRow.html(el.html).css("background-color",el.bgColor);
		}
	},
	onEditDoLast:function(me){
		var nowTotalHeight = me.hilightDataAfter.list.length * me.rowHeight + 100;
		var isAddedRows = nowTotalHeight > me.height;
		var nowTotalHeight = isAddedRows ? nowTotalHeight:me.height;
		me.frame.width(me.maxWidth).height(nowTotalHeight);	
		me.lineNumInner.height(nowTotalHeight);	
		me.view.width(me.maxWidth+me.viewWidthOffset).height(nowTotalHeight).css("top",(nowTotalHeight)*-1);		
		me.selectionView.width(me.maxWidth+me.viewWidthOffset).height(nowTotalHeight).css("top",(nowTotalHeight)*-2-me.rowHeight);		
		me.findView.width(me.maxWidth+me.viewWidthOffset).height(nowTotalHeight).css("top",(nowTotalHeight)*-3-me.rowHeight-2);	
		me.hilightDataAfter.data = me.hilightDataAfter.list.concat();//データにリストをコピー
		me.textarea.get(0).selectionStart = me.hilightDataAfter.currentCaret*1 + me.overrideOffset*1;//カーソル位置
		me.textarea.get(0).selectionEnd= me.hilightDataAfter.currentCaret*1 + me.overrideOffset*1;//カーソル位置
		var ta = document.getElementById(me.textarea.attr('id'));
		me.textarea.width(me.maxWidth).height(nowTotalHeight);//.val(me.joind);
		
		//console.log('GOAL!AAA'+me.textarea.val().length);
		me.findInTheArea({"data":{"self":me}});//検索処理
		//console.log('GOAL!BBBB'+me.textarea.val().length);
		me.nowTime = new Date().getTime();
		me.tran=false;
		me.readjustCaret(me);
		//Firefox Bug? IME周り対応
		
		me.joind = me.joindList.join("\n");;
		if( me.textarea.get(0).selectionEnd >=me.joind.length  && me.joind.length >10 
			&& me.joind!==me.bkText 
			&& me.hilightDataAfter.list.length === me.joindList.length){
			me.bkText = me.joind;
			me.caretRowCount = me.hilightDataAfter.list.length;
			me.textarea.val(me.joind);
			me.caretLength = me.textarea.get(0).selectionEnd;
		}
		//console.log('GOAL!'+me.textarea.val().length+'/'+me.textarea.attr('id')+'/'+ta.value);
	},
	readjustCaret:function(me){//ただしインデントにのみ限る
		var rowText = me.elAtCaret.text;
		var comverted = me.hilightDataAfter.htmlConvertedToCaret;
		var rowHeight = me.rowHeight;
		var domRow = me.domRows.eq(me.hilightDataAfter.caretRowNo).css("background-color",me.hilightDataAfter.caretRowColor);
		var caretTop = me.topCaret + me.offsetYUpper + (me.hilightDataAfter.isAddedRows ? rowHeight*(me.hilightDataAfter.diff*2+(me.hilightDataAfter.diff!=0 ? -2:0)):0)-2;
		//console.log("caretTop:"+(caretTop-4)+'/'+me.topCaret +'/'+me.offsetYUpper+'/'+me.hilightDataAfter.diff);
		if(me.topCaret <1 && me.caretRowCount  > 1){
			 me.textarea.keyup();
			 return ;
		}
		me.caretSpacerUpper.css("top",caretTop);		//カーソル上空間
		me.caretSpacer.css("top",me.topCaret + me.offsetYUpper*2).width(0).html(comverted);	//カーソル左空間//カーソル上空間にカーソル位置より上空間に回りこみ断片を導入
		var html = me.SyntaxHilighter.comvertStringToHTML(rowText);
		me.caretSpacerUpper.html(html);//カーソルまでの修飾済み文字列を設定
		me.caretSpacerUpper.width(0);
		me.caret.css("top",caretTop-rowHeight-2);//キャレット最終位置
		nowCaretLeft=me.fetchWidth(document.getElementById(me.hilightDataAfter.classIdPrefix+"Upper"),rowHeight,true);//TODO DOM
		me.caretSpacerUpper.width(nowCaretLeft);
		me.caret.css("left",nowCaretLeft).text(caretLetter);
	
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
				if(me.hilightDataAfter.data[k+caretRowNo]==selectList[k] && selectList.length-1>k){//同じ場合
					nowWidth=maxWidth;
				}else if(nowCaretLeft > 0 && selectList.length>1){
					nowWidth=maxWidth - nowCaretLeft;
				}else{
					var rowId= domRow.attr('id');
					rowId= rowId===undefined ? me.hilightDataAfter.classIdPrefix+"selectedRows"+(k+1):rowId;
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
		//this.textarea.unbind("mousedown",this.onMouseDown).bind("mousedown",{"self":this},this.onMouseDown);
		//this.textarea.unbind("mouseup",this.onMouseUp).bind("mouseup",{"self":this},this.onMouseUp);
		//this.textarea.unbind("mousemove",this.onMoveEdit).bind("mousemove",{"self":this},this.onMoveEdit);
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
		me.view.css("top",(height+3)*(me.layerTimes+3)).css("left",0+"px").css("width",realWidth+"px");
		me.selectionView.css("top",(height+3)*(me.layerTimes+2)-me.lineHeight).css("left",0+"px").css("width",realWidth+"px");
		me.findView.css("top",(height+3)*(me.layerTimes+1)-me.lineHeight).css("left",0+"px").css("width",realWidth+"px");
		me.caretSpacer.css("top",(height+3)*(me.layerTimes+2)).css("left",0+"px").css("width",realWidth+"px");
		me.caretSpacerUpper.css("top",(height+3)*(me.layerTimes+2)).css("left",0+"px").css("width",realWidth+"px");
		me.caret.css("top",(height+3)*-2).css("left",0+"px").css("width",1+"px").css("height",me.lineHeight+"px");
		me.lineNum.css("top",0).css("left",left);
		me.outer.css("left",me.baseLineNumWidth+"px");
		me.outer.width(document.getElementById(this.classIdPrefix +"Outer").scrollWidth-12);	
		me.outer.height(document.getElementById(this.classIdPrefix +"Outer").scrollHeight+14);
	},
	getFormatedTextCRLF:function(text){
		return text.replace(/\t/g, "    ").replace(/(\r|\n|\r\n)/g, "\n");
	},
    fetchWidth:function(domObj,rowHeight,isFit){//ここが諸悪の根源
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
    		viewHTML += me.SyntaxHilighter.comvertStringToHTMLHilight(me.SyntaxHilighter,textList[rowIndex],hsRule,me.SyntaxHilighter).html+"<br />";
    	}
    	me.findView.html(viewHTML);
    }
}

	
