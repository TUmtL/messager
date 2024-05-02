<template>
  <div class="accaunt">
    <div class="top">
      <div @click="accauntView[0].author = store.accaunt.path" class="top__left">
        <h1 class="accaunt-name">{{ store.accaunt.name }}</h1>
        <h2 class="accaunt-href">href:/ {{ store.accaunt.path }}</h2>
      </div>
      <div class="top__right">
        <chatFinder :socket="socket"></chatFinder>
      </div>
    </div>
    <div class="bottom">
      <div class="bottom__left">
        <accauntSlider :accaunt="accauntView"></accauntSlider>
        <div class="messager-list">
          <div
            @click="
              () => {
                path = one.path;
                messageMultiplaer = 1;
                scrollDown();
              }
            "
            v-for="one of messages"
            :key="one.id"
          >
            {{ one.name }}
          </div>
        </div>
      </div>
      <div class="bottom__right">
        <p
          class="messager-name"
          @click="chatSliderStatus[0] = !chatSliderStatus[0]"
        >
          {{ curentMessage?.path }}
        </p>
        <chatSlider
          @leave="(res) => leave(res)"
          :socket="socket"
          :curentMessage="curentMessage"
          :active="chatSliderStatus"
        ></chatSlider>
        <div class="messager">
          <div class="detecter"></div>
          <messageOne
            @remove="(e) => remove(e)"
            @edit="(e) => edit(e)"
            @firstLoad="(e) => (messageMultiplaer == 1 ? scrollDown() : null)"
            @accauntTaker="(e) => (accauntView[0] = e  , console.log(e))"
            :class="{
              'my-message': one.author == store.accaunt.path,
              'server-message': one.author == 'server',
              midle: curentMessage?.messages[i - 1]?.author == one?.author,
            }"
            v-for="(one, i) of curentMessage?.messages"
            :key="one?.id"
            :messagerId="curentMessage.id"
            :message="one"
            class="message-one"
          ></messageOne>
        </div>
        <img class="img-preview" :src="imagePath" alt="" />
        <form
          v-if="canWrite && curentMessage.id != undefined"
          @submit.prevent
          action
          class="messager-form"
        >
          <input v-model="message" type="text" class="messager-input" />
          <label class="input-img"
            ><input
              @input="(e) => takeImg(e)"
              type="file"
              accept="image/png , image/gif , image/jpg , image/webp , image/jpeg"
              name=""
              id=""
            />
            <p>добавить фото</p></label
          >
          <button  :disabled="holder" @click="sendMessage() , holder = true">отправить сообщение</button>
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
socket.on("test", (res) => console.log(res));
const store = ref(storeR());
const accaunt = ref({});
const message = ref("");
const path = ref("");
const messages = ref([]);
const chatSliderStatus = ref([false]);
const accauntView = ref([{author:''}])
const messageMultiplaer = ref(1);
const image = ref("");
const holder = ref(false)
function takeImg(e) {
  // images.value = e.targer.file
  console.log(e.target.files);
  image.value = e.target.files[0];
}
const imagePath = computed(() => {
  if (image.value != []) {
    return URL.createObjectURL(image.value);
  }
});
const messagerObserver = new IntersectionObserver(
  (entries, messagerObserver) => {
    entries.forEach((el) => {
      el.isIntersecting == true ? (messageMultiplaer.value += 1) : null;
      let scrollingTo = 0;
      document.querySelectorAll(".message-body").forEach((el, i) => {
        if (i < 31) {
          scrollingTo += el.getBoundingClientRect().height;
        }
      });
      const origin = messages.value.find(
        (el) => el.id == curentMessage.value.id
      );
        document.querySelector(".messager").scrollBy(0, 1);
    });
  },
  {
    root: document.querySelector(".messager"),
    rootMargin: "10px 0px 0px 0px",
  }
);

