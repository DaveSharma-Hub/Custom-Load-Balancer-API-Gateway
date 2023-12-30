# Custom-Load-Balancer-API-Gateway

## Description
Custom implemented load balancer and api gateway that caches results, with vertical scaling allowing for improved performance using a Node.js server


## Usage

Using this custom loadbalancing application, similar to many of the well known cloud services such as AWS API Gateway which provided vertical and horizontal scalability this custom backend server introduces a custom implementation with increases customization.

``
npm install
``

``
npm start
``

## How it works

Using cluster node package to maximize the number of cores of the system used, this custom backend node application will improve throughtput, decrease latency, 
all the while increasing the total number of requests that can be called. Using the cluster package, the system utilizes parallelism by forking to vertically scale
the node application allowing for increased improvements. Alongside, using cached communication between parent and worker processes to ensure that the latest 
data is stored for further improvements (not needing to query any database everytime)

![image](https://user-images.githubusercontent.com/81478885/209595184-4e048d89-3944-4997-aa9e-ad70f94335e4.png)


## Comparison
Tested using the autocannon package. Can test out from ``/test`` folder, customizing settings and running ``npm test``
*DB simulated with 2000ms(2sec) sleep to simulate time to query DB and recieve the data.

| Type | Latency, ms (smaller better) | Requests, req/sec (higher better) | Throughput (Higher better) |
|------|------------------------------|-----------------------------------|----------------------------|
| Custom Loadbalancer | 887.69| 5894.7 | 1343884.8|
| Normal Node.js Application | 1081.41 | 4628.9 | 1055308.8 |
|-|-|-|-|
|Custom Loadbalancer with DB simulation*|2494.41 |558 |127227.2 |
|Normal Node.js Application with DB simulation*|7044.34|0.34 |76|
|-|-|-|-|
|Custom Loadbalancer + LRU Cache with DB simulation*| 2232.17 |1744.1 |397568 |
|-|-|-|-|


With DB simulation, the custom loadbalancer outperforms a normal node.js server application by being able to handle more than 1000 times more requests per second, 1000 times more throughput, alongside fulfilling the request with 35% of the latency time. 

## License 
MIT
