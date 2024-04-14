<template>
  <!-- <button @click="store.testAcc()"></button> -->
  <div class="container">
    <router-view></router-view>
    
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import storer from "./store";
const store = ref(storer());
const route = ref(useRoute());

function test() {
  console.log(store.value.accaunt);
}
</script>

<style>
</style>