<script setup>
import { ref, reactive } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";
import Datepicker from "vue3-datepicker";
import { ko } from "date-fns/locale";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import SearchBar from "@/components/plan_board/item/SearchBar.vue";
const center = { lat: 36.355387, lng: 127.29964 };
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;

let startDate = ref(new Date());
let endDate = ref(new Date());
const locale = ref(ko);
const inputFormat = ref("yyyy-MM-dd");
</script>
<template>
  <input type="text" class="border-0" placeholder="제목..." />
  <hr />
  <SearchBar />

  <GoogleMap
    :api-key="VITE_GOOGLE_MAP_KEY"
    style="width: 50%; height: 500px"
    :center="center"
    :zoom="15"
    ><Marker :options="{ position: center }" />
  </GoogleMap>
  <div>
    <span>시작 날짜</span>
    <Datepicker
      v-model="startDate"
      :locale="locale"
      :weekStartsOn="0"
      :inputFormat="inputFormat"
      :clearable="true"
    />
  </div>
  <div>
    <span>종료 날짜</span>
    <Datepicker
      v-model="endDate"
      :locale="locale"
      :weekStartsOn="0"
      :inputFormat="inputFormat"
      :clearable="true"
    />
  </div>
  <QuillEditor theme="snow" />
</template>
<style scoped></style>
