

MansikiTweetStateAnaliser=function(editor){
	this.state ={};
	this.editor=editor;	
	this.pageSide ="pageSide";
	this.margeOnChangeFunc={};//PAGEなど
	this.margeOnChangeFunc[PAGE]=this.onPageChange;
	this.margeStateRule={};//DEL,UPD,INS
	this.margeStateRule[OBJECT]={};
	this.margeStateRule[FUKUSEN]={};
	this.margeStateRule[SETTING]={};
	this.margeStateRule[SUBTITEL]={};
	this.margeStateRule[SUBTITEL][DEL]=[KOMA,FUKIDASHI,NALATION,BACKGROUND,SOUND,EFFECT,QUOTE,SEAN];
	this.margeStateRule[SUBTITEL][UPD]=[NONBLE];
	this.margeStateRule[SUBTITEL][INS]=[SUBTITEL,PAGE];
	this.margeStateRule[NONBLE]={};
	this.margeStateRule[NONBLE][UPD]=[NONBLE,PAGE];
	this.margeStateRule[PAGE]={};
	this.margeStateRule[PAGE][DEL]=[KOMA,FUKIDASHI,NALATION,BACKGROUND,SOUND,EFFECT,QUOTE,SEAN];
	this.margeStateRule[PAGE][UPD]=[PAGE,NONBLE];
	this.margeStateRule[KOMA]={};
	this.margeStateRule[KOMA][DEL]=[FUKIDASHI,NALATION,BACKGROUND,SOUND,EFFECT,QUOTE,SEAN];
	this.margeStateRule[KOMA][UPD]=[KOMA];
	this.margeStateRule[FUKIDASHI]={};
	this.margeStateRule[FUKIDASHI][UPD]=[FUKIDASHI];
	this.margeStateRule[ACTOR]={};
	this.margeStateRule[ACTOR][UPD]=[ACTOR];
	this.margeStateRule[OBJECT]={};
	this.margeStateRule[OBJECT][UPD]=[OBJECT];
	this.margeStateRule[NALATION]={};
	this.margeStateRule[NALATION][UPD]=[NALATION];
	this.margeStateRule[BACKGROUND]={};
	this.margeStateRule[BACKGROUND][UPD]=[BACKGROUND];
	this.margeStateRule[SOUND]={};
	this.margeStateRule[SOUND][UPD]=[SOUND];
	this.margeStateRule[EFFECT]={};
	this.margeStateRule[EFFECT][UPD]=[EFFECT];
	this.margeStateRule[QUOTE]={};
	this.margeStateRule[QUOTE][UPD]=[QUOTE];
	this.margeStateRule[SEAN]={};
	this.margeStateRule[SEAN][UPD]=[SEAN];
	this.pageDiarect="L";
	this.pageStartSide="L";
	this.rowDiarect="L";
	this.letterDiarect="V";
	this.init();
	this.titleStates={};
}
MansikiTweetStateAnaliser.prototype ={
	init:function(){
	    $("#TWPageDiarectR").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWPageDiarectL").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWPageStartR").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWPageStartL").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWRowDiarectR").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWRowDiarectL").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWLetterDiarectV").bind("change",{self:this},this.getTitleInitSetting);
	    $("#TWLetterDiarectH").bind("change",{self:this},this.getTitleInitSetting);
	},
	loadTitleStates:function(titleStates){
	    this.titleStates = titleStates===undefined ?{}:titleStates;
	    if(this.titleStates["pageDiarect"]!==undefined){
		if(this.titleStates["pageDiarect"]==="R"){
		    $("#TWPageDiarectR").attr("checked","checked");
		}else{
		    $("#TWPageDiarectL").attr("checked","checked");
		}
		this.pageDiarect=this.titleStates["PageDiarect"];
	    }
	    if(this.titleStates["pageStartSide"]!==undefined){
		if(this.titleStates["pageStartSide"]==="R"){
		    $("#TWPageStartR").attr("checked","checked");
		}else{
		    $("#TWPageStartL").attr("checked","checked");
		}
		this.pageStartSide=this.titleStates["pageStartSide"];
	    }
	    if(this.titleStates["rowDiarect"]!==undefined){
		if(this.titleStates["rowDiarect"]==="R"){
		    $("#TWRowDiarectR").attr("checked","checked");
		}else{
		    $("#TWRowDiarectL").attr("checked","checked");
		}
		this.rowDiarect=this.titleStates["rowDiarect"];
	    }
	    if(this.titleStates["letterDiarect"]!==undefined){
		if(this.titleStates["letterDiarect"]==="V"){
		    $("#TWLetterDiarectV").attr("checked","checked");
		}else{
		    $("#TWLetterDiarectH").attr("checked","checked");
		}
		this.letterDiarect=this.titleStates["letterDiarect"];
	    }
	},
	getTitleInitSetting:function(event){
	    var me  = event.data.self;
	    if($("#TWPageDiarectR").attr("checked")==="checked"){
		me.pageDiarect="R";
	    }else{
		me.pageDiarect="L";
	    }
	    if($("#TWPageStartR").attr("checked")==="checked"){
		me.pageStartSide="R";
	    }else{
		me.pageStartSide="L";
	    }
	    if($("#TWRowDiarectR").attr("checked")==="checked"){
		me.rowDiarect="R";
	    }else{
		me.rowDiarect="L";
	    }
	    if($("#TWLetterDiarectV").attr("checked")==="checked"){
		me.letterDiarect="V";
	    }else{
		me.letterDiarect="H";
	    }
	    me.titleStates["pageDiarect"] = me.pageDiarect;
	    me.titleStates["pageStartSide"] = me.pageStartSide;
	    me.titleStates["rowDiarect"] = me.rowDiarect;
	    me.titleStates["letterDiarect"] = me.letterDiarect;
	    me.fullAnalize();

	    me.editor.reloadAllTweets();
	    me.editor.rebuildAll(me.editor);
	},
	fullAnalize:function(){
		this.state = {};
		this.stateMap={};
		var tweets = this.editor.tweets;
		var tweetsFuncs = this.editor.tweetsFuncs;
		var tweetIdMap = this.editor.tweetIdMap;
		var maxCursor = MansikiMapUtil.getMaxIndex(tweetIdMap);
		var preRowStat = {};
		var parent="title";
		for(var i=0;i<=maxCursor;i++){
			var idIndex = tweetIdMap[i];
			if(idIndex===undefined){
				continue;
			}
console.log("i:"+i+"idIndex:"+idIndex);
			var rowStat = {};
			var func = tweetsFuncs[idIndex];
			var id = func.Id;
			if(this.stateMap[id]===undefined){
			    this.stateMap[id]=0;
			}else{
			    this.stateMap[id]++;
			}
			var addMap ={id:id,parent:func.parentId};
			rowStat = this.margeMap(addMap,preRowStat);
//console.log("fullAnalize:"+rowStat.toSource()+" / "+preRowStat.toSource());
			this.state[idIndex]={addMap:addMap,rowStat:rowStat};
			preRowStat = MansikiMapUtil.deepCopyMap(rowStat);
		}
		MansikiMapUtil.overrideLS(this.editor.keyMain,"titleStates",this.titleStates);
		preRowStat["isLastMap"]={last:true};
		var ret ="";
		for(var key in this.stateMap){
		    if(key===PAGE){
			ret+=this.stateMap[key]+"頁\n";
		    }
		    if(key===KOMA){
			ret+=this.stateMap[key]+"コマ\n";
		    }
		    if(key===FUKIDASHI){
			ret+=this.stateMap[key]+"台詞\n";
		    }
		    //ret+=key+"/";
		}
		$("#TWTitleStateTotal").text(ret);
	},
	margeMap:function(addMap,preRowStat){
//console.log("margeMap:"+addMap.toSource()+"/"+preRowStat.toSource());
		var rowState = MansikiMapUtil.deepCopyMap(preRowStat);
		var isLastMap = {};
		preRowStat["isLastMap"] = isLastMap;
		for(var key in addMap){
			var Id= addMap[key];
//console.log("margeMap key:"+key+"/"+this.margeStateRule[Id]+"/Id:"+Id);
			if(this.margeStateRule[Id]===undefined || key==="parent"){
				continue;
			}
			var rule = this.margeStateRule[Id];
//console.log("margeMap rule:"+rule.toSource());
			for(var index in rule[DEL]){
				isLastMap[rule[DEL][index]]=true;
				rowState[rule[DEL][index]] = FLAG_OFF;
			}
			for(var index in rule[UPD]){
				if(rowState[rule[UPD][index]]===undefined){
					rowState[rule[UPD][index]]=FLAG_OFF;
				}
				rowState[rule[UPD][index]]++;
			}
			for(var index in rule[INS]){
				rowState[rule[INS][index]] = FLAG_ON;
			}
			var func = this.margeOnChangeFunc[Id];
			if(func!==undefined){
			    func(this,rowState);
			}
		}
		return rowState;
	},
	onPageChange:function(self,rowState){
	    var index = rowState[PAGE];
	    var side = index%2;//奇数偶数頁
	    if(self.pageStartSide==="L"){//左始まり、左右送り＝奇数：右・偶数:左
		rowState[self.pageSide]=side===1?"R":"L";
	    }else {//左始まり、右左送り＝奇数：左・偶数:右
		rowState[self.pageSide]=side===1?"L":"R";
	    }
	}
}
