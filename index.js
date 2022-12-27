const cors = require('cors');
const app = require('express')();
const cluster = require('cluster');
const endpoint = require('./apiEndpoints');
const numberOfCPUCores = require('os').cpus().length;
// const PORT = 8000;
let currentCount = 0;
let aboveThreshold = currentCount>2 ? true : false;
const CACHED_THRESHOLD = 1000;
let cachedData = {};

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
        for(let i=0;i<numberOfCPUCores;i=i+1){
            cluster.fork();
        }
        updateWorkers();
        setInterval(updateWorkers, 10000);
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
        });
    }
    else{
        console.log(`Child process ${process.pid}`);
        endpointFunction(PORT);
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

function endpointFunction(PORT){
    // let tmpData = [];
    process.on('message',msg=>{
        Object.entries(msg.cachedData).map((entry)=>{
            cachedData[entry[0]] = entry[1];
        })
        // console.log(cachedData);
    })
    app.get('/getData',(req,res)=>{
        const data = findData(cachedData,'getData');
        // console.log(data,cachedData);
        if(data){
            process.send({tmpData:cachedData});
            res.send(data.data);
        }else{
            sleep(2000);//get data from DB
            cachedDataHandler({
                query:'getData',
                params:'',
                data:'Hi'
            });
            res.send('Hi');
        }
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


