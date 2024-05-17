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
  <div>
    <input type="text" class="border-0 mb-3" placeholder="제목..." />
    <hr />
    <div class="row mx-3">
      <div class="col-md-4">
        <SearchBar />
        <GoogleMap :api-key="VITE_GOOGLE_MAP_KEY" style="height: 500px" :center="center" :zoom="15">
          <Marker :options="{ position: center }" />
        </GoogleMap>
      </div>
      <div class="col-md-4 d-flex align-items-center flex-column">
        <div class="mb-3">
          <div class="d-flex">
            <div class="mb-3">
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
          </div>
        </div>

        <div class="mt-3">
          <input
            id="search-tag"
            class="form-control"
            type="search"
            placeholder="검색어"
            aria-label="검색어"
          />
        </div>
      </div>

      <div class="col-md-4">
        <QuillEditor theme="snow" />
      </div>
    </div>
  </div>
</template>
<style scoped></style>
