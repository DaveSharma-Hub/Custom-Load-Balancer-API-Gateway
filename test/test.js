const cluster = require('cluster');

let count = 0;

function update(){
    console.log('SENDING...');
   Object.values(cluster.workers).forEach((worker)=>{
        worker.send({msg:"PARENT"});
        worker.on('message',msg=>{
            console.log(msg);
        })
   })
}

function sendToParent(){
    process.on('message',msg=>{
        console.log(msg);
    })
}

function test(){
    if(cluster.isMaster){
        cluster.fork();
        cluster.fork();
        update();
        setInterval(update,1000);
        
        cluster.on('exit',(worker,code,signal)=>{
            console.log(`Process ${worker.process.pid} closed`);
        })
    }else{
        console.log(`Test ${count+1}`);
        process.send({msg:'Child'});
        setInterval(sendToParent,1000);
        count = count+1;
    }
}

test();