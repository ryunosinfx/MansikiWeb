var MansikiMapUtil={
	insert:function(map,index,value){
		var oldMap = map;
		var newMap ={};
		for(var tmpCursor in oldMap){
			var offset = 0;
			if(tmpCursor*1>=index){
				offset = 1;
			}
			newMap[(tmpCursor*1+offset)] = oldMap [tmpCursor];
		}
		newMap[index] = value;
		return newMap;
	},
	after:function(map,index,value){
		var oldMap = map;
		var newMap ={};
		var hasProp =false;
//console.log("after index:"+index+"/value:"+value);
		for(var tmpCursor in oldMap){
			var offset = 0;
//console.log("after index:"+index+"/tmpCursor:"+tmpCursor);
			if(tmpCursor*1>=index){
				offset = 1;
			}
			hasProp=true;
			newMap[(tmpCursor*1+offset)] = oldMap [tmpCursor];
		}
		newMap[(index*1)] = value;
		
		return newMap;
	},
	del:function(map,value){
		var oldMap = map;
		var newMap ={};
		var targetIndex = undefined;
		for(var tmpCursor in oldMap){
			var tmpVal = oldMap [tmpCursor];
			if(value*1===tmpVal*1){
				targetIndex = tmpCursor*1;
				break;
			}
		}
//console.log("del targetIndex:"+targetIndex);
		for(var tmpCursor in oldMap){
			var newIndex = tmpCursor*1;
			var tmpVal = oldMap [newIndex];
//console.log("del tmpCursor:"+newIndex+":"+tmpVal+"/targetIndex:"+targetIndex);
			if(targetIndex*1 === newIndex*1 ){
			    //skip
			}else if(targetIndex*1 < newIndex && newIndex>0){
				newMap[(newIndex-1)] =tmpVal;
			}else if(targetIndex !== newIndex){
				newMap[(newIndex)] = tmpVal;
			}
		}
//console.log("newMap:"+newMap.toSource());
		return newMap;
	},
	add:function(map,value){
		var count = MansikiMapUtil.getCount(map);
		map[count]=value;
		return map;
	}
	,getMaxIndex:function(map){
		var max =0;
		for(var i in map){
			max=max<i*1?i*1:max;
		}
		return max;
	}
	,getCount:function(map){
		var count =0;
		for(var i in map){
			count++;
			i++;
		}
		return ++count;
	}
	,getKey:function(map,value){
		for(var key in map){ 
//console.log("getKey key:"+key+"/idIndex:"+value);
			if(map[key]===value){
				return key;
			}
		}
	},
	getFormatedTextCRLF:function(text){
		return text===undefined ?"":text.replace(/(\r|\n|\r\n)/g, "<br />");
	},
	deepCopyMap:function(originMap){
		var copyMap ={};
		var json = JSON.stringify(originMap);
		copyMap = JSON.parse(json);
		return copyMap;
	},
	saveToLS:function(key ,target){
		var value = JSON.stringify(target);
		localStorage.setItem(key,value);
	},
	saveToLSasPlane:function(key ,target){
		localStorage.setItem(key,target);
	},
	loadFromLS:function(key){
		var joinStr = localStorage.getItem(key);
		return JSON.parse(joinStr);
	},
	removeFromLS:function(key){
		localStorage.removeItem(key);
	},
	overrideLS:function(primary,secondly,value){
		var joinStr = localStorage.getItem(primary);
		var json =  JSON.parse(joinStr);
		json[secondly] = value;
		var joinStrToSave = JSON.stringify(json);
		localStorage.setItem(primary,joinStrToSave);
	},
	clearLS:function(){
		localStorage.clear();
	},
	addCSSRule:function(selector, css) { 
		var sheets = document.styleSheets, 
		sheet = sheets[sheets.length - 1]; //?最後でいいのか？
	   
		if(sheet.insertRule) { 
		    	sheet.insertRule(selector + '{' +  css + '}', sheet.cssRules.length); 
		}else if(sheet.addRule) { 
			sheet.addRule(selector, css, -1); 
		} 
	}
	
}