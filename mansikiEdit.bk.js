//	alert("here we are!");
var tab ="";

var HilightingEditor= function(id, width,height){
	this.className ="HilightingEditor_"+id;
	this.lineHeight=18;
	this.fontSize=16;
	this.baseLineNumWidth = 30;
	this.data = new Array();
	this.dataConverted = new Array();
	this.wordSpace=0;
	
}

HilightingEditor.prototype={
	init:function(width,height){
		this.width = width;
		this.frame = $("<div class='"+this.className +"' style='width:"+width+";height:"+height+"'></div>");
		this.frame.append(
				"<textarea class='inputText'></textarea>" 
			+"<div class='viewText'></div><div class='lineNum'></div>"
			+"<div class='caretSpacer'></div><div class='caretSpacerInRow'></div>" 
			+"<div class='caretSpacerOnRow'></div><div class='caretSpacerUpper'>"
			+"</div><div class='caretSpacerInRowme'></div>");
		this.textarea = this.frame.children(".inputText").eq(0);
		this.textarea2 = $(".inputText2").eq(0);
		this.view = this.frame.children(".viewText").eq(0);
		this.lineNum = this.frame.children(".lineNum").eq(0);
		this.caretSpacer = this.frame.children(".caretSpacer").eq(0);
		this.caretSpacerInRow = this.frame.children(".caretSpacerInRow").eq(0);
		this.caretSpacerUpper = this.frame.children(".caretSpacerUpper").eq(0);
		this.caretSpacerOnRow = this.frame.children(".caretSpacerOnRow").eq(0);
		this.caretSpacerInRowme = this.frame.children(".caretSpacerInRowme").eq(0);
		
		this.textarea
		.css("opacity",0.5).css("position","absolute").css("height",height).css("z-index",200).css("display","block").css("border","solid transparent 1px")
		.css("font-family","sans-serif").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("overflow-y","scroll").css("overflow-x","scroll").css("line-height",this.lineHeight+"px");
		//.css("word-break","keep-all").css("word-wrap","normal");
		
		this.view
		.css("opacity",0.5).css("position","absolute").css("width",(width-this.baseLineNumWidth)+"px")
		.css("height",height).css("z-index",10).css("border","solid green 1px")
		.css("font-family","sans-serif").css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("overflow-y","scroll").css("color","blue");
		
		this.lineNum//
		.css("opacity",0.9).css("position","absolute").css("width",this.baseLineNumWidth+"px")
		.css("height",height).css("z-index",10).css("border","solid black 1px")
		.css("font-family","sans-serif").css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden");
		
		this.caretSpacerUpper
		.css("position","absolute").css("border","solid black 1px").css("z-index",10)
		.css("font-family","sans-serif").css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("padding","0px").css("margin","0px").css("color","red");

		this.caretSpacerOnRow
		.css("position","absolute").css("border","solid black 1px").css("z-index",10)
		.css("font-family","sans-serif").css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("padding","0px").css("margin","0px").css("color","red");
		
		this.caretSpacer
		.css("opacity",0.9).css("position","absolute").css("width","0px")
		.css("height",height).css("z-index",15).css("border","solid black 0px")
		.css("font-family","sans-serif").css("line-height",this.lineHeight+"px").css("font-size",this.fontSize+"px")
		.css("overflow","hidden").css("color","white")
		.css("back-ground-color","green").css("white-space","nowrap");
		
		this.caretSpacerInRow
		.css("opacity",0.9).css("position","absolute").css("width","0px").css("height",height).css("z-index",16)
		.css("color","yellow").css("border","solid black 1px");
	
		this.caretSpacerInRowme.css("overflow","hidden");
	},
	onEdit:function(event){
		var me = event.data.self;
		var list = me.textarea.val().replace(/(\r|\n|\r\n)/g, "\n").split("\n");
		var domRows = me.view.children(".rows");
		var rowNums = me.lineNum.children(".nums");
		var outputText ="";
		var count = 0;
		var alertText ="";
		var numsHPadding = 2;
		var rowHeight = (me.lineHeight)*1+2;
		var numsWidth = me.baseLineNumWidth-(numsHPadding*2);
		var width = me.view.attr('clientWidth');
		var currentLength = 0;
		//カーソル位置
		var currentCaret = me.textarea.get(0).selectionStart;
		var amountLength = 0;
		me.caretSpacerUpper.css("width",width+"px").css("height",(rowHeight-1)+"px");//カーソル上空間
		me.caretSpacer.css("height",(rowHeight-1)+"px");//カーソル左空間
		
		//行単位で処理
		for(var i= 0;i<list.length;i++){
			var rowText = list[i];					//本来その行に存在する文字列情報
			var domRow = domRows.eq(i);			//行を表示している領域
			var rowTextLength = rowText.length;		//行文字数
			amountLength += rowTextLength;			//カーソル位置ー今までの全行文字数＋行の長さ//行トータルの集計
			if(me.data.length > i && me.data[i]===rowText && domRow.length > 0){	//もし行数がiより大きく、i番目のデータと行のデータが同じでかつ、表示領域になにか設定されている場合
				continue;//次の行を処理する。
			}
			
			//行単位初期化
			var comverted ="";
			var offsetTextLength = 0;
			var rowNum = rowNums.eq(i);//行番号表示
			var atCurrentCaret = currentCaret+rowTextLength - amountLength;//キャレット位置
			me.textarea2.val(atCurrentCaret+":"+currentCaret+"/"+rowTextLength+"/"+amountLength);
			//alert(atCurrentCaretb);
			
			if(domRow.length < 1){//最後尾処理、実際表示に置ける。
				me.view.append("<div class='rows' style='width:"+width+"px;'></div>");
				domRows = me.view.children(".rows");
				domRow = domRows.eq(i);//指定の行番号を取得
				domRow.css("line-height",me.lineHeight+"px").css("height",rowHeight+"px");//行の高さと実際の高さを指定
			}
			//行番号表示の処理
			if(rowNum.length < 1){
				me.lineNum.append("<div class='nums' style='width:"+numsWidth+"px;padding:0px " + numsHPadding + "px;'></div>");
				rowNums = me.lineNum.children(".nums");
				rowNum = rowNums.eq(i);//指定の行番号を取得
				rowNum.css("line-height",me.lineHeight+"px").css("height",rowHeight+"px");//行の高さと実際の高さを指定
			}
			rowNum.html(i+1);//なにやってる？行番号表示
			
			//次回ループへの初期化
			var br ="";
			var brCount =0;
			//caretsカーソル
			var position = domRow.position();//位置を取得
			var top = position.top;
			var left = position.left + rowNum.attr('clientWidth');
			var stringAtCaret ="A";//キャレットの表示
			me.caretSpacerUpper.css("top",top).css("left",left+"px").css("height",(rowHeight-1)+"px").css("width",width+"px");//カーソル上空間
			me.caretSpacer.css("top",top).css("left",left+"px").css("width",0+"px");//カーソル左空間
			me.caretSpacerInRow.css("top",top).css("left",left+"px").css("height",(rowHeight-1)+"px").css("width",width+"px");//カーソル行内空間
			me.caretSpacerUpper.html( me.comvertStringToHTML(rowText.substring(offsetTextLength,(rowTextLength-currentLength))));//カーソル上空間にカーソル位置より上空間に回りこみ断片を導入

			var comvertedCaret ="";
			var counter = 0;
			
			domRow.html(me.comvertStringToHTML(rowText));
			
			if(domRow.width() - domRow.attr('scrollWidth') < 0){
				domRow.width(domRow.attr('scrollWidth'));
			}
			
			while(offsetTextLength - rowTextLength < 0){	//オフセットが全体の長さより小さい場合
				//オフセットから表示文字列の長さ引くカウンターまでを取得。（修飾以前）横スクロールが発生しない横幅を取得
				var planeAddText = rowText.substring(offsetTextLength,(rowTextLength - counter));
				var add = me.comvertStringToHTML(planeAddText);		//修飾を付与
				domRow.css("height",(rowHeight-1)+"px");			//行の高さをスクロールを観測するため1行分に指定
				domRow.html(comverted + br + add);					//変換後＋改行＋追加を行表示エリアに挿入
				var planeAddTextLength = planeAddText.length;		//修飾前の長さを記録
				if(domRow.width() - domRow.attr('scrollWidth') >= 0){//もしスクロール領域が発生していない場合は(本来の横幅-スクロール込みの幅)
					offsetTextLength += planeAddTextLength;			//オフセットに文字数を追加
					if(offsetTextLength <= atCurrentCaret){			//オフセットが現在の行でのカーソル位置以前の場合
						comvertedCaret += br+add;					//変換済み文字列に改行とカーソルまでの修飾済み文字データを設定
						stringAtCaret = planeAddText;				//カーソルまでの修飾前文字データを保管
					}else if(atCurrentCaret <= offsetTextLength && (offsetTextLength - planeAddTextLength) <= atCurrentCaret){ //オフセットがカーソル位置以後の場合、かつ、オフセット-修飾前文字列長よりカーソル位置が後ろの場合
						stringAtCaret = planeAddText.substring(0,(atCurrentCaret - offsetTextLength+planeAddTextLength-i));//カーソルの文字列はplaneAddTextのうちキャレットの位置まで
						comvertedCaret += br+ me.comvertStringToHTML(stringAtCaret);//キャレットまでの文字列に修飾を実施 修飾済み文字列に変化したものを改行をつけて追加
					}
					comverted += br + add;	//変換済みには結局変換済みの行を追加する。
					br="<br />";			//初回改行を無効化するためここで初登場
					count++;				//回りこみ行カウントアップ
					brCount++;				//改行数
					if(offsetTextLength - rowTextLength >=0){//オフセットが行の長さ以上になっていたらここでループ離脱。
						break;//ループ離脱
					}
					domRow.css("height",(rowHeight*(brCount+1))+"px");//行数をアップ
					counter =0;//行の文字数をリセット
				}else{
					counter ++;//横スクロールが発生している場合一文字分増やす
				}
				if((rowTextLength - counter) - offsetTextLength<=0){//もし、オフセット分＋行表示分が行文字列よりも長くなったらループを離脱
					break;//ループ離脱
				}
				
				currentLength += rowText.length;//現在の文字列長に行の長さを追加。
			}
			
			var heightCurrentRow = (domRow.attr('scrollHeight')-1);//行のスクロール込みの高さを取得。
			domRow.css("height",heightCurrentRow+"px");				//行の表示をそのサイズに設定。
			rowNum.css("height",(heightCurrentRow-0)+"px");			//行番号表示も同様に設定
			domRow.html(comverted);									//実際に行に修飾済みの内容を反映。
			me.caretSpacerUpper.html(comvertedCaret);				//カーソルまでの修飾済み文字列を設定
			var height2UpperCaretRow = me.caretSpacerUpper.attr('scrollHeight')-2;//カーソル上部の高さをスクロール分込みで取得
			me.caretSpacerUpper.css("height",(height2UpperCaretRow-0)+"px");//カーソル上部空間に高さを設定
			me.caretSpacerInRowme.css("display","block").css("height",(rowHeight-1)+"px");//カーソル自身の行数までを表示に設定かつ、高さを行のサイズ-1に設定
			me.caretSpacerInRowme.html(me.comvertStringToHTML(stringAtCaret));//キャレットまでの修飾前文字列を設定
			var nowHeight = me.caretSpacerInRowme.attr('scrollHeight')-2;//キャレットまでの修飾文字列行のサイズをスクロール込みで取得
			
			var afterStringNonLF= rowText.substring(atCurrentCaret-i,(rowTextLength));									//ここで、キャレット位置から後方の禁則処理までのもじを取得する。
			if(rowTextLength-atCurrentCaret+i>0){
				alert(afterStringNonLF);
			}
			if(nowHeight>rowHeight-1){																				//キャレットまでの高さが行の規程高さよりも大きい場合（回りこみが発生している場合）
				var SAClength =stringAtCaret.length;																//キャレットまでの修飾前文字列の長さを取得
				var lastRowStrig2Caret = "";																		//回りこみを加味した最終行の変数を宣言
				for(var n= 0;n<SAClength ;n++){//回りこみ文字数を特定すべく一文字ずつ検証//現状3文字で見ているが、これを回りこみ文字で指定する必要がある。
					var currentLength = SAClength-n;																//現在の文字列長を取得（ターゲット文字列長-n）
					var currentChar = stringAtCaret.substring(currentLength-1, currentLength);						//現在の最後尾の文字を取得
					var preChar = n==0?"":stringAtCaret.substring(currentLength, currentLength+1);					//最初の場合のみ空文字を設定、そうでない場合は直前の文字を取得
					me.caretSpacerInRowme.css("height",(rowHeight-1)+"px");											//再度、スクロール分を採取するためサイズを元に戻す
					me.caretSpacerInRowme.html(me.comvertStringToHTML(stringAtCaret.substring(0, currentLength-1)));//修飾を実施して再度投入
					var nowHeightMod = me.caretSpacerInRowme.attr('scrollHeight')-2;								//現在の行の高さスクロール込みで取得
					if(nowHeight-10>nowHeightMod){																	//もし、差分が１０以上ある場合を処理
						if(currentChar.match(/[a-zA-Z]/) && preChar.match(/[a-zA-Z]/)){								//二文字連続でアルファベットが続く場合
							for(var m=1;m<currentLength;m++){														//検証地点よりも前を一文字ずつ検証
								var currentCharAfter = stringAtCaret.substring(currentLength-m-1,currentLength-m);	//一文字先を取得
								if(currentCharAfter.match(/[^a-zA-Z]/)){											//その文字もアルファベットであった場合
									lastRowStrig2Caret = stringAtCaret.substring(currentLength-m,SAClength-1);		//最終文字列に追加
									break;
								}
							}
						
						}else{//差分がない場合
							lastRowStrig2Caret = stringAtCaret.substring(currentLength,SAClength-1);//最終文字列は現在位置より最終もじまで
						}
						break;
					}
				}
				me.caretSpacer.html(me.comvertStringToHTML(lastRowStrig2Caret));	//実際の修飾済みのものをキャレットスペースに設定
			}else{//回りこみが発生していない場合
				me.caretSpacer.html(me.comvertStringToHTML(stringAtCaret));			//修飾なしの文字列を供給
			}
			var width2Caret = me.caretSpacer.attr('scrollWidth');								//スクロール込みのサイズを取得
			me.caretSpacer.css("top",top+nowHeight-me.lineHeight-0).css("width",width2Caret);	//キャレットスペーサのyの位置をボックスy+高さ-行の高さで指定＋サイズをスクロール込みに指定。
			me.dataConverted[i] = comverted;													//データとして変換済みをリストに登録
			me.caretSpacerInRow.css("top",top+nowHeight-me.lineHeight-1).css("left",left+width2Caret+1);//キャレットスペーサ行のyの位置をボックスy+高さ-行の高さで指定＋x位置をボックスx＋スクロール込みに指定。
		}
		for(var n= list.length;n<domRows.length;n++){//各リストサイズを開始位置として行要素を設定
			domRows.eq(n).remove();//行要素を削除
			rowNums.eq(n).remove();//行番号も削除
		}
		me.data = list.concat();//データにリストをコピー
		me.onScroll(event);//スクロールイベントを招聘
	},
	//スクロール時に表示？
	onScroll:function(event){
		var me = event.data.self;//自分自身を呼び出し
		var scrollTop = me.textarea.scrollTop();//スクロールを付随
		me.view.scrollTop(scrollTop);
		me.lineNum.scrollTop(scrollTop);
	},
	attatchMainTre:function(attachPoint){
		attachPoint.append(this.frame);
		this.textarea.unbind("keyup",this.onEdit);
		this.textarea.bind("keyup",{"self":this},this.onEdit);
		this.textarea.unbind("scroll",this.onEdit);
		this.textarea.bind("scroll",{"self":this},this.onScroll);
		this.setFrameSize(this.baseLineNumWidth, this);
	},
	setFrameSize:function(size,me){
		var position = me.frame.position();
		var top = position.top;
		var left = position.left;
		var realLeft = left + size;
		var realWidth = (me.width - size);
		me.textarea.css("top",top).css("left",realLeft+"px").css("width",realWidth+"px");
		me.textarea2.css("top",top+200).css("left",(realLeft+realWidth+1200)+"px").css("width",realWidth+"px");
		me.view.css("top",top).css("left",realLeft+"px").css("width",realWidth+"px");
		me.caretSpacer.css("top",top).css("left",realLeft+"px").css("width",realWidth+"px");
		me.caretSpacerUpper.css("top",top).css("left",realLeft+"px").css("width",realWidth+"px");
		me.caretSpacerInRow.css("top",top).css("left",realLeft+"px").css("width",0+"px").css("height",me.lineHeight+"px");
		me.caretSpacerOnRow.css("top",top).css("left",realLeft+"px").css("width",realWidth+"px");
		me.caretSpacerInRowme.css("top",top).css("left",realLeft+"px").css("width",realWidth+"px").css("display","none");
		me.lineNum.css("top",top).css("left",left);
		
	},
	comvertStringToHTML:function(str){
		return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
		.replace(/\t/g,"<pre&nbsp;style='display:inline;border:0px;margin:0px;padding:0px;'>&_#_0_9_;</pre>").replace(/\s/g,"&thinsp;&thinsp;").replace(/&_#_0_9_;/g,"&#09;")
		.replace(/pre&nbsp;style/g,"pre style");
	}
		
	
}
