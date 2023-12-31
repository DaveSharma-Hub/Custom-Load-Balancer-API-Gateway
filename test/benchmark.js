'use strict'

const autocannon = require('autocannon');

async function loadtest(connections, duration, url){
    const result = await autocannon({
        url: url,
        connections: connections, //default
        pipelining: 1, // default
        duration: duration // default
    })
    console.log(result)
}

// loadtest(5000,10,"http://localhost:8000/getData")
// .then((response)=>{})
// .catch((error)=>{
//     console.log(error)
// })

loadtest(10000,10,["http://localhost:8000/getSecond","http://localhost:8000/getData"])
.then((response)=>{})
.catch((error)=>{
    console.log(error)
})