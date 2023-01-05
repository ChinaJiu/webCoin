const sha256 = require('crypto-js/sha256')
class Block {
    constructor(data, previousHash) {
        this.data = data || 'please fill in data'
        this.previousHash = previousHash || null
        this.hash = this.computedHash()
    }

    computedHash() {
        return sha256(this.data + this.previousHash).toString()
    }
}

class Chain{
    constructor() {
        this.chain = [this.bigBang()]
    }

    bigBang() {
        return new Block('我是第一个区块')
    }
    
    getLastBlock() {
        return this.chain[this.chain.length-1]
    }
    addBlockToChain(data) {
        const lastBlock = this.getLastBlock()
        const newBlock = new Block(
            data,
            lastBlock.hash
          );
        this.chain.push(newBlock)
    }

    // 验证区块链是否被篡改
    validateChain() {
        for (let index = 0; index < this.chain.length; index++) {
            // console.log(index);
            const block = this.chain[index];

            // 验证当前快是否被篡改
            if(block.hash !== block.computedHash() ) {
                console.log(`当前第 ${index + 1} 区块被篡改`)
                return false
            }

            if (index == 0) {
                continue
            }

            const previousBlock = this.chain[index - 1];
            if(block.previousHash !==  previousBlock.hash) {
                console.log(`当前第 ${index} 和 ${index + 1}块区块断裂`)
                return false
            }
        }
        return true
    }
}
const block1 = new Block('1', null)
// console.log(block1);
const chain = new Chain()

chain.addBlockToChain(2)
chain.addBlockToChain(3)

console.log(chain.chain);

chain.chain[1].data = 123
chain.chain[1].hash = chain.chain[1].computedHash()

console.log(chain.validateChain());

