<template>
  <!-- rework interface -->
  <form @submit.prevent>
    <input v-model="chatID" placeholder="i dont work:(" type="text" />
    <label>
      <p>пишут только админы?</p>
      <input v-model="adminsWriteOnly" type="checkbox" >
    </label>
    <label>
      <p>белый список?</p>
      <input v-model="whiteList" type="checkbox" />
      <input v-if="whiteList" v-model="whiteListCollection" type="text">
    </label>
    <button @click="getOrCreate('get')">найти</button>
    <button @click="getOrCreate('create')">создать</button>
  </form>
</template>

<script setup>
import { ref} from "vue";
import storeR from "../store";
const props = defineProps(['socket'])
const store = ref(storeR());
const chatID = ref("");
const whiteList = ref(false)
const adminsWriteOnly = ref(false)
const whiteListCollection = ref('')
async function getOrCreate(method) {
  // console.log(whiteListCollection.value.split(' '))
  fetch(`${store.value.ref}messager`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      findId: chatID.value,
      authorPath: store.value.accaunt.path,
      method,
      authorSatus: store.value.accaunt.status,
      whiteList:whiteList.value,
      whiteListCollection:whiteListCollection.value.split(' '),
      adminsWriteOnly:adminsWriteOnly.value,
    })
  })
    .then(res => (res = res.json()))
    .then(res => res = [...new Set(res)])
    .then(res => {
      store.value.accaunt.messagesIDList = res;
      localStorage.setItem("accaunt", JSON.stringify(store.value.accaunt));
      console.log(res);
      props.socket.emit('create' , res[res.length - 1])
      props.socket.emit(`create/${res[res.length - 1]}` , res[res.length - 1] )
    });
}
</script>

<style>
</style>