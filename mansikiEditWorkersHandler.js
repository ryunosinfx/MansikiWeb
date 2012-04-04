
var mansikiWorkerHandler = function(){
	this.workers=[];
	this.workerCount=1;
	this.workerIndex=1;
	this.initWorker();
}
mansikiWorkerHandler.prototype={
	initWorker: function() {
		this.workers=[];
		for(var i =0;i<this.workerCount;i++){
			var worker = new Worker('manikiEditWorker.js');
			this.workers.push(worker);
			console.log('Worker setp 1');
			worker.addEventListener('message', this.messageHandler, true);
			console.log('Worker setp 2');
			worker.addEventListener('error', this.errorHandler, true);
			console.log('Worker setp 3');
			//var jqWorkder = $(worker);
			//jqWorkder.bind('message', {"self":this},this.messageHandler);
			//jqWorkder.bind('error', {"self":this},this.messageHandler);
		}
	},
	
	execute:function(me,jobObj,collback){
		console.log('Worker setp 4');
		me.workers[0].postMessage({me:me,jobObj:jobObj,collback:collback}.toSource());
		console.log('Worker setp 8');
	},
  
	messageHandler: function(event) {
		console.log('Worker setp 6');
		var me = event.data;
		console.log('Worker setp 5');
		//me.callBack ();
		console.log('Worker End!:', event.data.toSource());
	},
	//エラーの場合はここに来る。
	errorHandler: function(event) {
		//var me = event.data.self;
		console.log(event.message, event.toSource());
	}
}
