//ここをWorkerに投げる。
var SyntaxHilighter = function(){
	this.maskStringA1="000"+new Date().getTime()+"888";
	this.maskStringA2="000"+new Date().getTime()+"999";
	this.maskStringB1="111"+new Date().getTime()+"888";
	this.maskReA1 = new RegExp(this.maskStringA1, "g");
	this.maskReA2 = new RegExp(this.maskStringA2, "g");
	this.maskReB1 = new RegExp(this.maskStringB1, "g");
}
SyntaxHilighter.prototype={
	comvertStringToHTML:function(str){//ここの処理はWorkerに投げたい。
		str = str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/[　]{1}/g,"<span&nbsp;class='space2'>ぽ</span>")
		.replace(/\t/g,"<pre&nbsp;style='display:inline;border:0px;margin:0px;padding:0px;'>&_#_0_9_;</pre>")
		.replace(/\s/g,"&nbsp;").replace(/&_#_0_9_;/g,"&nbsp;&nbsp;&nbsp;&nbsp;")
		.replace(/pre&nbsp;style/g,"pre style").replace(/span&nbsp;class/g,"span class");
		return str.replace(/[　]{1}/g,"<span class='space2'>&emsp;</span>1");
	},
	comvertStringToHTMLHilight:function(str,hsRule,me,index){//ここの処理はWorkerに投げたい。
		var size = hsRule.getSize();
		var el = new ExecutedLine(str);
		var retText =str;
		for(var priority in hsRule.getRouleList()){
			var hilightRule = hsRule.getRouleList()[priority];
			var rexStr = hilightRule.getRegix();
			rexStr=rexStr.match(/\(/)?rexStr:"("+rexStr+")";
			var re = new RegExp(rexStr,"g");
			var className= hilightRule.getCssClassName();
			if(retText.match(re)){
				var prefix = me.maskStringA1+className+"_prefix"+me.maskStringA2+hilightRule.getPrefix()+me.maskStringB1;
				el = hilightRule.executeCallBack(retText,el,index);
				retText = el.getText().replace(re,function(preText, p1, offset, s){
					var viewText = p1;
					if(index!==undefined){
						viewText=me.convertClearString(viewText);
					}
					return me.maskStringA1+className+me.maskStringA2 + prefix+viewText + me.maskStringB1;
				});
			};//~s///g
		}//戻す
		el.setHtml(me.comvertStringToHTML(retText).replace(me.maskReA1,"<span class='").replace(me.maskReA2,"'>").replace(me.maskReB1,"</span>"));

		return el;
	},
	convertClearString:function(text){
		text = text.replace(/[+\\\|\[\]\{\}\(\)\*\.\?&\$\"\'\!\~\^#,<>1-9a-zA-Y_]/g,"0")//\"
		.replace(/[^0]{1}/g,"　").replace(/0/g," ")
		return text;
		
	},
	comvertStringToHTMLHilightRow:function(str,hsRule,me){
		
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
	executeCallBack:function (text,el,index){
		if(this.callback!==undefined){
			el = this.callback(text,this.regix,this.type,el,index);
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
	this.bgColor;
	this.bgColorAdditionalRow;
}
ExecutedLine.prototype={
	setText:function(text){
		this.text=text;
	},
	getText:function(){
		return this.text;
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
	setBgColor:function(bgColor){
		this.bgColor = bgColor;
	},
	getBgColor:function(){
		return this.bgColor;
	}
}
