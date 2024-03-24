<template>
  <div class="accaunt">
    <div class="top">
      <div class="top__left">
        <h1 class="accaunt-name">{{ accaunt.name }}</h1>
        <h2 class="accaunt-href">href:/ {{ accaunt.path }}</h2>
      </div>
      <div class="top__right">
        <chatFinder :socket="socket"></chatFinder>
      </div>
    </div>
    <div class="bottom">
      <div class="bottom__left">
        <div class="messager-list">
          <div
            @click="()=>{path = one.path ; scrollDown()}"
            v-for="one of messages"
            :key="one.id"
          >{{ one.name }}</div>
        </div>
      </div>
      <div class="bottom__right">
        <p
          class="messager-name"
          @click="chatSliderStatus[0] = !chatSliderStatus[0]"
        >{{ curentMessage?.path }}</p>
        <chatSlider :socket="socket" :curentMessage="curentMessage" :active="chatSliderStatus"></chatSlider>
        <div class="messager" @scroll="detect()">
          <div class="detecter"></div>
          <messageOne
            @remove="(e)=> remove(e)"
            :class="{'my-message':one.author == store.accaunt.path , 'server-message':one.author == 'server' , 'midle':curentMessage?.messages[i - 1]?.author == one?.author }"
            v-for="(one , i) of curentMessage?.messages"
            :key="one?.id"
            :messagerId="curentMessage.id"
            :message="one"
            class="message-one"
          ></messageOne>
        </div>
        <form v-if="canWrite" @submit.prevent action class="messager-form">
          <input v-model="message" type="text" class="messager-input" />
          <button @click="sendMessage()"></button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import chatFinder from "./chatFinder.vue";
import messageOne from "./message.vue";
import chatSlider from "./chatSlider.vue";
import accauntSlider from "./accauntSlider.vue";
import { computed, ref, watch } from "vue";
import storeR from "../store";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";

const socket = io("127.0.0.1:3001");
socket.on("test", res => console.log(res));

const store = ref(storeR());
const accaunt = ref({});
const message = ref("");
const path = ref("");
const messages = ref([]);
const taker = ref([]);
const chatSliderStatus = ref([false]);
const messageMultiplaer = ref(1);
function detect() {
  const detectorNum = document
    .querySelector(".detecter")
    .getBoundingClientRect().top;
  if (detectorNum >= 0) {
    messageMultiplaer.value += 1;
  }
}
function remove(e) {
  socket.emit("remove/message", {
    ...e,
    messagerId: curentMessage.value.id,
    whoRemove: store.value.accaunt.path
  });
}
console.log(
  `${store.value.ref}${useRoute().params.name}/${useRoute().params.id}`
);
const canWrite = computed(() => {
  if (curentMessage.value?.adminsWriteOnly) {
    if (
      curentMessage.value.localAdmin.find(
        el => el == store.value.accaunt.path
      ) != null ||
      store.value?.accaunt?.status == "admin"
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
});
const curentMessage = computed(() => {
  const some = messages.value.find(el => el.path == path.value);
  const messagesLimiter = [];
  for (let i = 0; i <= 30 * messageMultiplaer.value; i++) {
    if (some?.messages[some?.messages?.length - 1 - i]?.id != undefined) {
      messagesLimiter.unshift(some?.messages[some?.messages?.length - 1 - i]);
    }
  }
  return {
    id: some?.id,
    localAdmin: some?.localAdmin,
    messages: messagesLimiter,
    name: some?.name,
    path: some?.path,
    whiteListCollection: some?.whiteListCollection,
    whiteList: some?.whiteList,
    adminsWriteOnly: some?.adminsWriteOnly
  };
});
function scrollDown() {
  setTimeout(
    () =>
      document
        .querySelector(".messager")
        .scrollTo(0, document.querySelector(".messager").scrollHeight + 1211),
    10
  );
}
async function sendMessage() {
  if (message.value.trim() != "") {
    let maxId = 0;
    curentMessage.value.messages.forEach(el => {
      if (el.id > maxId) maxId = el.id;
    });
    console.log("send", maxId);
    socket.emit(`messagers/send/${curentMessage.value.id}`, {
      author: store.value.accaunt.path,
      message: message.value,
      id: maxId + 1
    });
    scrollDown();
    message.value = "";
  }
}
store.value.testAcc();
store.value.accaunt?.messagesIDList.forEach(el => {
  socket.on(`messagers/${el}`, res => {
    const one = messages.value.find(el => el.id == res.id);
    if (one != null) {
      one.localAdmin = res.localAdmin;
      one.whiteList = res.whiteList;
      one.whiteListCollection = res.whiteListCollection;
      one.adminsWriteOnly = res.adminsWriteOnly;
      one.messages = res.messages;
    } else {
      messages.value.push(res);
    }
    if (messageMultiplaer.value < 4) {
      scrollDown();
    }
    console.log("geted");
  });
});
watch(
  () => store.value.accaunt?.messagesIDList,
  () => {
    store.value.accaunt?.messagesIDList.forEach(el => {
      socket.on(`messagers/${el}`, res => {
        const one = messages.value.find(el => el.id == res.id);
        if (one != null) {
          one.localAdmin = res.localAdmin;
          one.whiteList = res.whiteList;
          one.whiteListCollection = res.whiteListCollection;
          one.adminsWriteOnly = res.adminsWriteOnly;
          one.messages = res.messages;
        } else {
          messages.value.push(res);
        }
        if (messageMultiplaer.value < 4) {
          scrollDown();
        }
        console.log("geted", res);
      });
    });
  }
);
</script>
 