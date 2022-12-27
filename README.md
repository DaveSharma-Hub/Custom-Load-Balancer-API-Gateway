# Custom-Load-Balancer-API-Gateway

## Description
Custom implemented load balancer and api gateway that caches results, with vertical scaling allowing for improved performance using a Node.js server


## Usage

Using this custom loadbalancing application, similar to many of the well known cloud services such as AWS API Gateway which provided vertical and horizontal scalability
this custom backend server introduces a custom implementation with increases customization.

## How it works

Using cluster node package to maximize the number of cores of the system used, this custom backend node application will improve throughtput, decrease latency, 
all the while increasing the total number of requests that can be called. Using the cluster package, the system utilizes parallelism by forking to vertically scale
the node application allowing for increased improvements. Alongside, using cached communication between parent and worker processes to ensure that the latest 
data is stored for further improvements (not needing to query any database everytime)

![image](https://user-images.githubusercontent.com/81478885/209595184-4e048d89-3944-4997-aa9e-ad70f94335e4.png)


## Comparison
Tested using the autocannon package. Can test out from ``/test`` folder, customizing settings and running ``npm start``

| Type | Latency, ms (smaller better) | Requests, req/sec (higher better) | Throughput (Higher better) |
|------|------------------------------|-----------------------------------|----------------------------|
| Custom Loadbalancer | 887.69| 5894.7 | 1343884.8|
| Normal Node.js Application | 1081.41 | 4628.9 | 1055308.8 |


## License 
MIT
