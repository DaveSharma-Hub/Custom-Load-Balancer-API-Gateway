const cluster = require('cluster');
const { CacheClient } = require('./cache/cache');
const numberOfCPUCores = require('os').cpus().length;


// const lbclient = new LoadBalancerClient({maxSize: 100000, maxCores:20}, endpoints);

// lbclient.initialize();

// function endpoints(process){
//     lbclient.workerMasterComms(process);
//     app.get('/getData',async (req,res)=>{
//         try{
//             const res = await lbclient.executeOperation(process,'getDatat',async ()=>{
//                 await getData();
//             });
//         }catch(e){

//         }
//     });
// }

class LoadBalancerClient{
    constructor({maxSize, maxCores}, appRunner){
        this.cacheClient = new CacheClient({maxSize});
        this.maxSize = maxSize;
        this.maxCores = maxCores ?? numberOfCPUCores;
        this.appRunner = appRunner;
    }

    initialize(){
        if(cluster.isMaster){
            console.log(`Parent process ${process.pid} running`);
            const workers = [];
    
            const broadCastToAllWorker = (msg) => {
                for(let worker of workers){
                    worker.send(msg);
                }
            }
    
            for(let i=0;i<this.maxCores;i++){
                const worker = cluster.fork();
                worker.on('message', msg=>{
                    broadCastToAllWorker(msg);
                });
                workers.push(worker);
            }
            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died`);
            });
        }
        else{
            console.log(`Child process ${process.pid}`);
            this.appRunner(process);
        }
    }

    workerMasterComms(process){
        process.on('message',msg=>{
            Object.entries(msg).map(async(entry)=>{
                await this.cacheClient.getItem(entry[0],()=>{
                    return entry[1];
                });
            });
        })
    }

    async executeOperation(process, key, functionCallback){
        const { result, wasCached } = await cacheClient.getItem(key,functionCallback);
        if(!wasCached){
            process.send({
                key:key,
                data:result
            });
        }
        return result;
    }
}


module.exports = {
    LoadBalancerClient: LoadBalancerClient
}