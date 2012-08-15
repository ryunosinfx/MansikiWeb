//ここをWorkerに投げる。

var shBackup ;
var SyntaxHilighter = function(){
	this.maskStringA1="000A"+new Date().getTime()+"D888";
	this.maskStringA2="000B"+new Date().getTime()+"E999";
	this.maskStringB1="111C"+new Date().getTime()+"F888";
	this.maskReA1 = new RegExp(this.maskStringA1, "g");
	this.maskReA2 = new RegExp(this.maskStringA2, "g");
	this.maskReB1 = new RegExp(this.maskStringB1, "g");
	this.maskReA12 = new RegExp(this.maskStringA1+"(.+)"+this.maskStringA2, "g");
}
SyntaxHilighter.prototype={
	comvertStringToHTML:function(str){//ここの処理はWorkerに投げたい。
		str = str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/[　]{1}/g,"<span&nbsp;class='space2'>ぽ</span>")
		.replace(/\t/g,"<pre&nbsp;style='display:inline;border:0px;margin:0px;padding:0px;'>&_#_0_9_;</pre>")
		.replace(/\s/g,"&nbsp;").replace(/&_#_0_9_;/g,"&nbsp;&nbsp;&nbsp;&nbsp;")
		.replace(/pre&nbsp;style/g,"pre style").replace(/span&nbsp;class/g,"span class");
		return str.replace(/[　]{1}/g,"<span class='space2'>&emsp;</span>1");
	},
	setPreData:function(me,str,hsRule,index,rowIndex,isAddrow,caretRowNo){
		me.str=str;
		me.hsRule=hsRule;
		me.index=index;
		me.rowIndex=rowIndex;
		me.isAddrow=isAddrow;
		me.caretRowNo=caretRowNo;
	},
	getPreDataObj:function (me){//Worker化に対応
		return {str:me.str,hsRule:me.hsRule,index:me.index,rowIndex:me.rowIndex,isAddrow:me.isAddrow,caretRowNo:me.caretRowNo};
	},
	loadPreDataByObj:function(me,preDataObj){
		me.setPreData(me,preDataObj.str,preDataObj.hsRule,preDataObj.index,preDataObj.rowIndex,preDataObj.isAddrow,preDataObj.caretRowNo);
	},
	execute:function(me){
		return me.comvertStringToHTMLHilight(me,me.str,me.hsRule,me.index,me.rowIndex,me.isAddrow,me.caretRowNo);
	},
	comvertStringToHTMLHilight:function(me,str,hsRule,index,rowIndex,isAddrow,caretRowNo,mansikiWorkMng){//ここの処理はWorkerに投げたい。
		var size = hsRule.size;
		var el = new ExecutedLine(str);
		var retText =str;
		var typeOfFirst= "";
		//console.log(hsRule.toSource());
		for(var priority in hsRule.ruleList){
			//console.log(el.toSource()+priority);
			var isTypeSet= true;
			var hilightRule = hsRule.ruleList[priority];
			var rexStr = hilightRule.regix;
			rexStr=rexStr.match(/\(/)?rexStr:"("+rexStr+")";
			var re = new RegExp(rexStr,"g");
			var className= hilightRule.cssClassName;
			if(retText.match(re)){
				if(typeOfFirst===""){
					typeOfFirst=hilightRule.type;
					isTypeSet=false;
				}
				var prefix = hilightRule.prefix.length>0?me.maskStringA1+className+"_prefix"+me.maskStringA2+hilightRule.prefix+me.maskStringB1:"";
				if(mansikiWorkMng!==undefined){
					el = mansikiWorkMng.executeCallBack(hilightRule,retText,el,index,caretRowNo==rowIndex,isTypeSet);// TODO mansikiWorkMngをポータブルにする。
				}
				retText = el.text.replace(re,function(preText, p1, offset, s){
					var viewText = p1;
					if(index!==undefined && el.isOverride==true){
						viewText=me.convertClearString(viewText);
					}
					return me.maskStringA1 + className + me.maskStringA2 + prefix+viewText + me.maskStringB1;
				});
			};//~s///g
		}//戻す
		el.text=el.text+"";
		//console.log(el.text+"/"+priority);
		if(isAddrow===true && caretRowNo==rowIndex===true){
			el.text = el.indent + el.text;
			retText = el.indent + retText;
		}
		el.rowIndex = rowIndex;
		el.text = el.text.replace(me.maskReA12,"").replace(me.maskReB1,"");
		el.overrideOffset = el.text.length-str.length;
		el.html=me.comvertStringToHTML(retText).replace(me.maskReA1,"<span class='").replace(me.maskReA2,"'>").replace(me.maskReB1,"</span>");

		return el;
	},
	convertClearString:function(text){
		text = text.replace(/[+\\\|\[\]\{\}\(\)\*\.\?&\$\"\'\!\~\^#,<>1-9a-zA-Y_]/g,"0")//\"
		.replace(/[^0]{1}/g,"　").replace(/0/g," ")
		return text;
	}
}
var HilightingSyntax= function(){
	this.ruleList={};
}
HilightingSyntax.prototype={
	createRule:function(name,cssClassName,regix,preRoule,type,scope,priority){
		if(priority===undefined){
			priority="aaaa"+this.getSize();;//なんできめられないんだっけ？
		}
		this.ruleList[priority]=new HilightingSyntaxRule(name,cssClassName,regix,preRoule,type,scope);
	},
	addRule:function(hilightingSyntaxRule,priority){
		this.ruleList[priority]=hilightingSyntaxRule;
	},
	sortRuleByPriority:function(){
		var keys=[];
		var newMap={};
		for (var priority in this.ruleList){
			keys.push(priority);
		}
		keys.sort();
		for(var i =0;i<keys.length;i++){
			newMap[keys[i]]=this.ruleList[keys[i]];
		}
		this.ruleList=newMap;
	},
	getSize:function(){
		var count = 0;
		for (var priority in this.ruleList){
			count++;
		}
		return count;
	},
	getRouleList:function(){
		return this.ruleList;
	}
	
}
var HilightingSyntaxRule=function(name,cssClassName,regix,preRoule,type,scope,callback,prefix){
	this.name=name;
	this.cssClassName=cssClassName;
	this.regix=regix;
	this.preRoule=preRoule;//必須条件
	this.type=type;//行なのか文字列なのか
	this.scope=scope;//ページとするのか、
	this.callback=callback;
	this.prefix = prefix!==undefined?prefix:"";
}
HilightingSyntaxRule.prototype={

}
var ExecutedLine=function(text){
	this.text=text;
	this.html=text;
	this.addRowText="";
	this.addRowHtml="";
	this.overrideOffset=0;
	this.isOverride=false;
	this.isThrough=false;
	this.bgColor;
	this.indent="";
	this.bgColorAdditionalRow;
	this.rowIndex=0;
}
ExecutedLine.prototype={
}

//Worker渡しデータ
var MansikiHiliteData = function (){
	this.text='';//CSSのクラス名接頭文字
	this.classIdPrefix='';//CSSのクラス名接頭文字
	this.data=[];//全データ
	this.list=[];//全データの改行分割リスト
	this.dataConverted=[];//各行のHTMLデータ
	this.domRowsExist=[];//DOMの情報はすでにあるか
	this.diff=0;//行数変動数
	this.rowIdList=[];//各行のIDリスト
	this.shDataList=[];//各行のハイライト用の出たリスト
	this.resultMap={};//処理済み判別マップ
	this.isThrowList=[];//その行は処理飛ばしして問題ないか
	this.isAddedRows=false;//実際に行の追加はあったか
	this.currentCaret=0;//キャレット位置
	this.caretRowNo=0;//キャレットの行番号
	this.isCaretRowList=[];//キャレット行かどうかのリスト
	this.htmlConvertedToCaret='';//キャレット行の行はじめからキャレットまでのHTML
	this.atCurrentCaret=0;//キャレットまでの文字数
	this.elList=[];//CSSのクラス名接頭文字
	this.ErrorMsg = '';
}


function executeTheJob(sh,hilightData){
	//追加前のやつ。
	mansikiWorkMng.startRefresh();
	var ErrorMsg = '';
	var lensum = 0;
	hilightData.resultMap ={};
	hilightData.isThrowList=[];
	hilightData.isCaretRowList=[];
	hilightData.elList=[];
	var amountLength = 0;
	var atCurrentCaret =0;
	//ここからWorker行き
	for(var i= 0;i<hilightData.list.length;i++){
		var isCaretRow = false;
		var isCaretRowShowed = false;
		var rowText = hilightData.list[i];					//本来その行に存在する文字列情報
		hilightData.rowIdList[i] = hilightData.rowIdList[i]===undefined ? hilightData.classIdPrefix+(i+1):hilightData.rowIdList[i];
		var rowTextLength = rowText.length;	//行文字数
		amountLength += rowTextLength;			//カーソル位置ー今までの全行文字数＋行の長さ//行トータルの集計
		atCurrentCaret = hilightData.currentCaret + rowTextLength - amountLength - i;//キャレット位置
		if(isCaretRow===false && isCaretRowShowed==false && (0 <= atCurrentCaret && atCurrentCaret <= rowTextLength )){
			isCaretRow=true;
			isCaretRowShowed==true;
			hilightData.caretRowNo =i;
			hilightData.atCurrentCaret = atCurrentCaret;
		}else{
			isCaretRow=false;
		}
		var old =(hilightData.data[i]+"").replace(/^[\s\t\r\n]+/g,""); 
		if( rowText.replace(/^[\s\t]+/g,"").length > 0 && isCaretRow==false && old===rowText){//データが動いていないかつカーソルの行位以外はスルー
			hilightData.isThrowList[i]=true;
			continue;//次の行を処理する。
		}
		//console.log(i+'/'+hilightData.list.length+'/'+rowText.replace(/^[\s|\t]+/g,"").length+'/'+isCaretRow);
		var textConverted = sh.comvertStringToHTML(rowText);	
		if(isCaretRow===true){
			hilightData.htmlConvertedToCaret = textConverted
		}
		hilightData.isCaretRowList[i]=isCaretRow;
		//行単位初期化
		hilightData.dataConverted[i] = textConverted		//データとして変換済みをリストに登録
		sh.loadPreDataByObj(sh,hilightData.shDataList[i]);	
		hilightData.elList[i] = sh.execute(sh)	//データとして変換済みをリストに登録
		lensum+=hilightData.elList[i].text.length;
	}
	ErrorMsg+='/'+hilightData.elList.length+'_'+lensum;
	hilightData.ErrorMsg = ErrorMsg;
	return hilightData;
}
