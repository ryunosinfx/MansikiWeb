//諸事情によりグローバルに置く
var mansikiWorkMng;
function MansikiInit(){
	var text ;
	mansikiWorkMng = new MansikiWorkManager();
}
//こりゃあかん、作品単位での管理が必要

function buildMansikiHilight(){
	var list = new HilightingSyntax();
	var callbackFunc = function(pre,text,regexp,type){
		if(mansikiWorkMng===undefined){
			return ;
		}
		return mansikiWorkMng.add(pre,text,regexp,type);//
	};
	//ページ単位 name,cssClassName,regix,preRoule,type,scope
	var pageRule =new HilightingSyntaxRule(name,"page","^[Page](.+)$","","page","page");
	pageRule.setCallBack(callbackFunc);
	list.addRule(pageRule,"AAAA");
	//コマ単位
	var komaRule =new HilightingSyntaxRule(name,"koma","^[Koma](.+)$","","koma","koma");
	komaRule.setCallBack(callbackFunc);
	list.addRule(pageRule,"BAAA");
	//吹き出し単位
	var fukidashiRule =new HilightingSyntaxRule(name,"fukidashi","^【([^】]+)】[()] ()","","fukidashi","koma");
	fukidashiRule.setCallBack(callbackFunc);
	list.addRule(fukidashiRule,"BBA");
	//ナレーション単位
	var nalationRule =new HilightingSyntaxRule(name,"nalation","^NA(.+)$","","nalation","koma");
	nalationRule.setCallBack(callbackFunc);
	list.addRule(nalationRule,"BBBA");
	//シーン単位
	var seanRule =new HilightingSyntaxRule(name,"sean","()()()","","sean","koma");
	seanRule.setCallBack(callbackFunc);
	list.addRule(seanRule,"BBBA");
	//背景単位
	var backgroundRule =new HilightingSyntaxRule(name,"background","()()()","","background","koma");
	backgroundRule.setCallBack(callbackFunc);
	list.addRule(backgroundRule,"BBBA");
	//設定単位
	var settingRule =new HilightingSyntaxRule(name,"setting","()()()","","setting","koma");
	settingRule.setCallBack(callbackFunc);
	list.addRule(settingRule,"BBCA");
	//ノート単位
	var noteRule =new HilightingSyntaxRule(name,"note","()()()","","note","koma");
	noteRule.setCallBack(callbackFunc);
	list.addRule(noteRule,"BBCB");
	//注釈単位
	var quoteRule =new HilightingSyntaxRule(name,"quote","()()()","","quote","koma");
	quoteRule.setCallBack(callbackFunc);
	list.addRule(quoteRule,"BBCC");
	//ページ区切り
	//見開き
	return 
}
//LinkedListで
var MansikiRowCondition = function(preRow,text,regexp,type){
	this.rowColor="";
	this.textColer="";
	this.rowType=type;
	this.text=text;
	this.preRow=preRow;
	this.regexp=regexp;
	this.func={"func":fucntion(text){alert(text);}
		,"page":function(text){return new MansikiPageManager(text);}//ページ
		,"koma":function(text){return new MansikiKomaManager(text);}//コマ
		,"fukidashi":function(text){return new MansikiFukidashiManager(text);}//吹き出し
		,"nalation":function(text){return new MansikiNalationManager(text);}//ナレーション
		,"sean":function(text){return new MansikiSeanManager(text);}//シーン
		,"setting":function(text){return new MansikisettingManager(text);}//設定
		,"background":function(text){return new MansikiBackgroundManager(text);}//背景
		,"note":function(text){return new MansikiNoteManager(text);}//ノート
		,"quote":function(text){return new MansikiQuoteManager(text);}//注釈
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
	this.title=title;
	this.pageDiarect;
	this.pageStartSide;
	this.title=title;
	this.pagNum;
	this.komaIndex;
	this.komaNum;
	this.currentPage;
	this.pageList=[];
	this.rowConfList=[];
	this.rowSetting=[];
	this.rowConditionList=[];
	this.rowConditionListOld=[];
	this.funcs={};
	this.currentRowStat=new MansikiRowStat();
}
MansikiWorkManager.prototype={
	startRefresh:function(){
		this.rowConditionListOld=this.rowConditionList;
		this.rowConditionList=[];
	},
	add:function(pre,text,regexp,type){//基本
		var size = this.rowConditionList.length;
		var oldRowObj = this.rowConditionListOld[size];
		if(oldRowObj!==undefined && oldRowObj.text===text){
			oldRowObj.preRow=pre;
			this.rowConditionList.push(oldRowObj);
			return oldRowObj.getFormatedRow();//ここで行の内容を書き換える
		}
		var newRowObj= new MansikiRowCondition(pre,text,regexp,type);
		this.rowConditionList.push(newRowObj);
		return newRowObj.getFormatedRow();//ここで行の内容を書き換える
	},
	makeRowStat:function(){
		return new MansikiRowStat();
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
	,init(title,author,license,pageDirect,startSide,){
	
	}
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
	checkParentPage;function(){
		
	},
	update;function(){
	
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
	this.backgroundIndex;
	this.settingIndex;
	this.noteIndex;
	this.quoteIndex;
}
MansikiRowStat.prototype={
	
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



