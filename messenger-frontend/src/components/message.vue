<template>
  <div @mouseleave="popdown()" @click.right.prevent="popup = !popup" class="message-body">
    <div v-if="message.author != 'server' && message.author == store.accaunt.path" :class="{'message-popup':popup , 'hide':true}">
      <button @click="editChange()">edit</button>
      <button @click="remove()">remove</button>
    </div>
    <div v-if="edit == false">
    
      <h6 class="author">{{ message.author }}</h6>
      <p class="message">{{ message.message }}</p>
      <p v-if="message.redact == true">редактированно</p>
    </div>
    <div v-if="edit == true">
      <input v-model="editValue" type="text">
      <button @click="sendEdit()">done</button>
      <button @click="editChange()">cancel</button>
    </div>
    <img  v-if="props.message.image != null && hold != true" :src="'http://127.0.0.1:3001/image/' + props.message.image" alt="">
  </div>
</template>

<script setup>
import { defineProps , h, ref  } from 'vue';
import storer from '../store';
const props =  defineProps({message:Object , messagerId:Number})
const emits = defineEmits({'remove':Object , 'edit':Object , 'firstLoad':String})
const store = ref(storer())
const popup = ref(false)
const edit = ref(false)
const hold = ref(true)
const editValue = ref('')
function editChange(){
  edit.value = !edit.value
  if(edit.value) {
    editValue.value = ''
  }
}
function remove() {
  emits('remove' , {author:props.message.author , message:props.message.message , id:props.message.id})
}
function sendEdit(){
  emits('edit' , {author:props.message.author  , id:props.message.id , value:editValue.value})
  edit.value = false
}
function popdown(){
  if(popup.value){
  setTimeout(()=> {
    popup.value = false
  } , 1000)}
}
setTimeout(()=>{
  hold.value = false
  emits('firstLoad' , 'first')
} , 100)
</script>

<style>
</style>