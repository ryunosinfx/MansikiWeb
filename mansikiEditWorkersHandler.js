var mansikiUIQueueForWorkerObject ={};
var mansikiWorkerHandler = function(){
	this.workers={};
	this.callbackKeys={};
	this.workerCount=1;
	this.workerIndex=1;
	this.testRecord=123;
	this.initWorker(this);
	this.callCount = 0;
	this.currentWorker ;
}
mansikiWorkerHandler.prototype={
	initWorker: function(me) {
		me.workers=[];
		for(var i =0;i<me.workerCount;i++){
			//alert("イベント発生元のオブジェクト：y:"+i);
			me.currentWorker = new Worker('mansikiEditWorker.js');
			//alert("イベント発生元のオブジェクト：2");
			
			console.log('kill worker!13:');
			me.currentWorker.addEventListener('message', me.messageHandler, true);
			me.currentWorker.addEventListener('error', me.errorHandler, true);
			console.log('kill worker14:');
		}
	},
	execute:function(me,jobObj,callback,selfObject){
		me.initWorker(me);
		var callbackKey = new Date().getTime();
		while(mansikiUIQueueForWorkerObject[callbackKey]!==undefined){
			callbackKey+=1;
		}
		me.clearWorkerInfo(me,me.callCount); // 実行中はぬっころす;
		mansikiUIQueueForWorkerObject[callbackKey]=callback;
		mansikiUIQueueForWorkerObject[callbackKey+"OBJ"]=selfObject;
		mansikiUIQueueForWorkerObject[callbackKey+"ME"]=me;
		jobObj["callbackKey"] = callbackKey;
		jobObj["mansikiWorkMngData"] = mansikiWorkMng.getData(mansikiWorkMng);
		me.callCount++;
		jobObj["callCount"] = me.callCount;
		me.workers[me.callCount] = me.currentWorker;
		me.callbackKeys[me.callCount] = callbackKey;
		me.workers[me.callCount].postMessage(jobObj);//function抜きのオブジェクトは渡せる
	},
	clearWorkerInfo: function(me,callCount){
			console.log('kill worker!11:');
		if(me.workers[me.callCount] !== undefined){
			var callbackKey = me.callbackKeys[callCount];
			var callback = mansikiUIQueueForWorkerObject[callbackKey];
			if(callback !==undefined){
				mansikiUIQueueForWorkerObject[callbackKey]=undefined;
				mansikiUIQueueForWorkerObject[callbackKey+"OBJ"]=undefined;
				mansikiUIQueueForWorkerObject[callbackKey+"ME"]=undefined;
			}
			me.workers[callCount].terminate(); // ぬっころす;
			me.workers[callCount]=undefined;//メモリから排除
			console.log('kill worker!12:');
		}
	},
	messageHandler: function(event) {
		console.log('kill worker!20:');
		var retObj = event.data;
		var me = event.target.self;
		var callbackKey = retObj.callbackKey;
		var callback = mansikiUIQueueForWorkerObject[callbackKey];
		var selfObject = mansikiUIQueueForWorkerObject[callbackKey+"OBJ"];
		var me = mansikiUIQueueForWorkerObject[callbackKey+"ME"];
		mansikiWorkMng.setData(mansikiWorkMng,retObj.mansikiWorkMngData);
		if(callback !==undefined){
			if(retObj.callCount !== me.callCount){
				me.clearWorkerInfo(me,me.callCount);
			}
			//console.log('retObj.result:', retObj.result.ErrorMsg);
			callback(selfObject,retObj.result);
		}
		me.clearWorkerInfo(me,me.callCount);
		//console.log('Worker End!:', event.data);
	},
	//エラーの場合はここに来る。
	errorHandler: function(event) {
		console.log(event.message, event);
	},
	text:function(){
		alert("here we are!");
	}
}
