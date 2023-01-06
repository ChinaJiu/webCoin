const sha256 = require('crypto-js/sha256')
class Block {
    constructor(data, previousHash) {
      this.data = data || 'please fill in data'
      this.previousHash = previousHash || null
      this.hash = this.computedHash()
      this.nonce = 1
    }

    computedHash() {
      return sha256(this.data + this.previousHash + this.nonce).toString()
    }

    getAnswer(difficulty) {
      let answer = ''
      for (let index = 0; index < difficulty; index++) {
        answer+='0'
      }
      return answer
    }

    // 根据难度来计算hash
    mine(difficulty) {
      while(true) {
        this.hash = this.computedHash()
        if( this.hash.substring(0, difficulty) !== this.getAnswer(difficulty) ) {
          this.nonce++
        } else {
          break
        }
      }
      console.log('挖到旷了', this.hash)
    }
}

class Chain{
    constructor() {
        this.chain = [this.bigBang()]
        this.difficulty = 4
    }

    // 第一个区块
    bigBang() {
        return new Block('我是第一个区块')
    }
    
    // 获取最后一个区块
    getLastBlock() {
        return this.chain[this.chain.length-1]
    }

    // 添加到区块链
    addBlockToChain(block) {
        const lastBlock = this.getLastBlock()
        block.hash = block.computedHash()
        block.previousHash = lastBlock.hash
        // 根据挖矿难度计算
        block.mine(this.difficulty)
        this.chain.push(block)
    }

    // 验证区块链是否被篡改
    // 验证当前内容是否被篡改
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
const chain = new Chain()

const block2 = new Block('2', null)
const block3 = new Block('3', null)
chain.addBlockToChain(block2)
chain.addBlockToChain(block3)

// chain.chain[1].data = 123
// chain.chain[1].hash = chain.chain[1].computedHash()

// console.log(chain.validateChain());

