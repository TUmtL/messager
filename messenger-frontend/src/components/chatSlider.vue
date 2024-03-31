<template>
  <div class="chat-slider">
    options
    <p>whiteList: {{ props.curentMessage.whiteList }}</p>
    <p>adminsWriteOnly : {{ props.curentMessage.adminsWriteOnly }}</p>
    <div v-if="localStatusCheck" class="options">
      <form @submit.prevent="redact()">
        <p>local admins<input v-model="localAdminRedact" type="text"></p>
        <p>заполняйте по форме 'имя/айди,имя/айди'</p>
        <p>white list<input v-model="whiteListCollectionRedact" type="text"></p>
        <p>black list<input v-model="blackListCollectionRedact" type="text"></p>
        <p>белый лист <input type="checkbox" v-model="props.curentMessage.whiteList"></p>
        <p>пишут только админы <input type="checkbox" v-model="props.curentMessage.adminsWriteOnly"></p>
        <button type="submit">редактировать</button>
        <button @click="leave()">выйти с чата</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, computed } from "vue";
import storer from "../store";
import { useRouter } from "vue-router";
const props = defineProps(["socket", "active", "curentMessage"]);
const emit = defineEmits(['leave'])
const router = useRouter()
const store = ref(storer());
const localAdminRedact = ref("");
const localAdmin = computed(() => {
  return [props.curentMessage.localAdmin];
});
const whiteListCollectionRedact = ref("");
const whiteListCollection = computed(() => {
  return [props.curentMessage.whiteListCollection];
});
const blackListCollectionRedact = ref("")
const blackListCollection = computed(()=>{
  return [props.curentMessage.blackList]
})

watch(
  () => props.active[0],
  () => {
    if (props.active[0] == true) {
      localAdminRedact.value = localAdmin.value.join(' ')
      whiteListCollectionRedact.value = whiteListCollection.value.join(' ')
      blackListCollectionRedact.value = blackListCollection.value.join(' ')
      document.querySelector(
        ".chat-slider"
      ).style.transform = `translateX(0px)`;
    } else {
      document.querySelector(
        ".chat-slider"
      ).style.transform = `translateX(100% )`;
    }
  }
);
const localStatusCheck = computed(() => {
  if (props.curentMessage.id != undefined) {
    const localAdmin = props.curentMessage.localAdmin.find(
      el => el == store.value.accaunt.path
    );
    if (localAdmin != undefined || store.value.accaunt.status == "admin") {
      return true;
    } else false;
  }
});
function redact() {
  props.socket.emit('messager/edit' , {
    localAdmin:localAdminRedact.value.split(','),
    whiteListCollection:whiteListCollectionRedact.value.split(','),
    blackList:blackListCollectionRedact.value.split(','),
    id:props.curentMessage.id,
    whiteList:props.curentMessage.whiteList,
    adminsWriteOnly:props.curentMessage.adminsWriteOnly
  })
  props.active[0] = false
  // router.go(0)
}
function leave(){
  emit('leave' , 'leave')
}
</script>

<style>
.chat-slider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: gray;
  z-index: 3;
  transition: transform 0.3s ease-in-out;
  padding: 20px;
  transform: translateX(100%);
}
</style>