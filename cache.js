var Cache = Object.create(null);

Cache.prototype.cache_object = {};
Cache.prototype.cache = [];
Cache.prototype.clearCache = function () {
    cache = [];
};
getCacheObject = function (id) {
    return cache[id]
},
setCacheObject = function (id,obj) {
    cache[id] = obj;
    return cache;
},
checkCache = function(id) {
    if(getCacheObject(id)) {
	return getCacheObject(id);
    }
    else {
	return "Fetch from Backend";
    }
};

