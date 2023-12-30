class Node{
    constructor(item){
        this.payload = item;
        this.time = Date.now();
        this.prev = null;
        this.next = null;
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
                this.current.setNext(node);
                const prevNode = node.getPrev();
                if(prevNode){
                    prevNode.setNext(node.getNext());
                }else{
                    this.head = node.getNext();
                }
                node.setPrev(this.current);
                node.setNext(null);
                this.current = this.current.getNext();
            }
            return node.getPayload();
        }else{
            let item = await this.promiseWrapper(fallbackFn);
            const newNode = new Node(item);
            if(this.size < this.maxSize){
                if(this.size === 0){
                    this.head = newNode;
                    this.current = newNode;
                }else{
                    this.current.setNext(newNode);
                    newNode.setPrev(this.current);
                    this.current = this.current.getNext();
                }
                this.map[key] = newNode;
                this.size++;
            }else{
                this.current.setNext(newNode);
                newNode.setPrev(this.current);
                const removedNode = this.head;
            
                this.head = this.head.getNext();
                this.current = this.current.getNext();

                removedNode.setNext(null);
                removedNode.setPrev(null);
            }
            return item;
        }
    }
}

module.exports = {
    LRUCache:LRUCache
};