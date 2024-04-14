<template>
  <div class="chat-slider">
    <nav class="chat-slider-nav">
      <p :class="{'chat-slider-choose':true , 'curent':tab == 'options'}" @click="tab = 'options'">options</p>
      <p :class="{'chat-slider-choose':true , 'curent':tab == 'media'}" @click="tab = 'media'">media</p>
    </nav>
    <div class="chat-slider-body options" v-if="tab == 'options'">
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
          
        </form>
      </div>
      <button @click="leave()">выйти с чата</button>
    </div>
    <div class="chat-slider-body media" v-if="tab == 'media'">
      <div v-if="media.length == 0">there no media</div>
      <img v-for="one of media" :src="'http://127.0.0.1:3001/image/' + one.image" alt="">
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
const tab = ref('options')
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
      ).style.transform = `translateX(102% )`;
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
  emit('leave' , {messagerId:props.curentMessage.id, whoOut:store.value.accaunt.path })
}
const hasBeenBan = computed(()=>{
  if(props.curentMessage != null){
    return props.curentMessage?.blackList?.find(el => el == store.value.accaunt.path) != undefined
  }
})
watch(()=> hasBeenBan.value , ()=>{
  if(hasBeenBan.value) {
    leave()
  }
} , {deep:true})
const media = computed(()=>{
  let arr = []
  arr = props.curentMessage?.messages.filter((el)=> el?.image != undefined)
  return [...new Set(arr)] 
})
</script>

