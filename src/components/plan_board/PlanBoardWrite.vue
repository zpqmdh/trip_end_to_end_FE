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
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

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

const loginedId = ref("");
const thumbnail = ref("");

const mapRef = ref(null);
const locations = ref([]);
const selectedLocation = ref(null); // 선택된 위치 정보를 저장할 ref
const showModal = ref(false); // 모달 표시 여부를 제어할 ref

const insertArticle = async () => {
  planBoardObject.value.planBoard.content = content.value.getHTML();
  planBoardObject.value.planBoard.startDate = format(startDate.value, inputFormat.value);
  planBoardObject.value.planBoard.endDate = format(endDate.value, inputFormat.value);
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
      Swal.fire({
        icon: "success",
        text: "여행 공유 게시글이 등록되었습니다.",
      });
    });
  router.replace({ name: "share-plan-list" });
};

const getMemberId = () => {
  const logined = decodedTokenFunc();
  loginedId.value = logined;
  local.get(`/members/detail/${loginedId.value}`).then(({ data }) => {
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

const plans = ref([]);
const selectedPlan = ref("");

const planObject = ref({});
const showPlan = ref(false);

const getDataListPlan = () => {
  local.get(`/plans/list/all/${loginedId.value}`).then(({ data }) => {
    addPlanByCheckingDate(data);
    showPlan.value = !showPlan.value;
  });
};
const addPlanByCheckingDate = (data) => {
  let today = new Date();
  let year = today.getFullYear();
  let month = ("0" + (today.getMonth() + 1)).slice(-2);
  let day = ("0" + today.getDate()).slice(-2);

  let dateString = `${year}-${month}-${day}`;
  const todayDate = new Date(dateString);
  plans.value = [];
  data.forEach((plan) => {
    if (new Date(plan.endDate) < todayDate) {
      plans.value.push(plan);
    }
  });
};
const getPlanDetail = (planId) => {
  local.get(`/plans/detail/${planId}`).then(({ data }) => {
    planObject.value = data;
    startDate.value = new Date(planObject.value.planDto.startDate);
    endDate.value = new Date(planObject.value.planDto.endDate);
    planBoardObject.value.planBoard.theNumberOfMembers = planObject.value.memberIds.length;
  });
};

watch(selectedPlan, (newPlanId) => {
  getPlanDetail(newPlanId);
});
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
  const exists = planBoardObject.value.tagList.some((t) => t.tagTypeId === tag.tagTypeId);
  if (!exists) {
    planBoardObject.value.tagList.push(tag);
  }
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
      <div class="row justify-content-center my-4">
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
    <div class="container">
      <!-- Search bar start -->
      <form class="d-flex my-4 mx-5" role="search">
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
        <button id="btn-search" class="btn" type="button" @click="search">검색</button>
      </form>
      <!-- Map and Details -->
      <div class="row my-5">
        <!-- Map Section -->
        <div class="col-md-6 mb-4">
          <GoogleMap
            ref="mapRef"
            :api-key="VITE_GOOGLE_MAP_KEY"
            style="height: 800px"
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
        <!-- Details Section -->
        <div class="col-md-6">
          <!-- Thumbnail -->
          <div class="mb-3">
            <label for="thumbnailInput" class="form-label">🖼️ 대표 사진 지정하기</label>
            <input
              class="form-control"
              type="file"
              id="thumbnailInput"
              @change="onThumbnailChange"
            />
          </div>
          <!-- Date -->
          <div class="mb-3 d-flex justify-content-around">
            <div>
              <span>🗓️ 시작 날짜</span>
              <Datepicker
                v-model="startDate"
                :locale="locale"
                :weekStartsOn="0"
                :inputFormat="inputFormat"
                :clearable="true"
                class="form-control"
              />
            </div>
            <div>
              <span>🗓️ 종료 날짜</span>
              <Datepicker
                v-model="endDate"
                :locale="locale"
                :weekStartsOn="0"
                :inputFormat="inputFormat"
                :clearable="true"
                class="form-control"
              />
            </div>
          </div>
          <!-- The Number Of Members -->
          <div class="mb-3">
            <label>👥 동행인 수</label>
            <input
              v-model="planBoardObject.planBoard.theNumberOfMembers"
              class="form-control"
              type="number"
              min="1"
              placeholder="1"
            />
          </div>
          <!-- Write Content -->
          <div class="mb-3">
            <QuillEditor toolbar="essential" theme="snow" ref="content" />
          </div>
          <!-- 여행 (plan) 에서 가져오기 -->
          <div class="mb-3">
            <button id="btn-get" @click="getDataListPlan" type="submit" class="btn w-100">
              여행에서 불러오기
            </button>
            <select
              class="form-select mt-2"
              v-if="plans.length > 0 && showPlan"
              v-model="selectedPlan"
            >
              <option value="" disabled selected>여행을 선택하세요</option>
              <option v-for="plan in plans" :key="plan.planId" :value="plan.planId">
                {{ plan.title }} | 기간: {{ plan.startDate }} -
                {{ plan.endDate }}
              </option>
            </select>
          </div>
          <!-- Tag 검색하기 -->
          <div class="mb-3">
            <input
              id="search-tag"
              type="text"
              class="form-control"
              placeholder="Tag"
              v-model="tagName"
              @input.prevent="searchTag"
            />
          </div>
          <div class="text-center mb-4">
            <div v-for="tag in tagResults" :key="tag.tagTypeId" class="d-inline-block">
              <button class="btn btn-outline-secondary m-1" @click="addTag(tag)">
                {{ tag.name }} <i class="bi bi-x" @click="removeTag(tag)"></i>
              </button>
            </div>
          </div>
          <!-- Selected Tags -->
          <div class="mb-3">
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
          <div class="text-center">
            <button id="btn-insert" @click="insertArticle" type="submit" class="btn w-100">
              등록
            </button>
          </div>
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
            <img :src="selectedLocation.image" class="img-fluid" />
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
#btn-search {
  background-color: white;
  border-color: #5698ad;
  color: #5698ad;
}
#btn-search:hover {
  background-color: #5698ad;
  color: white;
}

#btn-get {
  border-color: #97654c;
  color: #97654c;
}
#btn-get:hover {
  background-color: #97654c;
  color: white;
}

#btn-insert {
  background-color: #5698ad;
  border-color: white;
  color: white;
}
#btn-insert:hover {
  background-color: white;
  border-color: #5698ad;
  color: #5698ad;
}

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

.ql-container {
  width: 800px !important;
  height: 500px;
}
</style>
