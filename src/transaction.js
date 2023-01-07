const sha256 = require('crypto-js/sha256')

class Transaction {
  constructor(from, to, amount) {
    this.from = from
    this.to = to
    this.amount = amount
  }
} 

class Block {
    // data -> transaction <-> array of objects
    constructor(transaction, previousHash) {
      this.transaction = transaction || 'please fill in data'
      this.timestamp = Date.now()
      this.previousHash = previousHash || null
      this.hash = this.computedHash()
      this.nonce = 1
    }

    computedHash() {
      // transaction 需要 stringify
      return sha256(JSON.stringify(this.transaction) + this.previousHash + this.nonce + this.timestamp).toString()
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
        this.transactionPool = []
        this.minerReward = 50
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

    addTransaction(transaction) {
      this.transactionPool.push(transaction);
    }

    mineTransactionPool(minerRewardAddress) {
      // 发放矿工奖励
      const minerRewardTransaction = new Transaction(
        null,
        minerRewardAddress,
        this.minerReward
      )
      this.transactionPool.push(minerRewardTransaction)
      
      // 挖矿
      const newBlock = new Block(
        this.transactionPool,
        this.getLastBlock().hash
      )
      newBlock.mine(this.difficulty)

       // 添加区块到区块链
      this.chain.push(newBlock)

       // 清空 transaction Pool
       this.transactionPool = []

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
const transaction1 = new Transaction('address1', 'address2', 10)
const transaction2 = new Transaction('address2', 'address1', 5)

const chain = new Chain()

// const block1 = new Block(transaction, null)
// chain.addBlockToChain(block1)

chain.addTransaction(transaction1)
chain.addTransaction(transaction2)
chain.mineTransactionPool('user')


console.log(chain.chain[1]);
console.log(chain.chain[1].transaction);