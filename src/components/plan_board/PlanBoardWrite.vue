<script setup>
import { ref, onMounted, watch } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";
import Datepicker from "vue3-datepicker";
import { ko } from "date-fns/locale";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { format } from "date-fns";
import { localAxios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";

const local = localAxios();
const router = useRouter();

const center = { lat: 36.355387, lng: 127.29964 };
const zoom = ref(13);
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;

let startDate = ref(new Date());
let endDate = ref(new Date());
let content = ref(null);
let subject = ref(null);
let theNumberOfMembers = ref(null);
const locale = ref(ko);
const inputFormat = ref("yyyy-MM-dd");

const planBoardObject = {
  planBoard: {
    memberId: "",
    subject: "",
    content: "",
    startDate: startDate.value,
    endDate: endDate.value,
    theNumberOfMembers: "",
    thumbnail: "",
  },
  tagList: [],
};

const searchOption = ref({
  sido: 0,
  gugun: 0,
  contentTypeId: 0,
  keyword: "",
});

const mapRef = ref(null);
const locations = ref([]);

const testasdf = () => {
  planBoardObject.planBoard.memberId = "1";
  planBoardObject.planBoard.subject = subject.value;
  planBoardObject.planBoard.content = content.value.getHTML();
  planBoardObject.planBoard.startDate = format(
    startDate.value,
    inputFormat.value
  );
  planBoardObject.planBoard.endDate = format(endDate.value, inputFormat.value);
  planBoardObject.planBoard.theNumberOfMembers = "3";
  local.post("/shareplan/insert", planBoardObject).then(({ data }) => {
    console.log(data);
    router.push({ name: "share-plan-list" });
  });
};

onMounted(() => {
  local.get("/shareplan/map/sido").then(({ data }) => {
    makeOption(data);
  });
  watch(
    () => mapRef.value.ready,
    (isReady) => {
      if (!isReady) return;
      const gmap = mapRef.value.map;

      watch(locations, (newLocations) => {
        if (newLocations.length === 0) return;

        const bounds = new google.maps.LatLngBounds();

        newLocations.forEach((location) => {
          bounds.extend(
            new google.maps.LatLng(
              parseFloat(location.latitude),
              parseFloat(location.longitude)
            )
          );
        });

        gmap.fitBounds(bounds);
      });
    }
  );
});

const makeOption = (data) => {
  let areas = data.sidoList;
  let sel = document.getElementById("search-area");
  areas.forEach((area) => {
    let opt = document.createElement("option");
    opt.setAttribute("value", area.sidoCode);
    opt.appendChild(document.createTextNode(area.sidoName));
    sel.appendChild(opt);
  });
};

const getGugun = (sidoCode) => {
  const url = `/shareplan/map/gugun/${sidoCode}`;
  local.get(url).then(({ data }) => {
    makeGugunOption(data);
  });
};

const makeGugunOption = (data) => {
  let guguns = data.gugunList;
  let sel = document.getElementById("search-gugun");
  sel.innerHTML = `<option value="0" selected>구군 선택</option>`;
  guguns.forEach((gugun) => {
    let opt = document.createElement("option");
    opt.setAttribute("value", gugun.gugunCode);
    opt.appendChild(document.createTextNode(gugun.gugunName));
    sel.appendChild(opt);
  });
};

const search = () => {
  const areaCode = searchOption.value.sido;
  const gugunCode = searchOption.value.gugun;
  const contentTypeId = searchOption.value.contentTypeId;
  const keyword = searchOption.value.keyword;

  let queryString = "";
  if (areaCode != 0) queryString += `&areaCode=${areaCode}`;
  if (gugunCode != 0) queryString += `&gugunCode=${gugunCode}`;
  if (contentTypeId != 0) queryString += `&contentTypeId=${contentTypeId}`;
  if (keyword.trim() != "") queryString += `&keyword=${keyword}`;

  local.get("/shareplan/map/attractioninfo?" + queryString).then(({ data }) => {
    locations.value = data.attractionInfoList;
  });
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
      <!-- search bar start-->
      <form class="d-flex my-5 mx-5" role="search">
        <select
          id="search-area"
          class="form-select me-2"
          name="sidoCode"
          v-model="searchOption.sido"
          @change="getGugun(searchOption.sido)"
        >
          <option value="0" selected>검색 할 지역 선택</option>
        </select>
        <select
          id="search-gugun"
          class="form-select me-2"
          name="gugunCode"
          v-model="searchOption.gugun"
        >
          <option value="0" selected>구군 선택</option>
        </select>
        <select
          id="search-content-id"
          class="form-select me-2"
          v-model="searchOption.contentTypeId"
        >
          <option value="0" selected>관광지 유형</option>
          <option value="12">관광지</option>
          <option value="14">문화시설</option>
          <option value="15">축제공연행사</option>
          <option value="25">여행코스</option>
          <option value="28">레포츠</option>
          <option value="32">숙박</option>
          <option value="38">쇼핑</option>
          <option value="39">음식점</option>
        </select>
        <input
          id="search-keyword"
          class="form-control me-2"
          type="search"
          placeholder="검색어"
          aria-label="검색어"
          v-model="searchOption.keyword"
        />
        <button
          id="btn-search"
          class="btn btn-outline-success"
          type="button"
          @click="search"
        >
          검색
        </button>
      </form>
      <!-- search bar end-->
      <div class="col-md-6">
        <GoogleMap
          ref="mapRef"
          :api-key="VITE_GOOGLE_MAP_KEY"
          style="height: 500px"
          :center="center"
          :zoom="zoom"
        >
          <Marker
            v-for="location in locations"
            :options="{
              position: {
                lat: parseFloat(location.latitude),
                lng: parseFloat(location.longitude),
              },
            }"
            :key="location.contentId"
          />
        </GoogleMap>
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
      </div>
      <div class="col-md-6">
        <div>
          <QuillEditor theme="snow" ref="content" />
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
    </div>
    <button @click="testasdf" type="submit">테스트</button>
  </div>
</template>
<style scoped>
#title {
  margin: 35px 0px;
}
</style>
