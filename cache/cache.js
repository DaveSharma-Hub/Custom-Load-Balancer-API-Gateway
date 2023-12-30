const { LRUCache } = require('./lruCache');

class CacheClient{
    constructor({maxSize}){
        this.cache = new LRUCache({maxSize});
    }

    functionWrapper(fnCb){
        let closureCalled = false;
        return {
            fn:async () => {
                await fnCb();
                closureCalled = true;
            },
            closureCalled:closureCalled
        }
    }

    async getItem(key,fnCb){
        const { fn, closureCalled } = this.functionWrapper(fnCb);
        const result = await this.cache.getItem(key, fn);
        return {
            result:result,
            wasCached: !closureCalled
        }
    }
}


module.exports = {
    CacheClient
}