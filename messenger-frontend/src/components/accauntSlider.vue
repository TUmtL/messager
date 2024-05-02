<template>
  <div class="accaunt-slider">
    <button @click="props.accaunt[0].author = ''">low</button>
    <p>{{ props.accaunt[0].author }}</p>
    <p>{{ accauntSlide.date }}</p>
    <button v-if="thisMyAcc" @click="wanaChange = !wanaChange"><span v-if="!wanaChange">поменять данные</span><span v-if="wanaChange">отмена</span></button>
    <div class="change-form" v-if="thisMyAcc && wanaChange">
      <label>
        <p>login</p>
        <input v-model="editLogin" type="text">
      </label>
      <label>
        <p>password</p>
        <input v-model="editPassword" type="text">
      </label>
      <button @click="edit()">изменить</button>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import storer from '../store';
  const store = ref(storer()) 
  const props = defineProps({accaunt:Object})
  const editLogin = ref('')
  const editPassword = ref('')
  const accauntSlide = ref({})
  const wanaChange = ref(false)
  const thisMyAcc = ref(false)
  async function edit(){
    const raw = await fetch('http://127.0.0.1:3001/edit/' + store.value.accaunt.path , {
      method:'POST',
      headers:{
        'Content-Type':'application/json ; charset=utf-8'
      },
      body:JSON.stringify({whoEdit:store.value.accaunt.path , whoEditPassword:store.value.accaunt.password , login:editLogin.value , password:editPassword.value})
    })
    const cooked = await raw.json()
    if(cooked.status == 'ok') {
      store.value.accaunt.login = editLogin.value
      store.value.accaunt.password = editPassword.value
      localStorage.setItem('accaunt' , JSON.stringify(store.value.accaunt))
    }
    console.log(cooked)

  }
  async function getMyAcc(){
    const raw = await fetch(`http://127.0.0.1:3001/${props.accaunt[0].author}`)
    const cooked = await raw.json()
    accauntSlide.value = cooked
    thisMyAcc.value = true
  }
  async function getAcc(){
    const raw = await fetch(`http://127.0.0.1:3001/info/${props.accaunt[0].author}`)
    const cooked = await raw.json()
    accauntSlide.value = cooked
    thisMyAcc.value = false
  }
  watch(
    ()=> props.accaunt  ,
    ()=>{
      thisMyAcc.value = false
      props.accaunt[0].author != '' ? document.querySelector('.accaunt-slider').classList.add('active') : document.querySelector('.accaunt-slider').classList.remove('active')
      if(props.accaunt[0].author != '') props.accaunt[0].author == store.value.accaunt.path ? getMyAcc() : getAcc()
      props.accaunt[0].author == '' ? accauntSlide.value = {} : null
    },
    {deep:true}
  )
  watch(
    ()=> wanaChange.value ,
    ()=>{
      wanaChange.value == true ? null : () =>{editLogin = '' ; editPassword = ''}
    }
  )
</script>

<style>

</style>