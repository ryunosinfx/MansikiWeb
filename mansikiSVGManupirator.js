function MansikiSVGManipurator(prefix,HilightingEditor){
	this.prefix = prefix;
	this.he=HilightingEditor;
	this.nameSpace="http://www.w3.org/2000/svg";
	this.leftPageClass="mansikiPageBackA";
	this.leftPageTitleClass="mansikiPageBackTitleA";
	this.rightPageClass="mansikiPageBackB";
	this.rightPageTitleClass="mansikiPageBackTitleB";
	this.leftKomaClass="mansikiKomaBackA";
	this.leftKomaTitleClass="mansikiKomaBackTitleA";
	this.rightKomaClass="mansikiKomaBackB";
	this.rightKomaTitleClass="mansikiKomaBackTitleB";
	this.id = "";
	this.pageRect=[];
	this.pageTitleRect=[];
	this.komaOffset=20;
	this.hukidashiOffset=40;
	this.buildCmdsQueue={};
	this.buildCmdFuncsIndexs=[];
	this.buildCmdFuncs={};
	this.init();
	
}
MansikiSVGManipurator.prototype={
	init:function(){
		this.buildCmdFuncs[PAGE]=this.buildPageRect;
		this.buildCmdFuncsIndexs.push(PAGE);
		this.buildCmdFuncs[KOMA]=this.buildKomaRect;
		this.buildCmdFuncsIndexs.push(KOMA);
		this.buildCmdFuncs[FUKIDASHI]=this.buildFukidashiRect;
		this.buildCmdFuncsIndexs.push(FUKIDASHI);
	},
	buildBaseField:function(width,height){
		var fieldDomObj=document.createElementNS(this.nameSpace, "svg");
		this.fieldDomObj=fieldDomObj;
		this.id =this.prefix+"SVGFiled";
		this.fieldDomObj.setAttribute("id",this.id);
		var defs = document.createElementNS(this.nameSpace, "defs");
		this.adujstSVGField(width,height);
		//this.fieldDomObj.setAttribute("viewBox", "0 0 100 30");
		return fieldDomObj;
	},
	adujstSVGField:function(width,height,top,left){
		var widthOld = this.fieldDomObj.getAttribute("width")===null ? 0 :this.fieldDomObj.getAttribute("width");
		var heightOld = this.fieldDomObj.getAttribute("height")===null ? 0 :this.fieldDomObj.getAttribute("height");
		var leftOld = this.fieldDomObj.getAttribute("x")===null ? 0 :this.fieldDomObj.getAttribute("x");
		var topOld = this.fieldDomObj.getAttribute("y")===null ? 0 :this.fieldDomObj.getAttribute("y");
		//alert(widthOld+"/"+heightOld+"/"+leftOld+"/"+topOld);
		this.fieldDomObj.setAttribute("width", width===undefined?widthOld:width);
		this.fieldDomObj.setAttribute("height", height===undefined?heightOld:height);
		this.fieldDomObj.setAttribute("y", top===undefined?topOld:top);
		this.fieldDomObj.setAttribute("x", left===undefined?leftOld:left);
	}
	,buildView:function(rowStates,lineHeight,width,offsetX,offsetY,titleInfo){
		offsetX= isNaN(offsetX)?0:offsetX;
		offsetY= isNaN(offsetY)?0:offsetY;
		this.buildCmdsQueue={};//init
		var height =0;
		var lineCount =0;
		var lineCountKoma =0;
		var switchCounter = 0;
		var switchCounterKoma = 0;
		var topOffset = offsetY;
		var topOffsetCurrent = offsetY;
		var topOffsetCurrentKoma = offsetY;
		var height = 0;
		var komaHeight = 0;
		var isRectExist=false;
		var isKomaRectExist=false;
		this.removeAll(this);
		var statePageTopRow ;
		var stateKomaTopRow ;
		var offsetXKoma = offsetX + this.komaOffset*1;
		var widthKoma = width-this.komaOffset*1;
		var lastState;
		var lastStateKoma;
		for(var index in rowStates){
			var state = rowStates[index];
			//console.log("state:"+state.toSource());
			var pageInfoMap = state.getStateMapByKey(PAGE);//-----------------------------
			if(pageInfoMap[PRIMARY+ADD]!==undefined && pageInfoMap[PRIMARY]!==0){
				statePageTopRow = state;
				height = lineCount*lineHeight;
				if(isRectExist===true){
					this.queueBuildCmds(PAGE,lastState,topOffsetCurrent,offsetX,width,height,lineHeight,state.rowText);
					
					if(isKomaRectExist){
						//console.log("SVGKKK test lineCount"+lineCount+"/height:"+height+"/topOffset:"+topOffsetCurrent);
						var komaHeight = lineCountKoma*lineHeight;
						this.queueBuildCmds(KOMA,lastStateKoma,topOffsetCurrentKoma,offsetXKoma,widthKoma,komaHeight,lineHeight,stateKomaTopRow.rowText);
					}
					switchCounterKoma = 0;
					isKomaRectExist=false;
				}
				topOffsetCurrent+=height;
				lineCount=1;
				isRectExist = true;
				lastState = state;
			}else{
				lineCount++;
			}
			var komaInfoMap = state.getStateMapByKey(KOMA);
			//console.log("isKomaRectExist:"+isKomaRectExist);
			if(komaInfoMap[PRIMARY+ADD]!==undefined && komaInfoMap[PRIMARY]!==0){;
				stateKomaTopRow = state;
				komaHeight = lineCountKoma*lineHeight;
				if(isKomaRectExist===true){
					this.queueBuildCmds(KOMA,lastStateKoma,topOffsetCurrentKoma,offsetXKoma,widthKoma,komaHeight,lineHeight,state.rowText);
				}
				topOffsetCurrentKoma+=komaHeight;
				lineCountKoma=1;
				isKomaRectExist = true;
				lastStateKoma = state;
			}else{
				lineCountKoma++;
			}
		}
		if(isKomaRectExist){
			//console.log("SVGKK test lineCount"+lineCount+"/height:"+height+"/topOffset:"+topOffsetCurrent);
			var komaHeight = lineCountKoma*lineHeight;
			this.queueBuildCmds(KOMA,lastStateKoma,topOffsetCurrentKoma,offsetXKoma,widthKoma,komaHeight,lineHeight,stateKomaTopRow.rowText);
		}
		if(isRectExist){
			//console.log("SVG test lineCount"+lineCount+"/height:"+height+"/topOffset:"+topOffsetCurrent);
			var height = lineCount*lineHeight;
			this.queueBuildCmds(PAGE,lastState,topOffsetCurrent,offsetX,width,height,lineHeight,statePageTopRow.rowText);
		}
		this.buildViewByQueue();//Last
	},
	queueBuildCmds:function(key,state,topOffset,offsetX,width,height,lineHeight,line){
		//console.log("queueBuildCmds SVG switchCounter:"+state.toSource()+" /key:"+key);
		this.buildCmdsQueue[key]=this.buildCmdsQueue[key]===undefined?[]:this.buildCmdsQueue[key];
		this.buildCmdsQueue[key].push({key:key,state:state,topOffset:topOffset,offsetX:offsetX,width:width,height:height,lineHeight:lineHeight,line:line});
	},
	buildViewByQueue:function(){
		for(var cmdIndex in this.buildCmdFuncsIndexs){
			var cmdKey = this.buildCmdFuncsIndexs[cmdIndex];
		//console.log("buildViewByQueue SVG cmdKey:"+cmdKey+" /buildCmdsQueue:"+this.buildCmdsQueue.toSource());
			var cmdQueue = this.buildCmdsQueue[cmdKey];
			for(var index = 0 ;cmdQueue!==undefined && index < cmdQueue.length;index++){
				var m = cmdQueue[index];
				//console.log("buildViewByQueue SVG cmdKey:"+cmdKey+"/m:"+m.toSource()+"/cmdQueue:"+cmdQueue.toSource());
				this.buildCmdFuncs[cmdKey](this,m.key,m.state,m.topOffset,m.offsetX,m.width,m.height,m.lineHeight,m.line);
			}
		}
	},
	buildKomaRect:function(me,key,state,topOffsetCurrent,offsetX,width,height,lineHeight,line){
		//console.log("★★★★line:"+line);
		me.buildRect(me,"Koma","コマ目"
			,state.stateMap[KOMA],state.stateMap[PAGE]*100,state.stateMapAdd[SUPERCOUNT]
			,topOffsetCurrent,offsetX,width,height,lineHeight,line
			,me.leftKomaClass,me.rightKomaClass,me.leftKomaTitleClass,me.rightKomaTitleClass);
	},
	buildFukidashiRect:function(me,key,state,topOffsetCurrent,offsetX,width,height,lineHeight,line){
	
	},
	buildPageRect:function(me,key,state,topOffsetCurrent,offsetX,width,height,lineHeight,line){
		//console.log("★★★state:"+state.stateMapAdd.toSource());
		me.buildRect(me,"Page","ページ"
			,state.stateMap[PAGE],0,state.stateMapAdd[SUPERCOUNT]
			,topOffsetCurrent,offsetX,width,height,lineHeight,line
			,me.leftPageClass,me.rightPageClass,me.leftPageTitleClass,me.rightPageTitleClass);
	},
	buildRect:function(me,prefix,unit,switchCounter,idPrefixNo,summaryCounter,topOffsetCurrent,offsetX,width,height,lineHeight,line,classFill1,classFill2,classTitle1,classTitle2){
		var id = me.prefix+"rect"+prefix+(idPrefixNo+switchCounter);
		//console.log(prefix+" SVG id:"+id+"/width:"+width+"/height:"+height+"/topOffset:"+topOffsetCurrent+"/document.getElementById(id):"+document.getElementById(id));
		if(switchCounter%2 === 1){
			me.overrideRect(me,id,topOffsetCurrent,offsetX,width,height,classFill1);
			me.overrideRect(me,id+"title",topOffsetCurrent,offsetX,width,lineHeight,classTitle1);
		}else{
			me.overrideRect(me,id,topOffsetCurrent,offsetX,width,height,classFill2);
			me.overrideRect(me,id+"title",topOffsetCurrent,offsetX,width,lineHeight,classTitle2);
		}
		var targetText = switchCounter +"/"+summaryCounter+unit;
		me.setTextToObj(me,id,targetText,me.he.culcTextWidth(me.he,line),topOffsetCurrent+lineHeight-2,lineHeight);
		//console.log(prefix+" SVG2 id:"+id+"/width:"+width+"/height:"+height+"/topOffset:"+topOffsetCurrent+"/document.getElementById(id):"+document.getElementById(id));
	},
	overrideRect:function(me,id,top,left,width,height,cssClass){
		me.remove(id);
		return me.addRect(me,id,top,left,width,height,cssClass);
	},
	addRect:function(me,id,top,left,width,height,cssClass){
		if(document.getElementById(id)===null){
			var rect = me.createRect(me,id,top,left,width,height,cssClass);
			//console.log("SVG id:"+id+"/width:"+width+"/height:"+height+"/rect:"+rect);
			me.fieldDomObj.appendChild(rect);
			return rect;
		}
	},
	createRect:function(me,id,top,left,width,height,cssClass){
		var rect = document.createElementNS(me.nameSpace, "rect");
		rect.setAttribute('id',id);
		rect.setAttribute('class',cssClass);
		rect.setAttribute('x',isNaN(left)?0:left);
		rect.setAttribute('y', isNaN(top)?0:top);
		rect.setAttribute('width',isNaN(width)?0:width);
		rect.setAttribute('height',isNaN(height)?0:height);
		rect.setAttribute("fill", "green");
		rect.setAttribute("stroke", "blue");
		rect.setAttribute("ry", "5");
		rect.setAttribute("rx", "5");
		rect.setAttribute("stroke-width", 0.2);
		return rect;
	},
	createTextObj:function(me,id,text){
		var textObj = document.createElementNS(me.nameSpace, "text");
		textObj.setAttribute('id',id+"text");
		textObj.appendChild(document.createTextNode(text));
		return textObj;
	},
	setTextToObj:function(me,id,text,offsetX,offsetY,fontSize){
		var textObj = me.createTextObj(me,id,text);
		textObj.setAttribute("x",offsetX);
		textObj.setAttribute("y",offsetY);
		textObj.setAttribute("fill", "green");
		textObj.setAttribute("stroke", "blue");
		textObj.setAttribute("font-size", fontSize);
		me.fieldDomObj.appendChild(textObj);
	},
	remove:function(me,id){
		if(document.getElementById(id)!==null){
			me.fieldDomObj.removeChild(document.getElementById(id));
		}
	},
	removeAll:function(me){
		//alert("count:"+$("#"+this.id).children().length);
		$("#"+me.id).children().map(function(){$(this).remove();});
	},
	refresh:function(){
		
	}
}
