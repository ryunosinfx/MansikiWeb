importScripts('mansikiEditObjects.js','mansikiManage.js');

var mansikiWorkMng = new MansikiWorkManager();
var sh =new SyntaxHilighter();
function executeJob(event) {
	var start = new Date().getTime();
	
	var jobObj= event.data;
	
	var sh =new SyntaxHilighter();
	//sh.loadPreDataByObj(sh,jobObj);
	mansikiWorkMng.setData(mansikiWorkMng,jobObj.mansikiWorkMngData);
	//postMessage({callbackKey:jobObj.callbackKey,result:sh.execute(sh),mansikiWorkMngData:mansikiWorkMng.getData(mansikiWorkMng)});
	postMessage({
		callbackKey:jobObj.callbackKey,callCount:jobObj.callCount,result:executeTheJob(sh,jobObj),mansikiWorkMngData:mansikiWorkMng.getData(mansikiWorkMng)});
}
//自分自身にイベントをはっつける。
addEventListener('message', executeJob, true);
