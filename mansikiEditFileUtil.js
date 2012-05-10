

var MansikiFileUtil = function(){
	if (window.File===undefined) {
		window.alert("本ブラウザではFile APIが使えません");
	}
}

MansikiFileUtil.prototype={
	bindSave:function(me,obj,action,dataPoolObj ){
		obj.bind(action,{self:me,dataPool:dataPoolObj},me.save);
	},
	save:function(event){
		var me = event.data.self;
		var dataPoolObj = event.data.dataPool;
		var text = dataPoolObj.val();
		//document.location.href='data:application/octet-stream,'+encodeURIComponent(text);
		document.location.href='data:text/plane,'+encodeURIComponent(text);
	},
	bindLoad:function(me,obj,action,inputFileDomObj,dataPoolObj,callbackFunc,cmdObj){
		obj.bind(action,{self:me,inputFile:inputFileDomObj,dataPool:dataPoolObj,callback:callbackFunc,cmd:cmdObj},me.load);
	},
	load:function(event){
		var me = event.data.self;
		var inputFileDomObj = event.data.inputFile;
		var reader = new FileReader();
		var fs = inputFileDomObj.files;
		var f = fs[0];
		var dataPoolObj = event.data.dataPool;
		var callbackFunc = event.data.callback;
		var cmdObj = event.data.cmd;
		if (f===undefined || f.type===undefined) {
        	alert("指定がないので表示できません。");
        	return ;
        }
		
		if (!f.type.match('text.*') && !f.type.match('.*javascript')) {
        	alert("テキスト以外は表示できません。mimeType ="+f.type);
        	return ;
        }
        
        // ファイル読取が完了した際に呼ばれる処理
        reader.onload = function (evt) {
			var text= reader.result;
			alert(text);
			dataPoolObj.val(text);
			if(callbackFunc!==undefined && cmdObj!==undefined){
				callbackFunc(cmdObj);
			}
        }
		// エラー発生時の処理
		reader.onerror = function (evt) {
			alert("読み取り時にエラーが発生しました。");
		}
        reader.readAsText(f, 'utf-8');
	},
	createBlob:function(me){
		return ;
	}
}

