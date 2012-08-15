importScripts('mansikiEditObjects.js','mansikiManage.js');
function executeJob(event) {
	var start = new Date().getTime();
	
	var obj= eval("("+event.data+")");
	var jobObj = obj.jobObj;
	postMessage('i am self.close(): '+jobObj.toSource() );
}
//自分自身にイベントをはっつける。
addEventListener('message', executeJob, true);
