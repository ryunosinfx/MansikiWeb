//諸事情によりグローバルに置く
var mansikiWorkMng;
function MansikiInit(){
	mansikiWorkMng = new MansikiWorkManager();
}
//こりゃあかん、作品単位での管理が必要
//LinkedListで
var MansikiRowCondition = function(preRow,text,regexp,type,rowstat){
	this.rowColor="";
	this.textColer="";
	this.rowType=type;
	this.text=text;
	this.preRow=preRow;
	this.regexp=regexp;
	this.func={"func":function(text){alert(text);}
		,"page":function(text,rowstat){return new MansikiPageManager(text,rowstat);}//ページ
		,"koma":function(text,rowstat){return new MansikiKomaManager(text,rowstat);}//コマ
		,"fukidashi":function(text,rowstat){return new MansikiFukidashiManager(text,rowstat);}//吹き出し
		,"nalation":function(text,rowstat){return new MansikiNalationManager(text,rowstat);}//ナレーション
		,"sean":function(text,rowstat){return new MansikiSeanManager(text,rowstat);}//シーン
		,"setting":function(text,rowstat){return new MansikisettingManager(text,rowstat);}//設定
		,"background":function(text,rowstat){return new MansikiBackgroundManager(text,rowstat);}//背景
		,"note":function(text,rowstat){return new MansikiNoteManager(text,rowstat);}//ノート
		,"quote":function(text,rowstat){return new MansikiQuoteManager(text,rowstat);}//注釈
		,"review":function(text,rowstat){return new MansikiReviewManager(text,rowstat);}//レビュー
		,"comment":function(text,rowstat){return new MansikiCommentManager(text,rowstat);}//コメント
		,"row":function(text,rowstat){return new MansikiRowManager(text,rowstat);}//注釈
	}
	this.RowObje=this.func[type](text,rowstat);
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
	updateRowStat:function(rowstat){
		this.RowObje.rowstat= rowstat;
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
	isOverride:function(){
		return this.RowObje.isForceFormat();
	},
	getFormatedRow:function(){
		var formated = this.RowObje.getFormatedRow();
		if(formated===undefined || formated.length <1 || this.RowObje.isForceFormat()==false){
			return this.text;
		}
		return formated;
	},
	getRowColor:function(){
		var bgColor = this.RowObje.getRowColor();
		if(bgColor===undefined || bgColor.length <1){
			return getCurrentMansikiRowColor(this.RowObje.rowstat);
		}
		return bgColor;
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
	this.pageList={};
	this.rowConfList=[];
	this.rowSetting=[];
	this.rowConditionList=[];
	this.rowConditionListOld=[];
	this.rowStats={};
	this.rowStatsOld={};
	this.rowStatEditorFuncs={"test":"test" //page>koma>hukidashi=nalation=sean=background=setting=note=quote
		,"page":function(rs){var pi= rs.pageIndex;rs.clear();rs.addOne("page",pi); return rs;}
		,"koma":function(rs){var pi= rs.pageIndex;var ki=rs.komaIndex;rs.clear();rs.pageIndex=pi;rs.addOne("koma",ki); return rs;}
		,"fukidashi":function(rs){rs.addOne("fukidashi"); return rs;}
		,"nalation":function(rs){rs.addOne("nalation"); return rs;}
		,"sean":function(rs){rs.addOne("sean");return rs;}
		,"background":function(rs){rs.addOne("background"); return rs;}
		,"setting":function(rs){rs.addOne("setting"); return rs;}
		,"note":function(rs){rs.addOne("note"); return rs;}
		,"quote":function(rs){rs.addOne("quote"); return rs;}
		,"review":function(rs){rs.addOne("review"); return rs;}
		,"comment":function(rs){rs.addOne("comment"); return rs;}
		,"row":function(rs){rs.addOne("row"); return rs;}
		};
	this.currentRowStat=new MansikiRowStat();
	this.hilightRules;
	this.buildMansikiHilight();
}
MansikiWorkManager.prototype={
	buildMansikiHilight:function (){
		var list = new HilightingSyntax();
		var callbackFunc = function(text,regexp,type,el,index){
			return mansikiWorkMng.add(text,regexp,type,mansikiWorkMng,el,index);
		};
		//ページ単位 name,cssClassName,regix,preRoule,type,scope
		var pageRule =new HilightingSyntaxRule(name,"page","^\\\[Page\\\](.+)$","","page","page",callbackFunc,"[Page]");
		list.addRule(pageRule,"ZAAA");
		//コマ単位
		var komaRule =new HilightingSyntaxRule(name,"koma","\\\[Koma\\\](.+)$","","koma","koma",callbackFunc,"[Koma]");
		list.addRule(komaRule,"YAAA");
		//吹き出し単位
		var fukidashiRule =new HilightingSyntaxRule(name,"fukidashi","^\s*【([^】]+)】\\\[()\\\] ()","","fukidashi","koma",callbackFunc,"【Koma】");
		list.addRule(fukidashiRule,"XBBA");
		//ナレーション単位
		var nalationRule =new HilightingSyntaxRule(name,"nalation","^\s*NA(.+)$","","nalation","koma",callbackFunc,"  NA:");
		list.addRule(nalationRule,"VBBA");
		//シーン単位
		var seanRule =new HilightingSyntaxRule(name,"sean","^\s*S:(.+)$","","sean","koma",callbackFunc,"S:");
		list.addRule(seanRule,"UBBA");
		//背景単位
		var backgroundRule =new HilightingSyntaxRule(name,"background","^\s*BG:(.+)$","","background","koma",callbackFunc,"    BG:");
		list.addRule(backgroundRule,"UBBBA");
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
		//なんにもない行
		var nomalRule =new HilightingSyntaxRule(name,"row","^(.*)$","","row","row",callbackFunc,"");
		list.addRule(nomalRule,"AAAA");
		this.hilightRules= list;
	},
	getHilightRules:function(){
		return this.hilightRules;
	},
	startRefresh:function(){
		this.rowConditionListOld=this.rowConditionList;
		this.rowConditionList=[];
		this.rowStatsOld=this.rowStats;
		this.rowStats={};
	},
	add:function(text,regexp,type,me,el,foleanIndex){//基本
		var size = me.rowConditionList.length;
		if(size > 0){
			var index = size-1;
			var pre = me.rowConditionList[index];
			var oldRowObj = me.rowConditionListOld[size];
			if(oldRowObj!==undefined && oldRowObj.text===text && text.length >0){
				oldRowObj.preRow=pre;
				this.rowConditionList.push(oldRowObj);
				el.setText(oldRowObj.getFormatedRow());
				el.setBgColor(oldRowObj.getRowColor());
				el.setOverride(oldRowObj.isOverride());
				//this.rowStats[index]=this.rowStatsOld[index];
				me.makeRowStat(me,type,size,foleanIndex)
				return el;//ここで行の内容を書き換える
			}
		}
		var newRowObj= new MansikiRowCondition(pre,text,regexp,type,me.makeRowStat(me,type,size,foleanIndex));
		me.rowConditionList.push(newRowObj);
		el.setText(newRowObj.getFormatedRow());
		el.setBgColor(newRowObj.getRowColor());
		el.setOverride(newRowObj.isOverride());
		return el;//ここで行の内容を書き換える
	},
	makeRowStat:function(me,type,index,foleanIndex){
		 var rowstat =new MansikiRowStat();
		if(foleanIndex!==undefined){
			index = foleanIndex*1;
		}
		var indexes=[];
		for(var idx in me.rowStats){
			if(index*1 > idx*1){
				indexes.push(idx*1);
			}
		}
		indexes.sort(function(a , b){return b - a;});
		for(var i =0;i<indexes.length ;i++){
		 	var preStats = me.rowStats[indexes[i]];
			if(preStats!==undefined ){
				break;
			}
		}
		rowstat.copy(preStats,type);
		me.currentRowStat = me.rowStatEditorFuncs[type](rowstat);
		 
		rowstat.nowStat();
		me.rowStats[index*1]=me.currentRowStat;
		return me.currentRowStat;
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

var MansikiPageManager =function(rowData,rowstat){
	this.idPrefix="page";
	this.id=this.idPrefix+createId();
	this.rowData = rowData;
	this.rowstat = rowstat;
	mansikiWorkMng.pageList[rowstat.pageIndex]=this;
	this.komaList={};
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
		return "[Page] "+this.rowstat.pageIndex+"p";
	},
	isForceFormat:function(){
		return true;
	},
	getRowColor:function(){
		return "#017318";
	}
}

var MansikiKomaManager =function(index,rowstat,border,style,parentPage){
	this.idPrefix="koma";
	this.id=this.idPrefix+createId();
	this.index=index;
	this.rowstat = rowstat;
	this.border="solid";
	this.borderWidth=1;
	this.parentPage=mansikiWorkMng.pageList[rowstat.pageIndex];
	if(this.parentPag!==undefined){
		this.parentPage.komaList[rowstat.komaIndex]=this;
	}
	this.style= "";
	this.top=0;
	this.left=0;
	this.FrameZIndex;
	this.picZIndex;
	this.canvas;
	this.rowStat;
	console.log("new MansikiKomaManager!");
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
		return "　[Koma] "+this.rowstat.komaIndex+",top:"+this.top+",left:"+this.left;
	},
	isForceFormat:function(){
		return true;
	},
	getRowColor:function(){
		return "#017318";
	}
}
//
var MansikiFukidashiManager =function(serifu,rowstat,sender,parentKoma){
	this.idPrefix="fukidashi";
	this.id=this.idPrefix+createId();
	this.sender=sender;
	this.serifu=serifu;
	this.rowstat = rowstat;
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
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return ;
	}
}
//
var MansikiNalationManager=function(text,rowstat,parentKoma){
	this.idPrefix="nalation";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.rowstat = rowstat;
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
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return ;
	}
}
//
var MansikiSeanManager=function(text,rowstat,parentKoma){
	this.idPrefix="sean";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.rowstat = rowstat;
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
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return ;
	}
}
//
var MansikiBackgroundManager=function(text,rowstat,parentKoma){
	this.idPrefix="background";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.rowstat = rowstat;
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
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return ;
	}
}
//
var MansikiSettingManager=function(text,rowstat,parentKoma){
	this.idPrefix="setting";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.rowstat = rowstat;
	this.parent=parentKoma;
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
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return ;
	}
}
//
var MansikiNoteManager=function(text,rowstat,parentKoma){
	this.idPrefix="note";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.rowstat = rowstat;
	this.parent=parentKoma;
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
	getFormatedRow:function(){
		return "";
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return ;
	}
}
//
var MansikiQuoteManager=function(text,rowstat,parentKoma){
	this.idPrefix="quote";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.rowstat = rowstat;
	this.parent=parentKoma;
}
MansikiQuoteManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	updateText:function(text){
	
	},
	getFormatedRow:function(){
		return "";
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return ;
	}
}
//
var MansikiReviewManager=function(text,rowstat,parentKoma){
	this.idPrefix="review";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.rowstat = rowstat;
	this.parent=parentKoma;
}
MansikiReviewManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	updateText:function(text){
	
	},
	getFormatedRow:function(){
		return "";
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return ;
	}
}
//
var MansikiCommentManager=function(text,rowstat,parentKoma){
	this.idPrefix="comment";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.rowstat = rowstat;
	this.parent=parentKoma;
}
MansikiCommentManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	updateText:function(text){
	
	},
	getFormatedRow:function(){
		return "";
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return ;
	}
}
//
var MansikiRowManager=function(text,rowstat,parentKoma){
	this.idPrefix="row";
	this.id=this.idPrefix+createId();
	this.text=text;
	this.rowstat = rowstat;
	this.parent=parentKoma;
}
MansikiRowManager.prototype={
	feedStat:function(rowStat){
		this.rowStat=rowStat;
	},
	updateText:function(text){
	
	},
	getFormatedRow:function(){
		return this.text;
	},
	isThrough:function(){
		return true;
	},
	isForceFormat:function(){
		return false;
	},
	getRowColor:function(){
		return;//return "#FFE42E";
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
	this.rowIndex;
	this.rowColor;
	this.indentLevel;
}
MansikiRowStat.prototype={
	addPage:function(preRowStat){
		this.pageIndex=preRowStat.pageIndex+1;
	},
	clean:function(type){
		this.set(type,0);
	},
	set:function(type,index){
		var funcs ={"func":function(text,self){alert(text+","+index);}
			,"page":function(self,index){self.pageIndex=index;}//ページ
			,"koma":function(self){self.komaIndex=index;}//コマ
			,"fukidashi":function(self){self.fukidashiIndex=index;}//吹き出し
			,"nalation":function(self){self.nalationIndex=index;}//ナレーション
			,"sean":function(self){self.seanIndex=index;}//シーン
			,"setting":function(self){self.settingIndex=index;}//設定
			,"background":function(self){self.backgroundIndex=index;}//背景
			,"note":function(self){self.noteIndex=index;}//ノート
			,"quote":function(self){self.quoteIndex=index;}//注釈
			,"review":function(self){self.reviewIndex=index;}//レビュー記録
			,"comment":function(self){self.commentIndex=index;}//コメント
			,"rowColor":function(self){self.rowColor=index;}//カラー
			,"indentLevel":function(self){self.indentLevel=index;}//注釈
			,"row":function(self){self.rowIndex=index;}//注釈
		};
		funcs[type](this,index);
	},
	addOne:function(type,index){
		this.set(type,index===undefined?0:index+1);
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
	cleanRow:function(){this.clean("row");},
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
		this.row = preRowStat.row;
		this.rowColor = preRowStat.rowColor;
		this.indentLevel = preRowStat.indentLevel;
	},
	clear:function(){
		this.cleanPage();
		this.cleanKoma();
		this.cleanFukidashi();
		this.cleanNalation();
		this.cleanSean();
		this.cleanSetting();
		this.cleanBackground();
		this.cleanNote();
		this.cleanQuote();
		this.cleanReview();
		this.cleanComment();
		this.cleanRow();
		this.cleanRowColor();
		this.cleanIndentLevel();
	},
	getID:function(){
		return 
		this.pageIndex +this.komaIndex +this.fukidashiIndex +this.nalationIndex +this.seanIndex +this.backgroundIndex +this.settingIndex +this.noteIndex +this.quoteIndex 
		+this.reviewIndex +this.commentIndex +this.rowIndex +this.rowColor +this.indentLevel ;
	},
	nowStat:function(){
		//$("#inputText4").val(this.toSource());
	}
	
}

var mansikiBgColorsMap={"0":"#FFA322","1":"#FFFC29"};
function getCurrentMansikiRowColor(rowstat){
	var code=(rowstat.pageIndex%2)+"";
	//console.log("rowstat.pageIndex:"+rowstat.pageIndex+"/code:"+code);
	return mansikiBgColorsMap[code];
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



