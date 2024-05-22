<script setup>
import { ref, onMounted, watch } from "vue";
import { GoogleMap, Marker, Polyline } from "vue3-google-map";
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

const mapRef = ref(null);
const center = { lat: 36.355387, lng: 127.29964 };
const zoom = ref(13);
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;

// 여행 계획에서 데이터 불러왔는지 : 필수 !
const getDataBoolean = ref(false);

// 여행 공유 게시글 정조
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

// 상세 여행 계획 정보
const planInfo = ref({});
const planDto = ref({});
const scheduleDates = ref([]);
const planLocations = ref([]);

// 지도에 표시할 여행 계획 정보
const markerLocations = ref([]);
const polylineColors = ["#0a296d", "#742405", "#97654c", "#054b2a", "#812f00"];
import redMarkerImage from "@/assets/img/marker-red.png";
import blueMarkerImage from "@/assets/img/marker-sky.png";
import greenMarkerImage from "@/assets/img/marker-green.png";
import orangeMarkerImage from "@/assets/img/marker-orange.png";
import yellowMarkerImage from "@/assets/img/marker-yellow.png";
const markerImages = [
  blueMarkerImage,
  redMarkerImage,
  yellowMarkerImage,
  greenMarkerImage,
  orangeMarkerImage,
];
const getMarkerIcon = (index1) => {
  return {
    url: markerImages[index1 % markerImages.length], // 이미지 경로
    scaledSize: new google.maps.Size(30, 45), // 아이콘 크기 조절
    labelOrigin: new google.maps.Point(15, 14), // 라벨 위치 조정 (x, y)
  };
};

// 유저가 작성할 수 있는 여행 리스트와 선택된 것
const plans = ref([]);
const selectedPlan = ref("");
const showPlan = ref(false);

const loginedId = ref("");
const thumbnail = ref("");

const insertArticle = async () => {
  planBoardObject.value.planBoard.content = content.value.getHTML();
  planBoardObject.value.planBoard.startDate = format(
    startDate.value,
    inputFormat.value
  );
  planBoardObject.value.planBoard.endDate = format(
    endDate.value,
    inputFormat.value
  );
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
  watch(
    () => mapRef.value.ready,
    (isReady) => {
      if (!isReady) return;
    }
  );
});

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
    console.log(data);
    getDataBoolean.value = true;
    planInfo.value = data;
    planDto.value = {
      planId: planInfo.value.planDto.planId,
      memberId: planInfo.value.planDto.memberId,
      title: planInfo.value.planDto.title,
      startDate: planInfo.value.planDto.startDate,
      endDate: planInfo.value.planDto.endDate,
    };
    startDate.value = new Date(planInfo.value.planDto.startDate);
    endDate.value = new Date(planInfo.value.planDto.endDate);
    planBoardObject.value.planBoard.theNumberOfMembers =
      planInfo.value.memberIds.length;
    scheduleDates.value = planInfo.value.scheduleDates.map((date) => ({
      ...date,
      expanded: false,
    }));
    planLocations.value = planInfo.value.planLocations;
    getMarkerLocations();
  });
};
const getMarkerLocations = () => {
  markerLocations.value = planLocations.value.map(() => []); // planLocations와 같은 구조로 초기화
  planLocations.value.forEach((scheduleDate, index) => {
    const path = scheduleDate
      .map((location) => {
        if (location.latitude && location.longitude) {
          return {
            lat: parseFloat(location.latitude),
            lng: parseFloat(location.longitude),
          };
        }
      })
      .filter(Boolean); // 필터링하여 유효한 좌표만 포함
    markerLocations.value[index] = path;
  });
  console.log(markerLocations.value);
  console.log(planLocations.value);
};
const printMarkerLocations = (index) => {
  return markerLocations.value[index];
};
const toggleAccordion = (index) => {
  scheduleDates.value[index].expanded = !scheduleDates.value[index].expanded;
};
const toggleAll = (expand) => {
  scheduleDates.value.forEach((schedule) => {
    schedule.expanded = expand;
  });
};
watch(selectedPlan, (newPlanId) => {
  getPlanDetail(newPlanId);
});

// Tag
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
  const exists = planBoardObject.value.tagList.some(
    (t) => t.tagTypeId === tag.tagTypeId
  );
  if (!exists) {
    planBoardObject.value.tagList.push(tag);
  }
};
const removeTag = (tag) => {
  const index = planBoardObject.value.tagList.findIndex(
    (t) => t.tagTypeId === tag.tagTypeId
  );
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
      <!-- Map and Details -->
      <div class="row my-5">
        <!-- Map Section -->
        <div class="col-md-6 mb-4">
          <GoogleMap
            ref="mapRef"
            :api-key="VITE_GOOGLE_MAP_KEY"
            style="height: 1000px; width: 600px"
            :center="center"
            :zoom="zoom"
          >
            <div v-for="(scheduleDate, index1) in planLocations" :key="index1">
              <Polyline
                :options="{
                  path: printMarkerLocations(index1),
                  geodesic: true,
                  strokeColor: polylineColors[index1],
                  strokeOpacity: 1.0,
                  strokeWeight: 5,
                }"
              />
              <Marker
                v-for="(attraction, index2) in scheduleDate"
                :key="`${attraction.planScheduleId}-${index1}`"
                :options="{
                  position: {
                    lat: parseFloat(planLocations[index1][index2].latitude),
                    lng: parseFloat(planLocations[index1][index2].longitude),
                  },
                  icon: getMarkerIcon(index1),
                  label: {
                    text: `${index2 + 1}`,
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: '20px',
                  },
                  zIndex: 9999,
                }"
                @click="toggleAccordion(index1)"
              />
            </div>
          </GoogleMap>
        </div>
        <!-- Details Section -->
        <div class="col-md-6">
          <!-- Thumbnail -->
          <div class="mb-3">
            <label for="thumbnailInput" class="form-label"
              >🖼️ 대표 사진 지정하기</label
            >
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
                :disabled="getDataBoolean"
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
                :disabled="getDataBoolean"
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
              :disabled="getDataBoolean"
            />
          </div>
          <!-- Write Content -->
          <div class="mb-3">
            <QuillEditor toolbar="essential" theme="snow" ref="content" />
          </div>
          <!-- 여행 (plan) 에서 가져오기 -->
          <div class="mb-3">
            <button
              id="btn-get"
              @click="getDataListPlan"
              type="submit"
              class="btn w-100"
            >
              여행에서 불러오기
            </button>
            <select
              class="form-select mt-2"
              v-if="plans.length > 0 && showPlan"
              v-model="selectedPlan"
            >
              <option value="" disabled selected>여행을 선택하세요</option>
              <option
                v-for="plan in plans"
                :key="plan.planId"
                :value="plan.planId"
              >
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
            <div
              v-for="tag in tagResults"
              :key="tag.tagTypeId"
              class="d-inline-block"
            >
              <button
                class="btn btn-outline-secondary m-1"
                @click="addTag(tag)"
              >
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
              <button
                class="btn btn-outline-secondary m-1"
                @click="removeTag(selectedTag)"
              >
                {{ selectedTag.name }}
              </button>
            </div>
          </div>
          <!-- Insert Article Button -->
          <div class="text-center">
            <button
              id="btn-insert"
              @click="insertArticle"
              type="submit"
              class="btn w-100"
            >
              등록
            </button>
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
