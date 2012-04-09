importScripts('mansikiEditObjects.js','mansikiManage.js');
var sh =new SyntaxHilighter();
function executeJob(event) {
	var start = new Date().getTime();
	
	var jobObj= event.data;
	
	sh.loadPreDataByObj(sh,jobObj);
	
	postMessage(sh.execute(sh));
}
//自分自身にイベントをはっつける。
addEventListener('message', executeJob, true);
