
var MansikiEditInitData={
	ddls:[
	       {schema:"mansiki",tableName:"Mansiki-Tags",indexes:["tagId","user","targetType","targetId","type","name","updateUser","udateTime"],orverRide:false}
	      ,{schema:"mansiki",tableName:"Mansiki-works",indexes:["seriesId","workId","title"],orverRide:false}
	      ,{schema:"mansiki",tableName:"Mansiki-series",indexes:["seriesId","workId","title"],orverRide:false}
	      ,{schema:"mansiki",tableName:"Mansiki-works-koma",indexes:["seriesId","workId","id","","updateUser","udateTime"],orverRide:false}
	      ,{schema:"mansiki",tableName:"Mansiki-works-char",indexes:["seriesId","id","title","updateUser","udateTime"],orverRide:false}
	      ,{schema:"mansiki",tableName:"Mansiki-works-field",indexes:["seriesId","id","timeline","zip","timing","state","updateUser","udateTime"],orverRide:false}
	      ,{schema:"mansiki",tableName:"Mansiki-fravor",indexes:["seriesId","workId","title","updateUser","udateTime"],orverRide:false}
	      ,{schema:"mansiki",tableName:"Mansiki-data",indexes:["dataId"],orverRide:false}
	      ]
	,data:{
	    
	    
	    
	}
//話（現在管理中のデータ）、
//タグクラウド、タグは(タグID、ユーザID、ターゲットID、タグType、タグ名、タグ内容、更新ユーザID、更新時間
//シリーズデータ、
//システムフレーバーの４個？
//コマ：（作品ID、頁ID,コマID、データ本体、更新ユーザID、更新時間）、
//場所：（シリーズID、場所ID、時系列、住所、時間帯、気象or状態、データ本体、更新ユーザ、更新時間）
//キャラ：（シーリズID、キャラID、キャラ状態変数（時間軸、向き、表情、シーン、パーツ）、本体データ、更新ユーザ、更新時間）
};
