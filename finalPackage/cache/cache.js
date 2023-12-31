const { LRUCache } = require('./lruCache');

class CacheClient{
    constructor({maxSize}){
        this.cache = new LRUCache({maxSize});
    }

    functionWrapper(fnCb){
        let closureCalled = false;
        return async () => {
                closureCalled = true;
                return {
                    result:await fnCb(),
                    closureCalled: closureCalled
                }
            }
    }

    async getItem(key,fnCb){
        const fn = this.functionWrapper(fnCb);
        const { result, closureCalled } = await this.cache.getItem(key, fn);
        // console.log(`closureCalled ${closureCalled}`);
        return {
            result:result,
            wasCached: !closureCalled
        }
    }
}


module.exports = {
    CacheClient
}