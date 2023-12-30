const cors = require('cors');
const app = require('express')();
const cluster = require('cluster');
const endpoint = require('./apiEndpoints');
const { CacheClient } = require('./cache/cache');
const numberOfCPUCores = require('os').cpus().length;
// const PORT = 8000;
let currentCount = 0;
let aboveThreshold = currentCount>2 ? true : false;
const CACHED_THRESHOLD = 1000;
let cachedData = {};
const cacheClient = new CacheClient({maxSize:1000});


function updateWorkers(){
    let tmpObject = {};
    Object.values(cluster.workers).forEach((worker)=>{
        worker.on('message',msg=>{
            if(msg.cachedData){
                Object.entries(msg.cachedData).map((entry)=>{
                    cachedData[entry[0]] = entry[1];
                    tmpObject[entry[0]] = entry[1];
                })
            }
        })
        worker.send({cachedData:tmpObject});
    })
}

function runLoadBalancer(PORT){
    if(cluster.isMaster){
        console.log(`Parent process ${process.pid} running`);
        const workers = [];

        const broadCastToAllWorker = (msg) => {
            for(let worker of workers){
                worker.send(msg);
            }
        }

        for(let i=0;i<numberOfCPUCores;i++){
            const worker = cluster.fork();
            worker.on('message', msg=>{
                // console.log(`Master message: ${msg}`);
                broadCastToAllWorker(msg);
            });
            workers.push(worker);
        }
        // updateWorkers();
        // setInterval(updateWorkers, 10000);
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
        });
    }
    else{
        console.log(`Child process ${process.pid}`);
        endpointFunction(PORT, process);
    }
}

function sleep(time){
    const start = Date.now();
    while(Date.now()-start<time){}   
}

function findData(tmpData,query){
    // let data = tmpData.filter((data)=>data.query===query)
    // return data.length>0 ? data[0] : null;
    let data = tmpData[query] ?? null;
    return data;
}

function cachedDataHandler(inputData){
    // if(cachedData.length>CACHED_THRESHOLD){
    //     cachedData = cachedData.splice(cachedData.length/2);
    // }
    cachedData[inputData.query] = (inputData);
    /*
        inputData = {
            query:String (GET,POST,PUT)
            params:String (Query Params)
            data:Array/Object
        }
    */
}

function endpointFunction(PORT, process){
    // let tmpData = [];
    process.on('message',msg=>{
        // console.log(`Recieved process: ${process.pid}`);
        Object.entries(msg).map(async(entry)=>{
            await cacheClient.getItem(entry[0],()=>{
                return entry[1];
            });
            // cachedData[entry[0]] = entry[1];
        });
        // console.log(cachedData);
    })
    app.get('/getData',async (req,res)=>{
        // const data = findData(cachedData,'getData');
        // console.log(data,cachedData);

        const { result, wasCached } = await cacheClient.getItem('getData',()=>{
            sleep(2000);
            return {
                query:'getData',
                params:'',
                data:'Hello'
            };
        });

        // console.log(wasCached);
        if(!wasCached){
            process.send({
                key:result.query,
                data:result
            });
        }

        console.log(`Using process: ${process.pid}`);
        res.send(result.data);

        // if(data){
        //     process.send({tmpData:cachedData});
        //     res.send(data.data);
        // }else{
        //     sleep(2000);//get data from DB
        //     cachedDataHandler({
        //         query:'getData',
        //         params:'',
        //         data:'Hi'
        //     });
        //     res.send('Hi');
        // }
        // sleep(2000);
        // res.send('Hi');
    })
    app.get('/getSecond',(req,res)=>{
        currentCount = currentCount+1;
        res.send('Hello');
    })
    app.get('/getThird',(req,res)=>{
        currentCount = currentCount+1;
        res.send('Bye');
    })
    app.use(cors());

    app.listen(PORT,()=>console.log(`Listening on PORT ${PORT}`));
}

runLoadBalancer(8000);
// endpointFunction(8000);


