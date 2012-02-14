

function MansikiInit(){
	var text ;
}
function buildMansikiHilight(){
	//ページ単位
	//ページ区切り
	//見開き
}
//固定打ち
var MansikiWorkManager = function(title,pageDiarect,pageStartSide){
	this.title=title;
	this.pageDiarect=pageDiarect;
	this.pageStartSide=pageStartSide;
	this.title=title;
	this.title=title;
	this.pagNum;
	this.komaIndex;
	this.komaNum;
	this.currentPage;
}
MansikiWorkManager.prototype={
	isChange=false;
	addPage:function(page){
	},
	delPage:function(index){
	},
	mvPage:function(index){
	},
	getNonble:function(){
	},
	getSide:function(){
	
	}
}

var MansikiPageManager =function(){
	this.komaList=[];
	this.fukidashiList=[];
	this.narationList=[];
}
MansikiPageManager.prototype={
	change:function(){
	}
}

var MansikiKomaManager =function(index,border,style){
	//location
	//
	this.index=index;
	this.border=border;
	this.style= style;
	this.top=top;
	this.left=left;
	this.FrameZIndex;
	this.picZIndex;
	this.canvas;
	this.id=
}
MansikiKomaManager.prototype={
	update;function(){
	
	}
}
//
var MansikiFukidashiManager =function(serifu,sender,target){
	this.sender=sender;
	this.serifu=serifu;
}
MansikiFukidashiManager.prototype={
	
}
//
var MansikiNalationManagr=function(text){
	this.text=text;
	this.top=top;
	this.left=left;
	this.fontsize=fontsize;
	this.align="center";
	this.zindex=index;
	this.parent=koma;
}
MansikiNalationManagr.prototype={
	move:function(top,left){
		this.top=top;
		this.left=left;
	},
	updateText:function(text){
	
	},
	setFontSize:function(px){
	
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



