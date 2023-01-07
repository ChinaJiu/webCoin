const sha256 = require('crypto-js/sha256')
const ecLib = require('elliptic').ec;
const ec = new ecLib('secp256k1') // curve name

class Transaction {
  constructor(from, to, amount) {
    this.from = from
    this.to = to
    this.amount = amount
  }

  computedHash() {
    return sha256(this.from + this.to + this.amount).toString()
  }

   // 签名需要private key
   sign(privateKey) {
    this.signature = privateKey.sign(this.computedHash(), 'base64').toDER('hex')
   }

   isValid() {
    // 区块中心发放奖励是不需要验证的
    if(this.from == null) {
      return true
    }
    
    if(!this.signature)
      throw new Error('sig missing')
    const publicKey = ec.keyFromPublic(this.from, 'hex')
    return publicKey.verify(this.computedHash() , this.signature)
   }

} 

class Block {
    // data -> transaction <-> array of objects
    constructor(transaction, previousHash) {
      this.transaction = transaction || []
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
      if(!this.validateTransactions()){
        throw new Error('tampered transactions found, abort, 发现异常交易，停止挖矿')
      }
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

    //在block里验证这所有的transactions
    validateTransactions(){
      for(let transaction of this.transaction){
        if(!transaction.isValid()){
          console.log('非法交易')
          return false
        }
      }
      return true
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
      if(!transaction.isValid()) {
        throw new Error('invalid transaction')
      }
      console.log('valid transaction');
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
            const block = this.chain[index];

            // block的transactions均valid
            if (!block.validateTransactions()){
              console.log('非法交易')
              return false
            }

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

const keyPairSender = ec.genKeyPair();
const privateKeySender = keyPairSender.getPrivate('hex')
const publicKeySender = keyPairSender.getPublic('hex')

const keyPairReceiver = ec.genKeyPair();
const privateKeyReceiver = keyPairReceiver.getPrivate('hex')
const publicKeyReceiver = keyPairReceiver.getPublic('hex')


const transaction1 = new Transaction(publicKeySender, publicKeyReceiver, 10)

transaction1.sign(keyPairSender)
// console.log(transaction1);
// console.log(transaction1.isValid());


// transaction1.amount = 222
const chain = new Chain()
chain.addTransaction(transaction1)
chain.mineTransactionPool(publicKeyReceiver)

console.log(chain.chain);
console.log(chain.chain[1].transaction);