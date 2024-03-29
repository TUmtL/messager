import { useRouter } from 'vue-router'
import {defineStore} from 'pinia'
export default defineStore('test' , {
  state(){
    return{
      accaunt:{},
      ref:'http://26.118.49.40:3001/',
      counter:0,
      router:useRouter()
    }
  },
  actions:{
    async getAccount(path){
      const raw = await fetch(this.ref + path)
      const cooked = await raw.json()
      this.accaunt = cooked
      localStorage.setItem('accaunt' , JSON.stringify(cooked))
    },
    async testAcc(){
      if (JSON.parse(localStorage.getItem("accaunt")?.length != 0) && JSON.stringify(this.accaunt).length == 2) {
        this.accaunt = JSON.parse(localStorage.getItem("accaunt"));
        fetch(`${this.ref}${this.accaunt?.path}`).then(res => res = res.json()).then(res =>{
          if(JSON.stringify(res) != localStorage.getItem("accaunt") ) {
            localStorage.removeItem('accaunt')
            this.accaunt = {}
            this.router.push('/')
          }
        })
      }
    },
    find
  },

})