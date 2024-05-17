<script setup>
import { ref, reactive } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";
import Datepicker from "vue3-datepicker";
import { ko } from "date-fns/locale";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import SearchBar from "@/components/plan_board/item/SearchBar.vue";
import { format } from "date-fns";

const center = { lat: 36.355387, lng: 127.29964 };
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;

let startDate = ref(new Date());
let endDate = ref(new Date());
let content = ref(null);
let subject = ref(null);

const locale = ref(ko);
const inputFormat = ref("yyyy-MM-dd");

const planBoardObject = {
  memberId: "",
  subject: "",
  content: "",
  startDate: startDate.value,
  endDate: endDate.value,
  theNumberOfMembers: "",
  thumbnail: "",
};

const testasdf = () => {
  planBoardObject.subject = subject.value;
  planBoardObject.content = content.value.getHTML();
  planBoardObject.startDate = format(startDate.value, inputFormat.value);
  planBoardObject.endDate = format(endDate.value, inputFormat.value);

  console.log(planBoardObject);
};
</script>
<template>
  <div>
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8">
          <input
            id="title"
            v-model="subject"
            class="form-control"
            type="text"
            placeholder="제목 ..."
          />
        </div>
      </div>
    </div>
    <hr />
    <div class="row mx-5">
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
        <QuillEditor theme="snow" ref="content" />
      </div>
    </div>

    <button @click="testasdf" type="submit">테스트</button>
  </div>
</template>
<style scoped>
#title {
  margin: 35px 0px;
}
</style>
