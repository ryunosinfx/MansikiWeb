//諸事情によりグローバルに置く
var mansikiWorkMng;
function MansikiInit(){
	mansikiWorkMng = new MansikiWorkManager();
}
//こりゃあかん、作品単位での管理が必要
//LinkedListで
var MansikiRowCondition = function(preRow,text,regexp,type){
	this.rowColor="";
	this.textColer="";
	this.rowType=type;
	this.text=text;
	this.preRow=preRow;
	this.regexp=regexp;
	this.func={"func":function(text){alert(text);}
		,"page":function(text){return new MansikiPageManager(text);}//ページ
		,"koma":function(text){return new MansikiKomaManager(text);}//コマ
		,"fukidashi":function(text){return new MansikiFukidashiManager(text);}//吹き出し
		,"nalation":function(text){return new MansikiNalationManager(text);}//ナレーション
		,"sean":function(text){return new MansikiSeanManager(text);}//シーン
		,"setting":function(text){return new MansikisettingManager(text);}//設定
		,"background":function(text){return new MansikiBackgroundManager(text);}//背景
		,"note":function(text){return new MansikiNoteManager(text);}//ノート
		,"quote":function(text){return new MansikiQuoteManager(text);}//注釈
		,"review":function(text){return new MansikiQuoteManager(text);}//注釈
		,"comment":function(text){return new MansikiQuoteManager(text);}//注釈
	}
	this.RowObje=this.func[type]();
}
MansikiRowCondition.prototype={
	getParentObj:function(type){//再帰でたどる
		if(preRow!==undefined){
			if(preRow.rowType==type){
				return RowObje;
			}else{
				return preRow.getParentObj(type);
			}
		}
		return "";
	},
	checkHasParentObj:function(){
		
	},
	forceCreatePage:function(){//強制追加
	
	},
	forceCreateKoma:function(){
	
	},
	overWriteTheRow:function(){
		return this.RowObje.getFormatedRow();
	},
	getRowObje:function(){
		return this.RowObje;
	},
	getFormatedRow:function(){
		return this.RowObje.getFormatedRow();
	}
}
//固定打ちというか一行目はこのデータであるべきだよね。
var MansikiWorkManager = function(){
	this.title;
	this.pageDiarect;
	this.pageStartSide;
	this.pagNum;
	this.komaIndex;
	this.komaNum;
	this.currentPage;
	this.pageList=[];
	this.rowConfList=[];
	this.rowSetting=[];
	this.rowConditionList=[];
	this.rowConditionListOld=[];
	this.rowStats=[];
	this.funcs={"test":"test"
		,"page":function(rowStat){var pi= rowstat.pageIndex;rowstat.clear();rowstat.pageIndex=pi;}
		,"koma":function(rowStat){}
		,"fukidashi":function(rowStat){}
		,"nalation":function(rowStat){}
		,"sean":function(rowStat){}
		,"background":function(rowStat){}
		,"setting":function(rowStat){}
		,"note":function(rowStat){}
		,"quote":function(rowStat){}
		};
	this.currentRowStat=new MansikiRowStat();
	this.hilightRules;
	this.buildMansikiHilight();
}
MansikiWorkManager.prototype={
	buildMansikiHilight:function (){
		var list = new HilightingSyntax();
		var callbackFunc = function(text,regexp,type){
			//alert("callback!!!");
			if(mansikiWorkMng===undefined){
				return ;
			}
			///alert("callback!!!");
			return mansikiWorkMng.add(text,regexp,type,mansikiWorkMng);//
		};
		//ページ単位 name,cssClassName,regix,preRoule,type,scope
		var pageRule =new HilightingSyntaxRule(name,"page","^\\\[Page\\\](.+)$","","page","page",callbackFunc,"[Page]");
		list.addRule(pageRule,"AAAA");
		//コマ単位
		var komaRule =new HilightingSyntaxRule(name,"koma","^\s*\[Koma\](.+)$","","koma","koma",callbackFunc,"[Koma]");
		list.addRule(pageRule,"BAAA");
		//吹き出し単位
		var fukidashiRule =new HilightingSyntaxRule(name,"fukidashi","^\s*【([^】]+)】\[()\] ()","","fukidashi","koma",callbackFunc,"【Koma】");
		list.addRule(fukidashiRule,"BBA");
		//ナレーション単位
		var nalationRule =new HilightingSyntaxRule(name,"nalation","^\s*NA(.+)$","","nalation","koma",callbackFunc,"  NA:");
		list.addRule(nalationRule,"BBBA");
		//シーン単位
		var seanRule =new HilightingSyntaxRule(name,"sean","^\s*S:(.+)$","","sean","koma",callbackFunc,"S:");
		list.addRule(seanRule,"BBBA");
		//背景単位
		var backgroundRule =new HilightingSyntaxRule(name,"background","^\s*BG:(.+)$","","background","koma",callbackFunc,"    BG:");
		list.addRule(backgroundRule,"BBBA");
		//設定単位
		var settingRule =new HilightingSyntaxRule(name,"setting","^\s*set:(.+)$","","setting","koma",callbackFunc,"    set:");
		list.addRule(settingRule,"BBCA");
		//ノート単位
		var noteRule =new HilightingSyntaxRule(name,"note","^\s*Note:(.+)$","","note","koma",callbackFunc,"    Note:");
		list.addRule(noteRule,"BBCB");
		//注釈単位
		var quoteRule =new HilightingSyntaxRule(name,"quote","^\s*Quote:(.+)$","","quote","koma",callbackFunc,"    Quote:");
		list.addRule(quoteRule,"BBCC");
		//ページ区切り
		//見開き
		this.hilightRules= list;
	},
	getHilightRules:function(){
		return this.hilightRules;
	},
	startRefresh:function(){
		this.rowConditionListOld=this.rowConditionList;
		this.rowConditionList=[];
	},
	add:function(text,regexp,type,me){//基本
		var size = me.rowConditionList.length;
		if(size > 0){
			var pre = me.rowConditionList[size-1];
			var oldRowObj = me.rowConditionListOld[size];
			if(oldRowObj!==undefined && oldRowObj.text===text){
				oldRowObj.preRow=pre;
				this.rowConditionList.push(oldRowObj);
				return oldRowObj.getFormatedRow();//ここで行の内容を書き換える
			}
		}
		var newRowObj= new MansikiRowCondition(pre,text,regexp,type);
		me.rowConditionList.push(newRowObj);
		me.rowStats.push(me.makeRowStat(type,me));
		//alert("now!now!");
		return newRowObj.getFormatedRow();//ここで行の内容を書き換える
	},
	makeRowStat:function(me,type){
		 var rowstat =new MansikiRowStat();
		rowstat.copy(me.currentRowStat,type);
		rowstat.nowStat();
		return rowstat;
	},
	addPage:function(page){
		this.pageList.push(page);
	},
	delPage:function(index){
	},
	mvPage:function(index){
	},
	getNonble:function(){
	},
	getSide:function(index){
	
	},
	init:function(title,author,license,pageDirect,startSide){
	
	},
	getFormatedRow:function(){
		return "";
	}
}

