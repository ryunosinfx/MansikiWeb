//ここをWorkerに投げる。
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
	comvertStringToHTMLHilight:function(str,hsRule,me,index,isAddrow,isEditingRow){//ここの処理はWorkerに投げたい。
		var size = hsRule.getSize();
		var el = new ExecutedLine(str);
		var retText =str;
		for(var priority in hsRule.getRouleList()){
			var hilightRule = hsRule.getRouleList()[priority];
			var rexStr = hilightRule.getRegix();
			rexStr=rexStr.match(/\(/)?rexStr:"("+rexStr+")";
			var re = new RegExp(rexStr,"g");
			var className= hilightRule.getCssClassName();
			//console.log("className:"+className+"/retText:"+retText+"/rexStr:"+rexStr);
			if(retText.match(re)){
				//console.log("★★★★★★className:"+className+"/retText:"+retText+"/rexStr:"+rexStr);
				var prefix = hilightRule.getPrefix().length>0?me.maskStringA1+className+"_prefix"+me.maskStringA2+hilightRule.getPrefix()+me.maskStringB1:"";
				el = hilightRule.executeCallBack(retText,el,index,isEditingRow);
				retText = el.getText().replace(re,function(preText, p1, offset, s){
					var viewText = p1;
					if(index!==undefined && el.isOverride==true){
						viewText=me.convertClearString(viewText);
					}
					return me.maskStringA1 + className + me.maskStringA2 + prefix+viewText + me.maskStringB1;
				});
			};//~s///g
		}//戻す
		if(isAddrow===true && isEditingRow===true){
			el.setText(el.getIndent()+el.getText());
			retText=el.getIndent()+retText;
		}
		el.setText(el.getText().replace(me.maskReA12,"").replace(me.maskReB1,""));
		el.setOverrideOffset(el.getText().length-str.length);
		el.setHtml(me.comvertStringToHTML(retText).replace(me.maskReA1,"<span class='").replace(me.maskReA2,"'>").replace(me.maskReB1,"</span>"));
		//console.log(me.comvertStringToHTML(retText).replace(me.maskReA1,"<span class='").replace(me.maskReA2,"'>").replace(me.maskReB1,"</span>"));

		return el;
	},
	convertClearString:function(text){
		text = text.replace(/[+\\\|\[\]\{\}\(\)\*\.\?&\$\"\'\!\~\^#,<>1-9a-zA-Y_]/g,"0")//\"
		.replace(/[^0]{1}/g,"　").replace(/0/g," ")
		return text;
		
	},
	comvertStringToHTMLHilightRow:function(str,hsRule,me){
		
	},
	comvertStringToHTMLHilightNew:function(str,hsRule,me,index){///重すぎて動かなくなってしまった。
		var size = hsRule.getSize();
		var el = new ExecutedLine(str);
		var retText =str;
		var classList={};
		var prefixList={};
		var typePiroity=[];
		var markingOnString ={};
		
		console.log("ccccc");
		for(var priority in hsRule.getRouleList()){
			var hilightRule = hsRule.getRouleList()[priority];
			var type= hilightRule.getType();
			var asStart={"type":type,"mode":"start"};
			var asEnd={"type":type,"mode":"end"};
			var rexStr = hilightRule.getRegix();
			rexStr=rexStr.match(/\(/)?rexStr:"("+rexStr+")";
			var re = new RegExp(rexStr,"g");
			classList[type]=hilightRule.getCssClassName();
			typePiroity.push(type);
		console.log("ddd");
			if(retText.match(re)){//ここのロジックを大幅に変える。
				console.log("ccccc");
				el = hilightRule.executeCallBack(retText,el,index);
				prefixList[type]=hilightRule.getPrefix().length>0?me.maskStringA1+className+"_prefix"+me.maskStringA2+hilightRule.getPrefix()+me.maskStringB1:"";
				retText = el.getText().replace(re,function(preText, p1, offset, s){
					var viewText = p1;
					if(index!==undefined && el.isOverride==true){
						viewText=me.convertClearString(viewText);
					}
					return me.maskStringA1 +viewText + me.maskStringB1;
				});
				var retTextStart=retText.replace(me.maskReA1,"");
				var retTextend=retText.replace(me.maskReB1,"");
				var splitedTextStart = retTextend.split(me.maskStringA1);//う？ここで分割すると誰がだれだか・・・
				var splitedTextEnd = retTextStart.split(me.maskStringB1);//う？ここで分割すると誰がだれだか・・・
				var planeText = splitedTextEnd.join("");
				var cursor=0;
				for(var j=0;j<splitedTextStart.length;j++){
					cursor=splitedTextStart[j].length;
					if(markingOnString[cursor]===undefined){
						markingOnString[cursor]={};
					}
					markingOnString[cursor][type]=asStart;
					cursor=splitedTextEnd[j].length;
					if(markingOnString[cursor]===undefined){
						markingOnString[cursor]={};
					}
					markingOnString[cursor][type]=asEnd;
				}
				retText=planeText;
			};//~s///g
		}//戻す
		console.log("aaaa");
		var addTokens=[];
		for(var i =0;i<=retText.length;i++){//フォースはどうするのか？位置文字ずつ
		console.log("zzzz i:"+i);
			if(markingOnString[i]!==undefined){//まあ取り合えずあるのだけやる
				var addToken="";
				for(var n=0;n=typePiroity.length;n++){
					var typeA=typePiroity[n];
					var token= markingOnString[i][typeA];
					if(token!==undefined){
						if(token.mode=="start"){
							//addToken+=me.maskStringA1 + classList[typeA] + me.maskStringA2 + prefixList[typeA];
						}else{
							//addToken = me.maskStringB1+addToken;
						}
					}
				}
				//addTokens.push(addToken);
			}else{
				//addTokens.push("");
			}
			
		console.log("zzzz");
			if(i<retText.length){
				//addTokens.push(retText.substring(i,i+1));
			}
		}
		console.log("bbb");
		el.setText(retText);
		el.setOverrideOffset(retText.length-str.length);
		el.setHtml(me.comvertStringToHTML(addTokens.join("")).replace(me.maskReA1,"<span class='").replace(me.maskReA2,"'>").replace(me.maskReB1,"</span>"));
		//console.log(me.comvertStringToHTML(retText).replace(me.maskReA1,"<span class='").replace(me.maskReA2,"'>").replace(me.maskReB1,"</span>"));

		return el;
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
	getName:function(){
		return this.name;
	},
	getCssClassName:function(){
		return this.cssClassName;
	},
	getRegix:function(){
		return this.regix;
	},
	getPreRoule:function(){
		return this.preRoule;
	},
	getType:function(){
		return this.type;
	},
	getScope:function(){
		return this.scope;
	},
	getPrefix:function(){
		return this.prefix;
	},
	getCallBack:function(){
		return this.callback;
	},
	executeCallBack:function (text,el,index,isEditingRow){
		if(this.callback!==undefined){
			el = this.callback(text,this.regix,this.type,el,index,isEditingRow);
		}
		return el;
	}
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
}
ExecutedLine.prototype={
	setText:function(text){
		this.text=text;
	},
	getText:function(){
		return this.text;
	},
	isOverride:function(){
		return this.isOverride;
	},
	setOverride:function(isOverride){
		return this.isOverride=isOverride;
	},
	setHtml:function(html){
		this.html = html;
	},
	getHtml:function(){
		return this.html;
	},
	setAddRowText:function(addRowText){
		this.addRowText = addRowText;
	},
	getAddRowText:function(){
		return this.addRowText;
	},
	setAddRowHtml:function(addRowHtml){
		this.addRowHtml = addRowHtml;
	},
	getAddRowHtml:function(){
		return this.addRowHtml;
	},
	setOverrideOffset:function(overrideOffset){
		this.overrideOffset = overrideOffset;
	},
	getOverrideOffset:function(){
		return this.overrideOffset;
	},
	setIndent:function(indent){
		this.indent = indent;
	},
	getIndent:function(){
		return this.indent;
	},
	setBgColor:function(bgColor){
		this.bgColor = bgColor;
	},
	getBgColor:function(){
		return this.bgColor;
	}
}
