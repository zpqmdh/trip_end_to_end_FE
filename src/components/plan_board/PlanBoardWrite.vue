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
import { decodedTokenFunc } from "@/util/auth";

const local = localAxios();
const router = useRouter();

const center = { lat: 36.355387, lng: 127.29964 };
const zoom = ref(13);
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;

let startDate = ref(new Date());
let endDate = ref(new Date());
let content = ref(null);
const locale = ref(ko);
const inputFormat = ref("yyyy-MM-dd");

const planBoardObject = ref({
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
});

const searchOption = ref({
  sido: 0,
  gugun: 0,
  contentTypeId: 0,
  keyword: "",
});
const thumbnail = ref("");
const mapRef = ref(null);
const locations = ref([]);
const selectedLocation = ref(null); // 선택된 위치 정보를 저장할 ref
const showModal = ref(false); // 모달 표시 여부를 제어할 ref

const insertArticle = async () => {
  planBoardObject.value.planBoard.content = content.value.getHTML();
  planBoardObject.value.planBoard.startDate = format(startDate.value, inputFormat.value);
  planBoardObject.value.planBoard.endDate = format(endDate.value, inputFormat.value);
  console.log(planBoardObject.value);
  const formData = new FormData();
  formData.append(
    "planBoardForm",
    new Blob([JSON.stringify(planBoardObject.value)], {
      type: "application/json",
    })
  );
  formData.append("thumbnail", thumbnail.value);
  local
    .post("/shareplan/insert", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(({ data }) => {
      console.log(data);
    });
};
const getMemberId = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    planBoardObject.value.planBoard.memberId = data.memberId;
  });
};
onMounted(() => {
  getMemberId();
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
            new google.maps.LatLng(parseFloat(location.latitude), parseFloat(location.longitude))
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

const showDetail = (location) => {
  local.get(`/shareplan/map/attractiondescription/${location.contentId}`).then(({ data }) => {
    selectedLocation.value = data;
    selectedLocation.value.title = location.title;
    selectedLocation.value.image = location.firstImage
      ? location.firstImage
      : `https://www.shoshinsha-design.com/wp-content/uploads/2020/05/noimage-760x460.png`;
    selectedLocation.value.addr = location.addr1 + " " + location.addr2;
    console.log(selectedLocation.value);
    showModal.value = true;
  });
};

const getDataFromPlan = () => {
  // TODO: 완료된 여행에서 정보 불러오기
  // FLow
  /*
  1. 로그인한 유저가 작성한 Plan 계획 select로 띄우기
  2. 선택하면 해당 여행 정보 불러와서 date, map에 정보 띄우기
  */
};

const tagName = ref("");
const tagResults = ref([]);
const searchTag = () => {
  if (tagName.value.length == 0 || tagName == null) {
    tagResults.value = null;
    return;
  }
  local.get(`/shareplan/tag/${tagName.value}`).then(({ data }) => {
    console.log(data);
    tagResults.value = data;
  });
};

const addTag = (tag) => {
  planBoardObject.value.tagList.push(tag);
};
const removeTag = (tag) => {
  const index = planBoardObject.value.tagList.findIndex((t) => t.tagTypeId === tag.tagTypeId);
  if (index !== -1) {
    planBoardObject.value.tagList.splice(index, 1);
  }
};

// 파일 선택 시 이벤트 핸들러
const onThumbnailChange = (event) => {
  const file = event.target.files[0];
  thumbnail.value = file;
};
</script>
<template>
  <div>
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8">
          <input
            id="subject"
            v-model="planBoardObject.planBoard.subject"
            class="form-control"
            type="text"
            placeholder="제목 ..."
            required
          />
        </div>
      </div>
    </div>
    <hr />
    <div class="row mx-5">
      <!-- search bar start -->
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
        <button id="btn-search" class="btn btn-outline-success" type="button" @click="search">
          검색
        </button>
      </form>
      <!-- Section 1 -->
      <!-- Map -->
      <div class="col-md-6 my-5">
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
            @click="showDetail(location)"
          />
        </GoogleMap>
      </div>
      <!-- Section 2 -->
      <div class="col-md-6">
        <!-- Thumbnail -->
        <input type="file" id="thumbnailInput" @change="onThumbnailChange" />
        <!-- Date -->
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
        <!-- The Number Of Members-->
        <div>
          <label>동행인 수 </label>
          <input
            v-model="planBoardObject.planBoard.theNumberOfMembers"
            class="form-control"
            type="search"
            placeholder="1"
          />
        </div>
        <div>
          <QuillEditor theme="snow" ref="content" />
        </div>
        <!-- 여행 (plan) 에서 가져오기 -->
        <button @click="getDataFromPlan" type="submit">여행에서 불러오기</button>
        <!-- tag 검색하기 -->
        <div class="mt-3">
          <input
            id="search-tag"
            type="text"
            class="form-control"
            style="width: 50%; text-align: center"
            placeholder="Tag"
            v-model="tagName"
            @input.prevent="searchTag"
          />
          <div class="text-center mb-4">
            <div v-for="tag in tagResults" :key="tag.tagTypeId" class="d-inline-block">
              <button class="btn btn-outline-secondary m-1" @click="addTag(tag)">
                {{ tag.name }} <i class="bi bi-x" @click="removeTag(tag)"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Selected Tags -->
        <div>
          <div
            v-for="selectedTag in planBoardObject.tagList"
            :key="selectedTag.tagTypeId"
            class="d-inline-block"
          >
            <button class="btn btn-outline-secondary m-1" @click="removeTag(selectedTag)">
              {{ selectedTag.name }}
            </button>
          </div>
        </div>
        <!-- Insert Article Button -->
        <div class="mt-3">
          <button @click="insertArticle" type="submit">테스트</button>
        </div>
      </div>
    </div>

    <!-- Attraction Description Modal -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedLocation.title }}</h5>
          </div>
          <div class="modal-body">
            <img :src="selectedLocation.image" />
            <p>주소 : {{ selectedLocation.addr }}</p>
            <p>{{ selectedLocation.overview }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">닫기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
#title {
  margin: 35px 0px;
}
.modal-backdrop {
  position: relative;
  top: 0;
  left: 0;
  z-index: 1040;
  background-color: #000;
  opacity: 0.5;
}

.modal.show.d-block {
  display: block;
}

.modal-body img {
  display: block;
  margin: 0 auto;
  max-width: 80%;
  height: auto;
}
</style>
