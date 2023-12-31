class Node{
    constructor(key, item){
        this.payload = item;
        this.time = Date.now();
        this.prev = null;
        this.next = null;
        this.key = key;
    }

    setPayload(item){
        this.payload = item;
    }

    setNext(node){
        this.next = node;
    }

    setPrev(node){
        this.prev = node;
    }

    getNext(){
        return this.next;
    }

    getPrev(){
        return this.prev;
    }
    
    getPayload(){
        return this.payload;
    }

    getKey(){
        return this.key;
    }
}


class LRUCache{
    constructor({maxSize}){
        this.head = null;
        this.current = this.head;
        this.map = {};
        this.maxSize = maxSize;
        this.size = 0;
    }

    mapHasKey(key){
        return key in this.map;
    }

    async promiseWrapper(fn){
        return new Promise(async(res,rej)=>{
            try{
                const result = await fn();
                res(result);
            }catch(e){
                rej(e);
            }
        });
    }

    async getItem(key, fallbackFn){
        if(this.mapHasKey(key)){
            const node = this.map[key];
            if(node !== this.current){
                const prevNode = node.getPrev();
                const nextNode = node.getNext();
                if(prevNode){
                    prevNode.setNext(nextNode);
                }
                if(nextNode){
                    nextNode.setPrev(prevNode);
                }
                if(this.head === node){
                    this.head = nextNode;
                }
                this.current.setNext(node);
                node.setPrev(this.current);
                node.setNext(null);
                this.current = this.current.getNext();
            }
            return node.getPayload();
        }else{
            let item = await this.promiseWrapper(fallbackFn);
            const newNode = new Node(key, item);
            if(this.size < this.maxSize){
                if(this.size === 0){
                    this.head = newNode;
                    this.current = newNode;
                }else{
                    this.current.setNext(newNode);
                    newNode.setPrev(this.current);
                    this.current = newNode;
                }
                this.map[key] = newNode;
                this.size++;
            }else{
                this.current.setNext(newNode);
                newNode.setPrev(this.current);
                this.current = this.current.getNext();

                const removedNode = this.head;
                
                this.head = this.head.getNext();
                this.head.setPrev(null);

                removedNode.setNext(null);
                removedNode.setPrev(null);

                delete this.map[removedNode.getKey()];
            }
            return item;
        }
    }
    
    print(){
        let node = this.head;
        while(node!==null){
            console.log(node);
            node = node.getNext();
        }
    }
}

module.exports = {
    LRUCache:LRUCache
};