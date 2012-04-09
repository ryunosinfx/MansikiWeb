var mansikiUIQueueForWorkerObject ={};
var mansikiWorkerHandler = function(){
	this.workers=[];
	this.workerCount=1;
	this.workerIndex=1;
	this.testRecord=123;
	this.initWorker();
}
mansikiWorkerHandler.prototype={
	initWorker: function() {
		this.workers=[];
		for(var i =0;i<this.workerCount;i++){
			//alert("イベント発生元のオブジェクト：y:"+i);
			var worker = new Worker('mansikiEditWorker.js');
			//alert("イベント発生元のオブジェクト：2");
			this.workers.push(worker);
			worker["self"] = this ;//functionの定義は無視される
			worker["self"]["test"] = this.test ;// function以外はOK
			worker.addEventListener('message', this.messageHandler, true);
			worker.addEventListener('error', this.errorHandler, true);
		}
	},
	
	execute:function(me,jobObj,callback,selfObject){
		var callbackKey = new Date().getTime();
		while(mansikiUIQueueForWorkerObject[callbackKey]!==undefined){
			callbackKey+=1;
		}
		mansikiUIQueueForWorkerObject[callbackKey]=callback;
		mansikiUIQueueForWorkerObject[callbackKey+"OBJ"]=selfObject;
		jobObj["callbackKey"] = callbackKey;
		me.workers[0].postMessage(jobObj);//function抜きのオブジェクトは渡せる
	},
  
	messageHandler: function(event) {
		var retObj = event.data;
		//console.log('Worker setp 5');
		//me.callBack ();
		var me = event.target.self;
		var callbackKey = retObj.callbackKey;
		var callback = mansikiUIQueueForWorkerObject[callbackKey]
		var selfObject = mansikiUIQueueForWorkerObject[callbackKey+"OBJ"];
		if(callback !==undefined){
			callback(selfObject,retObj);
			//alert("イベント発生元のオブジェクト："+me.testRecord);
			mansikiUIQueueForWorkerObject[callbackKey]=undefined;
			mansikiUIQueueForWorkerObject[callbackKey+"OBJ"]=undefined;
		}
		//console.log('Worker End!:', event.data);
	},
	//エラーの場合はここに来る。
	errorHandler: function(event) {
		//var me = event.data.self;
		console.log(event.message, event);
	},
	text:function(){
		alert("here we are!");
	}
}
