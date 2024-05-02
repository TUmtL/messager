<template>
  <div>
    <button @click="registration = !registration">{{ registration }}</button>
    <form v-if="registration == true" @submit.prevent="registrate()">
      registate
      <input placeholder="name" v-model="test.name" type="text" />
      <input placeholder="login" v-model="test.login" type="text" />
      <input placeholder="password" v-model="test.password" type="text" />
      <button type="submit">send</button>
    </form>
    <form v-else @submit.prevent="logining()">
      log in
      <input placeholder="login" v-model="test.login" type="text" />
      <input placeholder="password" v-model="test.password" type="text" />
      <button type="submit">send</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {useRouter, useRoute} from 'vue-router'
import storeR from "../store";
const router = useRouter()
const store = ref(storeR())
const registration = ref(false);
const date = computed(() => Date.now());
const test = ref({
  login: "adminadmin",
  password: "adminadmin",
  name: "admin",
  date: new Date(date.value)
});
store.value.accaunt = {}
store.value.accaunt.messagesIDList= []
async function registrate() {
  if(test.value.name.split('').find(el => el == ' ') == null){
      try {
    const raw = await fetch("http://127.0.0.1:3001/signin", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(test.value)
    });
    const cooked = await raw.json();
    console.log(cooked)
    if(cooked.accaunt === true){
      store.value.getAccount(cooked.path)
      router.push(`/accaunt/${cooked.path}`)
    }
  } catch (error) {}}
}
async function logining() {
  try {
    const raw = await fetch("http://127.0.0.1:3001/login", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(test.value)
    });
    const cooked = await raw.json();
    console.log(cooked);
    if(cooked.accaunt === true){
      store.value.getAccount(cooked.path)
      router.push(`/accaunt/${cooked.path}`)
    }
  } catch (error) {}
}

</script>

<style  scoped>
form {
  display: flex;
  flex-direction: column;
}
</style>