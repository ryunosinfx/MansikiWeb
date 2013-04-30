

/**/
var MansikiIndexedDBUtil=function(lsKey){
    this.indexedDB=undefined;
    this.request=undefined;
    this.tran =undefined;
    this.version=1;
    this.testData ={};
    this.contractedTables={};
    this.isWebkit=window.webkitIndexedDB!==undefined;
    this.lsKey= lsKey;
    this.pkMap= MansikiMapUtil.loadFromLS(this.lsKey);
    if(this.pkMap===undefined || this.pkMap===null)this.pkMap={};
    if (window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB) {
	this.indexedDB 		= window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.moz_indexedDB;
	this.IDBTransaction	= window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction;
	this.IDBKeyRange	= window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange;
	this.IDBCursor		= window.IDBCursor || window.webkitIDBCursor; 
    } else {
	alert("Can't Use IndexedDB On Your Browser!");
    }
    this.defaultSchema = "Mansiki";
    this.currentSchema =undefined;
    this.isBeginTran=false;

    this.tableNamesForLock = [];
    
};
MansikiIndexedDBUtil.prototype={
	init:function(ddls,parentObj,callback){
	    var me = this;
	    var counter = 0;
	    var max = ddls.length;
	    var wrapper ={me:me,ddls:ddls,counter:counter,max:max};
	    //this.setBeginTran();
	    
	    //var promise =  me.openDBforUpdateDB.bind(me)(ddls[0].schema===undefined?this.defaultSchema:ddls[0].schema ,me.doCreateTables.bind(wrapper)).then(me.closeDB.bind(me));
	    var promise =  me.doCreateTables.bind(wrapper)();
	    console.log("[IDBUtil]promise:"+promise.toSource());
	    return promise;
	},
	doCreateTables:function(){
	    var d= new $.Deferred();
	    var me = this.me;
	    var wrapper = this;
	    var ddls = this.ddls;
	    console.log("[IDBUtil]max:"+this.max+"/counter:"+ this.counter);
	    if(wrapper.max - 1 > wrapper.counter){
		var schema =  ddls[wrapper.counter].schema===undefined?me.defaultSchema:ddls[0].schema ;
		wrapper.counter++;
		wrapper.target = ddls[wrapper.counter];
		console.log("[IDBUtil]0 this.counter:"+this.counter+"/"+this.max+"/"+this.ddls[(this.counter-1)]+"/x:"+this.ddls.length+"/ddls:"+this.ddls );

		var counter = wrapper.counter;
		var promise1 =me.openDBforUpdateDB.bind(wrapper)(schema ,me.createTable.bind(me)).then(
			function(){
			    console.log("[IDBUtil]A this.counter:"+wrapper.counter+"/"+wrapper.max+"/"+promise1 );
			    var promise2 = me.closeDB.bind(me)();
			    //console.log("[IDBUtil]A1 this.counter:"+wrapper.counter+"/"+wrapper.max+"/"+promise2 );
			    promise2.then(
        			 function(){
        			     console.log("[IDBUtil]B this.counter:"+wrapper.counter+"/"+wrapper.max);
        			     return me.doCreateTables.bind(wrapper)().then(
        				     function(){console.log("[IDBUtil]C this.counter:"+counter+"/"+wrapper.max);d.resolve();}
        			     	);
        			 }
        			,function(){me.rollback.bind(wrapper)();console.log("[IDBUtil]fail!");}
        			);
			});
		//alert("D this.counter:"+this.counter+"/"+this.max );
	    }else{
		setTimeout(function(){console.log("[IDBUtil]CreateTables last end!");d.resolve();},0);
	    }
	    return d.promise();
	},
	addData:function(tableName,dataRows){//
	    var d= new $.Deferred();
	    this.setBeginTran();
	    var me = this;
	    var rowIndex = 0;
	    var max = dataRows.length;
	    var wrapper ={me:me,dataRows:dataRows,rowIndex:rowIndex,max:max,tableName:tableName,d:d};
	    for(var i = 0,length = dataRows.length;i<length ;i++){
		dataRows[i].tableName=tableName;
	    }
	    me.openDBforUpdateData.bind(me)(this.currentSchema===undefined? this.defaultSchema:this.currentSchema ,me.doAddData.bind(wrapper));
	    return d.promise();
	},
	doAddData:function(){
	    console.log("[IDBUtil]doAddData START:"+this.rowIndex+"/"+this.max);
	    var me = this.me;
	    var d = this.d;
	    var dataRows = this.dataRows;
	    var rowIndex = this.rowIndex;
	    var wrapper = this;
	    if(wrapper.max-1 > wrapper.rowIndex){
		wrapper.rowIndex++;
		var data = dataRows[rowIndex];
		console.log("[IDBUtil]doAddData index:"+rowIndex+"/"+data.toSource());
		wrapper.data = JSON.parse(JSON.stringify(data));
    		var promise = me.deleteData.bind(me)(JSON.parse(JSON.stringify(data)));
		console.log("[IDBUtil]call promise:"+data+"/"+promise.toSource());
    		    promise.done((function(){
    			alert("test!");
    			console.log("[IDBUtil]call insertData:"+rowIndex+"/");
    			
    			me.insertData.bind(me)(data).done(me.doAddData.bind(wrapper));
    		    }) //.done(me.doAddData.bind(wrapper))
    			//  ,me.rollback.bind(wrapper)
    			  );
	    }else{
		setTimeout(function(){console.log("[IDBUtil]doAddData add data last end!");d.resolve();},0);
	    }
	    console.log("[IDBUtil]doAddData END");
	},
	updateData:function(tableName,dataRows){
	    var d= new $.Deferred();
	    this.setBeginTran();
	    var me = this;
	    var rowIndex = 0;
	    var max = ddls.length;
	    var wrapper ={me:me,dataRows:dataRows,rowIndex:rowIndex,max:max,tableName:tableName,d:d};
	    for(var i = 0,length = dataRows.length;i<length ;i++){
		dataRows[i].tableName=tableName;
	    }
	    me.openDBforUpdateData.bind(me)(this.currentSchema===undefined? this.defaultSchema:this.currentSchema,me.doUpdateData.bind(wrapper));
	    return d.promise();
	},
	doUpdateData:function(){
	    var me = this.me;
	    var d = this.d;
	    var dataRows = this.dataRows;
	    var rowIndex = this.rowIndex;
	    if(this.max >= rowIndex){
		this.rowIndex++;
    		me.updateData.bind(me)(dataRows[rowIndex])
    		    .then(me.doUpdateData.bind(this),me.rollback.bind(this));
	    }else{
            	d.resolve();
	    }
	},
	getData:function(tableName,retInst){
	    var d= new $.Deferred();
	    this.setBeginTran();
	    var me = this;
	    var wrapper ={me:me,tableName:tableName,result:retInst,d:d};
	    alert("getData!");
	    return me.openDBforUpdateData.bind(me)(this.currentSchema===undefined? this.defaultSchema:this.currentSchema,me.doGetData.bind(wrapper));
	    //return wrapper;
	},
	doGetData:function(){// this is wrapper
	    var me = this.me;
		alert("doGetData! this.tableName:"+this.tableName);
	    var promise = me.selectAll.bind(this)(this.tableName);
		alert("doGetData! promise:"+promise);
	    return promise;
	},
	delData:function(tableName,dataRows){
	    this.setBeginTran();
	    var me = this;
	    var rowIndex = 0;
	    var max = ddls.length;
	    var wrapper ={me:me,dataRows:dataRows,rowIndex:rowIndex,max:max,tableName:tableName};
	    return me.openDBforUpdateData.bind(me)(this.currentSchema===undefined? this.defaultSchema:this.currentSchema,me.doAddData.bind(wrapper));
	},
	doDelData:function(){
	    console.log("[IDBUtil]doDelData START:");
	    var me = this.me;
	    if(this.max >= this.rowIndex){
		this.rowIndex++;
    		me.deleteData.bind(me)(dataRows[rowIndex])
    			    .then(me.doDelData.bind(this),me.rollback.bind(me));
	    }
	    console.log("[IDBUtil]doDelData END:");
	},
	delDataAll:function(tableName){
	    console.log("[IDBUtil]delDataAll START tableName:"+tableName);
	    this.setBeginTran();
	    var me = this;
	    var rowIndex = 0;
	    var max = ddls.length;
	    var wrapper ={me:me,rowIndex:rowIndex,max:max,tableName:tableName};
	    return me.openDBforUpdateData.bind(me)(this.currentSchema===undefined? this.defaultSchema:this.currentSchema,me.truncateTable.bind(wrapper));
	    console.log("[IDBUtil]delDataAll END:");
	},
	setSchema:function(schema){
	    this.currentSchema = schema;
	},
	openDB:function(schema){
	    var d= new $.Deferred();
	    this.request = this.indexedDB.open(schema);
	    var me = this;
	    this.request.onsuccess = function (event) {
            	me.idb = this.result;
        	me.currentSchema = schema;
        	d.resolve();
	    };
	    this.request .onerror = function(event) {
		d.reject('DB Open Error!!');
	    };
	    return d.promise();
	},
	openDBforUpdateDB:function(schema,func){
	    var target = undefined;
	    if(this.me!==undefined ){
		var d= this.d===undefined ? new $.Deferred():this.d;
		var me = this.me;
		var target = this.target;
	    }else{
		var d= new $.Deferred();
		var me = this;
	    }
	    console.log("[IDBUtil]openDBforUpdateDB:"+schema);
	    if(me.isWebkit){
		me.request = me.indexedDB.open(schema);
		me.request.onsuccess = function (event) {
                    	me.idb = this.result;
        	        var verReq = me.idb.setVersion(''+me.version);
        		verReq.onsuccess = function(event) {
        	            me.tran = this.result;
        	            me.idb = me.tran.db;
    		    	    me.version=me.idb.version+1;
    		    	    func(target);
        	            d.resolve();
        		};
        		verReq.onerror = function(event) {
        		    d.reject('DB Open Error!!');
        		};
                	me.currentSchema = schema;
        	    };
	    }else{
		me.request= me.indexedDB.open(schema);
		me.request.onsuccess = function(event) {
		    
		    var idb = this.result;
		    me.version = idb.version;
		    me.version++;
		    idb.close();
		    
		    var request = me.indexedDB.open(schema,me.version);;
		    request.onupgradeneeded = function(event) {
			me.idb = this.result;
			if(me.isBeginTran===true){
                    	    var d1= new $.Deferred();
                    	    var tnfl= me.tableNamesForLock===undefined ? me.idb.objectStoreNames :me.tableNamesForLock ;
                    	    //alert("begin transaction:"+tnfl+"/"+me.idb);
                	    me.tran = me.idb.transaction;
            		    //alert(me.indexedDB+"/"+schema+"/"+me.indexedDB.version+"/"+me.version+"/"+ me.tran+"/"+me.idb.objectStoreNames.toSource());
                		
                	    me.request.onabort = function(event) {
                		d1.resolve();
                	    };
                	    me.request.oncomplete = function(event) {
                		d1.resolve();
                	    };
                	    me.request.onerror = function(event) {
                	    	d1.reject('DB Open Error!!');
                	    };
                	    //alert("beginTran!"+this.toSource()+"/"+me.tran.toSource() );
                	    //return d1.promise();
                	}else{
                	    //alert(me.toSource() );
                	}
                	me.currentSchema = schema;
                	var promise = func(target);
                	//alert("promise:"+promise.toSource());
                	if(promise!==undefined){
                	   promise.then(d.resolve);
                	}else{
                    	    d.resolve();
                	}
		    }
    	    	};
	    }
	    me.request.onerror = function(event) {
		d.reject('DB Open Error!!');
	    };
	    return d.promise();
	},
	openDBforUpdateData:function(schema,func){
	    if(this.me!==undefined && this.d!==undefined){
		var d= this.d;
		var me = this.me;
	    }else{
		var d= new $.Deferred();
		var me = this;
	    }

	    console.log("[IDBUtil]openDBforUpdateData:"+schema);
	    if(me.isWebkit){
		me.request = me.indexedDB.open(schema);
		me.request.onsuccess = function (event) {
                    	me.idb = this.result;
        	        var verReq = me.idb.setVersion(''+me.version);
        		verReq.onsuccess = function(event) {
        	            me.tran = this.result;
        	            me.idb = me.tran.db;
    		    	    me.version=me.idb.version+1;
    		    	    func();
        	            d.resolve();
        		};
        		verReq.onerror = function(event) {
        		    d.reject('DB Open Error!!');
        		};
                	me.currentSchema = schema;
        	    };
	    }else{
		me.request= me.indexedDB.open(schema);
		me.request.onsuccess = function(event) {
		    me.idb = this.result;
		    me.version = me.idb.version;
		    me.version++;
            	//alert("A me.version:"+me.version+"/me.isBeginTran:"+me.isBeginTran);
                    if(me.isBeginTran===true){
                    	    var d1= new $.Deferred();
                    	    var tnfl= me.tableNamesForLock===undefined ? me.idb.objectStoreNames :me.tableNamesForLock ;
                    	    console.log("[IDBUtil]begin transaction:"+tnfl.toSource()+"/"+me.idb+"/"+me.idb.objectStoreNames.toString());
                	    me.tran = me.idb.transaction(["Mansiki-data"], me.IDBTransaction.READ_WRITE,0);
                	    console.log("[IDBUtil]"+me.indexedDB+"/"+schema+"/"+me.indexedDB.version+"/"+me.version+"/"+ me.tran+"/"+me.idb.objectStoreNames.toSource());
                		
                	    me.request.onabort = function(event) {
                		d1.resolve();
                	    };
                	    me.request.oncomplete = function(event) {
                		d1.resolve();
                	    };
                	    me.request.onerror = function(event) {
                	    	d1.reject('DB Open Error!!');
                	    };
                	    console.log("[IDBUtil]beginTran!"+this.toSource()+"/"+me.tran.toSource() );
                	    //return d1.promise();
                	}else{
                	    console.log("[IDBUtil]"+me.toSource() );
                	}
                	me.currentSchema = schema;
                	var promise = func();
                	//alert("promise:"+promise.toSource());
                	if(promise!==undefined){
                	   promise.then(d.resolve);
                	}else{
                    	    d.resolve();
                	}
    	    	}
	    };
	    this.request .onerror = function(event) {
		d.reject('DB Open Error!!');
	    };
	    return d.promise();
	},
	setBeginTran:function(tableNamesForLock){
	    this.isBeginTran = true;
	    if(tableNamesForLock!==undefined){
		this.tableNamesForLock = tableNamesForLock;
	    }
	    this.tableNamesForLock = undefined;
	},
	rollback:function(){
	    if(this.me!==undefined && this.d!==undefined){
		this.me.tran.abort();
		return this.d.reject('rollback!');
	    }else{
		this.tran.abort();
	    }
	},
	closeDB:function(){
	    var d= new $.Deferred();
	    var me = this;

	    console.log("[IDBUtil]A close!!"+ me.toSource());
	    this.idb.onabort = function(event) {
		d.resolve();
		console.log("[IDBUtil]B closed!!" );
	    };
	    this.idb.onversionchange = function(event) {
		d.resolve();
		console.log("[IDBUtil]C closed!!" );
	    };
	    this.idb.onerror = function(event) {
	    	d.reject('DB Open Error!!');
	    };
	    this.idb.close();
	    setTimeout(function(){console.log("[IDBUtil]D closed!!" );d.resolve();},10);
	    return d.promise();
	},
	isExistTable:function(tableName){
	    console.log("[IDBUtil]isExistTable!"+tableName.toSource());
	    var tables = this.idb.objectStoreNames;
	    for(var key in tables){
		console.log("[IDBUtil]tables[key]:"+tables[key]);
		if(tables[key]===tableName){
		    return true;
		}
	    }
	    return false;
	},
	createTable:function(ddl){

	    console.log("[IDBUtil]createTable! start!"+this.idb+"/version:"+this.idb.version+"/objectStoreNames:"+this.idb.objectStoreNames.toSource());
	    this.pkMap[ddl.tableName] = ddl.indexes[0];
	    MansikiMapUtil.saveToLS(this.lsKey,this.pkMap);
	    var d= new $.Deferred();
	    if(this.isExistTable(ddl.tableName) ){
		
		if(ddl.orverRide!==true){
		    //this.dropTable(ddl.tableName);
		    console.log("[IDBUtil]ddl.tableName:"+ddl.tableName);

		    this.idb.deleteObjectStore(ddl.tableName);
		}else if(ddl.orverRide===false){
		    console.log("[IDBUtil]createTable not orverRide");
		    setTimeout(function(){d.resolve();},0);
		    return d.promise();
		}else{
		    console.log("[IDBUtil]createTable not exist");
		    setTimeout(function(){d.resolve();},0);
		    return d.promise();
		}
	    }
	    if(this.isWebkit){
		/* IndexedDBのバージョン・チェック */
		if (this.version != this.idb.version) {
		    	var table = this.idb.createObjectStore(ddl.tableName);
		    	if(ddl.indexes.length > 1){
		    	    table.createIndex('index_'+ddl.tableName, ddl.indexes[0], { unique: false,multiEntry:true} );
		    	}else{
		    	    var index = table.createIndex('indexKey', ddl.indexes[0]);
		    	}
		    	this.pkMap[ddl.tableName] = ddl.indexes[0];
		        MansikiMapUtil.saveToLS(this.lsKey,this.pkMap);
		    	this.contractedTables[ddl.tableName]=table;
		}
	    }else{
		    /* オブジェクト・ストア※Tableの作成 */
		    var table = this.idb.createObjectStore(ddl.tableName);
		    if(ddl.indexes.length > 1){
        		table.createIndex('index_'+ddl.tableName, ddl.indexes[0], { unique: false,multiEntry:true} );
		    }else{
        		var index = table.createIndex('indexKey', ddl.indexes[0]);
		    }
		    this.pkMap[ddl.tableName] = ddl.indexes[0];
		    MansikiMapUtil.saveToLS(this.lsKey,this.pkMap);
		    this.contractedTables[ddl.tableName]=table;
	    }
	    setTimeout(function(){d.resolve();},0);
	    console.log("[IDBUtil]createTable! end!");
	    return d.promise();
	},
	dropTable:function(tableName){
	    this.idb.deleteObjectStore(tableName);
	},
	insertData:function(data){
	    console.log("[IDBUtil]insertData START this.d:"+this.d+"/data:"+data);
	    if(this.me!==undefined ){
		var d= this.d!==undefined?this.d:new $.Deferred();
		data = this.data!==undefined ? this.data :data;
		var me = this.me;
	    }else{
		var d= new $.Deferred();
		var me = this;
	    }
	    console.log("[IDBUtil]insertData:"+me.tran+"/"+me.tran.objectStore);
	    var table	= me.tran.objectStore(data.tableName); 
	    if(data.rows===undefined ){
		console.log("[IDBUtil]insertData NO DATA:"+data.rows+"/"+data.toSource());
		var addReq = table.add(data);
		addReq.onsuccess = function() {
		    console.log("[IDBUtil]insertData OK:");
		    d.resolve();
		};
		addReq.onerror = function() {
		    console.log("[IDBUtil]insertData Error:");
		    d.reject('DB Insert Error!!');
		};
		   //setTimeout(function(){ d.resolve();},0);
	    }else{
		/* データをセットします */
		for(var index in data.rows){
			console.log("[IDBUtil]insertData:"+me.index+"/"+data.rows[index]);
			var addReq = table.add(data.rows[index]);
			addReq.onsuccess = function() {
			    d.resolve();
			};
			addReq.onerror = function() {
			    d.reject('DB Insert Error!!');
			};
		    }
		
	    }
	    return d.promise();
	},
	deleteData:function(data){
	    console.log("[IDBUtil]deleteData START this.d:"+this.d);
	    if(this.me!==undefined && this.d!==undefined){
		var d= this.d;
		var me = this.me;
	    }else{
		var d= new $.Deferred();
		var me = this;
	    }
	    var table = me.tran.objectStore(data.tableName); 
	    var key = me.pkMap[data.tableName];
	    console.log("[IDBUtil]deleteData table:"+table+" /data.key:"+data[key]+"/d:"+d);
	    var delReq = table.delete(data[key]);
	    delReq.onsuccess = function() {
		console.log("[IDBUtil]deleteData OK");
	    	d.resolve();
	    };
	    delReq.onerror = function() {
		console.log("[IDBUtil]deleteData Error");
	    	d.reject('DB Open Error!!');
	    };
	    console.log("[IDBUtil]deleteData END this.d:"+this.d);
	    return d.promise();
	},
	updateData:function(data){
	    if(this.me!==undefined && this.d!==undefined){
		var d= this.d;
		var me = this.me;
	    }else{
		var d= new $.Deferred();
		var me = this;
	    }
	    var table = me.tran.objectStore(data.tableName); 
	    var range = me.IDBKeyRange.only(data.key);
	    var pk = me.pkMap[data.tableName];
	    var updateReq = store.index(pk).openCursor(range);
	    var result = [];

	    updateReq.onsuccess = function() {
	        var cursor = this.result;
	        var row = cursor.value;
	        for(var key in data){
	            if(key!==pk){
	        	row[key] = data[key] ;
	            }
	        }

	        if (cursor) {
	             cursor.update(row);
	             cursor.continue();
	         }
	    	d.resolve();
	     };
	     updateReq.onerror = function() {
	    	d.reject('DB Open Error!!');
	    };
	    return d.promise();
	},
	truncateTable:function(tableName){
	    var d= new $.Deferred();
	    var me = this;
	    var table	= me.tran.objectStore(tableName); 
	    var delReq = table.clear();
	    delReq.onsuccess = function() {
	    	d.resolve();
	    };

	    delReq.onerror = function() {
	    	d.reject('DB Open Error!!');
	    };
	    return d.promise();
	},
	executeQuery:function(query){
	    if(this.me!==undefined && this.d!==undefined){
		var d= this.d;
		var me = this.me;
	    }else{
		var d= new $.Deferred();
		var me = this;
	    }
	    var table = this.tran.objectStore(query.tableName);
	    var request = table.get(query.key);
	    request.onsuccess = function (event) {
	    	d.resolve();
	    	me.result = event.target.result;
		return event.target.result;
	    };
	    request.onerror = function(event) {
	    	d.reject('DB Open Error!!');
	    };
	    return d.promise();
	},
	findByKey:function(query,queryResult){
	    if(this.me!==undefined && this.d!==undefined){
		var d= this.d;
		var me = this.me;
	    }else{
		var d= new $.Deferred();
		var me = this;
	    }
	    /* トランザクション経由でオブジェクトの取得 */
	    var table = this.tran.objectStore(query.tableName);
	    var request = table.get(query.key);
	    request.onsuccess = function (event) {
	    	d.resolve();
	    	me.result = event.target.result;
		return event.target.result;
	    };
	    request.onerror = function(event) {
	    	d.reject('[IDBUtil]DB Open Error!!');
	    };
	    return d.promise();
	},
	selectAll:function(tableName){
	    console.log("[IDBUtil]selectAll トランザクション! tableName:"+tableName+" / "+this.me+"/d:"+this.d);
	    if(this.me!==undefined && this.d!==undefined){
		var d= this.d;
		var me = this.me;
	    }else{
		var d= new $.Deferred();
		var me = this;
	    }
	    /* トランザクション経由でオブジェクトの取得 */
		//alert("トランザクション!2 tableName:"+tableName+" / "+this.me.toSource()+"/me.tran:"+me.tran+"/"+this);
	    var table = me.tran.objectStore(tableName);

	    var range = IDBKeyRange.bound('a', 'z');
		//alert("トランザクション!3 tableName:"+tableName+" /table: "+table+"/me.pkMap:"+me.pkMap.toSource()+"/me.pkMap[tableName]:"+me.pkMap[tableName]);
		var indexNames="###";
		for(var index in table.indexNames){
		    indexNames +=" /"+table.indexNames[index]+":"+index;
		}
		var tableNames="###";
		for(var tableNameA in me.tran.db.objectStoreNames){
		    tableNames +=" /"+me.tran.db.objectStoreNames[tableNameA];
		}
		alert("トランザクション!4 tableName:"+tableName+" / table.indexNames:"+indexNames+"/b:"+tableNames+"/a:"+me.pkMap[tableName]);
	   // var index = table.index(me.pkMap[tableName]);
		//alert("トランザクション!5 tableName:"+tableName+" / "+table.toSource());
	    var request = table.openCurosr(range);//all
		alert("トランザクション!6 tableName:"+tableName+" / "+table.toSource());
	    request.onsuccess = function (event) {
		alert("[IDBUtil]selectAll!");
		var cursor = this.result;
		var result = [];
		if (cursor) {
		    result.push(cursor.value);
		    cursor.continue();
		}
		if(this.retIns===undefined) this.retIns={};
		this.retIns.result = result;
		console.log("[IDBUtil] result:"+result.toSource());
		d.resolve();
		return event.target.result;
	    };
	    request.onerror = function(event) {
		alert("[IDBUtil]selectAll!"+event.toSource());
		
	    	d.reject('[IDBUtil]DB Open Error!!');
	    };
	    return d.promise();
	    
	}
	
}