var MansikiPageManager =function(rowData){
	this.idPrefix="page";
	this.id=this.idPrefix+createId();
	this.rowData = rowData;
	this.komaList=[];
	this.fukidashiList=[];
	this.narationList=[];
}
MansikiPageManager.prototype={
	change:function(){
	},
	addKoma:function(koma){
		this.komaList.push(koma);
	},
	removeKoma:function(koma){
		var length=this.komaList.length;
		var newList=[];
		for(var i=0;i<length;i++){
			if(this.komaList[i].getId!==koma.getId){
				newList.push (this.komaList[i]);
			}
		}
		this.komaList=newList;
	},
	addFukidashi:function(fukidashi){
		this.fukidashiList.push(fukidashi);
	},
	addFukidashi:function(fukidashi){
		var length=this.fukidashiList.length;
		var newList=[];
		for(var i=0;i<length;i++){
			if(this.fukidashiList[i].getId!==fukidashi.getId){
				newList.push (this.fukidashiList[i]);
			}
		}
		this.fukidashiList=newList;
	},
	getFormatedRow:function(){
		return "";
	}
}

var MansikiKomaManager =function(index,border,style,parentPage){
	//location
	//
	this.idPrefix="koma";
	this.id=this.idPrefix+createId();
	this.index=index;
	this.border=border;
	this.borderWidth=borderWidth;
	this.parentPage=parentPage;
	this.style= style;
	this.top=top;
	this.left=left;
	this.FrameZIndex;
	this.picZIndex;
	this.canvas;
	this.rowStat;
}
MansikiKomaManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	checkParentPage:function(){
		
	},
	update:function(){
	
	},
	getFormatedRow:function(){
		return "";
	}
}
//
var MansikiFukidashiManager =function(serifu,sender,parentKoma){
	this.idPrefix="fukidashi";
	this.id=this.idPrefix+createId();
	this.sender=sender;
	this.serifu=serifu;
	this.zindex=zindex;
	this.parentKoma=parentKoma ;
	this.lineStyle;
	this.top;
	this.left;
}
MansikiFukidashiManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	setSerifu:function(serifu){
		this.serifu=serifu;
	},
	setSender:function(sender){
		this.sender=sender;
	},
	getFormatedRow:function(){
		return "";
	}
}
//
var MansikiNalationManager=function(text,parentKoma){
	this.idPrefix="nalation";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.top=top;
	this.left=left;
	this.fontsize=fontsize;
	this.align="center";
	this.zindex=index;
	this.parent=koma;
}
MansikiNalationManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	move:function(top,left){
		this.top=top;
		this.left=left;
	},
	updateText:function(text){
	
	},
	setFontSize:function(px){
	
	},
	getFormatedRow:function(){
		return "";
	}
}
//
var MansikiSeanManager=function(text,parentKoma){
	this.idPrefix="nalation";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.top=top;
	this.left=left;
	this.fontsize=fontsize;
	this.align="center";
	this.zindex=index;
	this.parent=koma;
}
MansikiSeanManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	move:function(top,left){
		this.top=top;
		this.left=left;
	},
	updateText:function(text){
	
	},
	setFontSize:function(px){
	
	},
	getFormatedRow:function(){
		return "";
	}
}
//
var MansikiBackgroundManager=function(text,parentKoma){
	this.idPrefix="nalation";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.top=top;
	this.left=left;
	this.fontsize=fontsize;
	this.align="center";
	this.zindex=index;
	this.parent=koma;
}
MansikiBackgroundManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	move:function(top,left){
		this.top=top;
		this.left=left;
	},
	updateText:function(text){
	
	},
	setFontSize:function(px){
	
	},
	getFormatedRow:function(){
		return "";
	}
}
//
var MansikiSettingManager=function(text,parentKoma){
	this.idPrefix="nalation";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.top=top;
	this.left=left;
	this.fontsize=fontsize;
	this.align="center";
	this.zindex=index;
	this.parent=koma;
}
MansikiSettingManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	move:function(top,left){
		this.top=top;
		this.left=left;
	},
	updateText:function(text){
	
	},
	setFontSize:function(px){
	
	},
	getFormatedRow:function(){
		return "";
	}
}
//
var MansikiNoteManager=function(text,parentKoma){
	this.idPrefix="nalation";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.top=top;
	this.left=left;
	this.fontsize=fontsize;
	this.align="center";
	this.zindex=index;
	this.parent=koma;
}
MansikiNoteManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	move:function(top,left){
		this.top=top;
		this.left=left;
	},
	updateText:function(text){
	
	},
	setFontSize:function(px){
	
	},
	getFormatedRow:function(){
		return "";
	}
}
//
var MansikiQuoteManager=function(text,parentKoma){
	this.idPrefix="nalation";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.top=top;
	this.left=left;
	this.fontsize=fontsize;
	this.align="center";
	this.zindex=index;
	this.parent=koma;
}
MansikiQuoteManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	move:function(top,left){
		this.top=top;
		this.left=left;
	},
	updateText:function(text){
	
	},
	setFontSize:function(px){
	
	},
	getFormatedRow:function(){
		return "";
	}
}
//
var MansikiRowStat=function(){
	this.pageIndex;
	this.komaIndex;
	this.fukidashiIndex;
	this.nalationIndex;
	this.seanIndex;
	this.settingIndex;
	this.backgroundIndex;
	this.noteIndex;
	this.quoteIndex;
	this.reviewIndex;
	this.commentIndex;
	this.rowColor;
	this.indentLevel;
}
MansikiRowStat.prototype={
	addPage:function(preRowStat){
		this.pageIndex=preRowStat.pageIndex+1;
	},
	clean:function(type){
		var funcs ={"func":function(text,self){alert(text);}
			,"page":function(self){self.pageIndex=0;}//ページ
			,"koma":function(self){self.komaIndex=0;}//コマ
			,"fukidashi":function(self){self.fukidashiIndex=0;}//吹き出し
			,"nalation":function(self){self.nalationIndex=0;}//ナレーション
			,"sean":function(self){self.seanIndex=0;}//シーン
			,"setting":function(self){self.settingIndex=0;}//設定
			,"background":function(self){self.backgroundIndex=0;}//背景
			,"note":function(self){self.noteIndex=0;}//ノート
			,"quote":function(self){self.quoteIndex=0;}//注釈
			,"review":function(self){self.reviewIndex=0;}//レビュー記録
			,"comment":function(self){self.commentIndex=0;}//コメント
			,"rowColor":function(self){self.rowColor="";}//カラー
			,"indentLevel":function(self){self.indentLevel=0;}//注釈
		};
	},
	cleanPage:function(){this.clean("page");},
	cleanKoma:function(){this.clean("koma");},
	cleanFukidashi:function(){this.clean("fukidashi");},
	cleanNalation:function(){this.clean("nalation");},
	cleanSean:function(){this.clean("sean");},
	cleanSetting:function(){this.clean("setting");},
	cleanBackground:function(){this.clean("background");},
	cleanNote:function(){this.clean("note");},
	cleanQuote:function(){this.clean("quote");},
	cleanReview:function(){this.clean("review");},
	cleanComment:function(){this.clean("comment");},
	cleanRowColor:function(){this.clean("rowColor");},
	cleanIndentLevel:function(){this.clean("indentLevel");},
	copy:function(preRowStat,type){
		if(preRowStat===undefined){
			this.clean(type);
			return ;
		}
		this.pageIndex = preRowStat.pageIndex;
		this.komaIndex = preRowStat.komaIndex;
		this.fukidashiIndex = preRowStat.fukidashiIndex;
		this.nalationIndex = preRowStat.nalationIndex;
		this.seanIndex = preRowStat.seanIndex;
		this.backgroundIndex = preRowStat.backgroundIndex;
		this.settingIndex = preRowStat.settingIndex;
		this.noteIndex = preRowStat.noteIndex;
		this.quoteIndex = preRowStat.quoteIndex;
		this.reviewIndex = preRowStat.reviewIndex;
		this.commentIndex = preRowStat.commentIndex;
		this.rowColor = preRowStat.rowColor;
		this.indentLevel = preRowStat.indentLevel;
	},
	nowStat:function(){
		$("#inputText4").val(this.toSource());
	}
	
}
//
var MansikiStyle=function(){
	
}
MansikiStyle.prototype={
	
}
//
var MansikiKomaStyle=function(name){
	
}
MansikiKomaStyle.prototype={
	
}
//
var MansikiFukidashiStyle=function(name){
	
}
MansikiFukidashiStyle.prototype={
	
}
var id_Seed="";
function createId(){
	return new Date().getTime();
}