function remove(e) {
  socket.emit("remove/message", {
    ...e,
    messagerId: curentMessage.value.id,
    whoRemove: store.value.accaunt.path,
  });
}
function leave(e) {
  console.log(e);
  fetch("http://127.0.0.1:3001/leave", {
    method: "PUT",
    body: JSON.stringify(e),
    headers: {
      "Content-Type": "application/json",
    },
  });
  socket.removeAllListeners(`messagers/${e.messagerId}`);
  messages.value = messages.value.filter((el) => el.id != e.messagerId);
  store.value.accaunt.messagesIDList =
    store.value.accaunt.messagesIDList.filter((el) => el != e.messagerId);
  localStorage.setItem("accaunt", JSON.stringify(store.value.accaunt));
  chatSliderStatus.value[0] = false;
  // console.log(store.value.accaunt.messagesIDList)
}
function edit(e) {
  const body = {
    ...e,
    messagerId: curentMessage.value.id,
    whoEdit: store.value.accaunt.path,
  };
  socket.emit("message/edit", body);
}
console.log(
  `${store.value.ref}${useRoute().params.name}/${useRoute().params.id}`
);
const canWrite = computed(() => {
  if (curentMessage.value?.adminsWriteOnly) {
    if (curentMessage.value.localAdmin.find((el) => el == store.value.accaunt.path) != null ||store.value?.accaunt?.status == "admin") {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
});
const curentMessage = computed(() => {
  const some = messages.value.find((el) => el.path == path.value);
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
    adminsWriteOnly: some?.adminsWriteOnly,
    blackList: some?.blackList,
  };
});
function scrollDown() {
  setTimeout(
    () =>
      document
        .querySelector(".messager")
        .scrollTo(0, document.querySelector(".messager").scrollHeight + 19999),
    10
  );
}
async function sendMessage() {
  if (message.value.trim() != "" || image.value != "") {
    let maxId = 0;
    curentMessage.value.messages.forEach((el) => {
      if (el.id > maxId) maxId = el.id;
    });
    console.log("send", maxId);
    if (image.value != "") {
      socket.emit(`messagers/send/${curentMessage.value.id}`, {
        author: store.value.accaunt.path,
        message: message.value,
        id: maxId + 1,
        image: image.value.name.split(" ").join("-"),
      });
      const file = new FormData();

      file.set("file", image.value);
      fetch("http://127.0.0.1:3001/upload", {
        method: "POST",
        body: file,
        headers: {
          ContentType: "text/plain; charset=UTF-8",
        },
      });
    } else {
      socket.emit(`messagers/send/${curentMessage.value.id}`, {
        author: store.value.accaunt.path,
        message: message.value,
        id: maxId + 1,
      });
    }
    scrollDown();
    message.value = "";
    image.value = "";
  }
}
store.value.testAcc();
store.value.accaunt?.messagesIDList.forEach((el) => {
  socket.on(`messagers/${el}`, (res) => {
    const one = messages.value.find((el) => el.id == res.id);
    if (one != null) {
      one.localAdmin = res.localAdmin;
      one.whiteList = res.whiteList;
      one.whiteListCollection = res.whiteListCollection;
      one.adminsWriteOnly = res.adminsWriteOnly;
      one.messages = res.messages;
      one.blackList = res.blackList;
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
    store.value.accaunt?.messagesIDList.forEach((el) => {
      socket.on(`messagers/${el}`, (res) => {
        const one = messages.value.find((el) => el.id == res.id);
        if (one != null) {
          one.localAdmin = res.localAdmin;
          one.whiteList = res.whiteList;
          one.whiteListCollection = res.whiteListCollection;
          one.adminsWriteOnly = res.adminsWriteOnly;
          one.messages = res.messages;
          one.blackList = res.blackList;
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
watch(
  () => curentMessage.value.id,
  () => {
    messagerObserver.observe(document.querySelector(".detecter"));
  }
);
watch(
  () => holder.value,
  ()=>{
    if(holder.value == true) {
      setTimeout(()=>holder.value = false , 1000)
    }
  }
)
</script>
 