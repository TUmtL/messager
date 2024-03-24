<template>
  <div @mouseleave="popdown()" @click.right.prevent="popup = !popup" class="message-body">
    <div v-if="message.author != 'server'" :class="{'message-popup':popup , 'hide':true}">
      <button @click="editChange()">edit</button>
      <button @click="remove()">remove</button>
    </div>
    <h6 class="author">{{ message.author }}</h6>
    <p class="message">{{ message.message }}</p>
  </div>
</template>

<script setup>
import { defineProps , ref , defineEmits } from 'vue';
const props =  defineProps({message:Object , messagerId:Number})
const emits = defineEmits(['remove'])
const popup = ref(false)
const edit = ref(false)
function editChange(){
  edit.value = !edit.value
}
function remove() {
  emits('remove' , {author:props.message.author , message:props.message.message , id:props.message.id})
}
function popdown(){
  if(popup.value){
  setTimeout(()=> {
    popup.value = false
  } , 1000)}
}
</script>

<style>
</style>