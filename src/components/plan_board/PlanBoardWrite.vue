<script setup>
import { ref, onMounted, watch } from "vue";
import { GoogleMap, Marker, Polyline } from "vue3-google-map";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { localAxios } from "@/util/http-commons.js";
import { useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2";

const local = localAxios();
const router = useRouter();

const mapRef = ref(null);
const center = { lat: 36.35538, lng: 127.8 };
const zoom = ref(8);
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;

// 여행 계획에서 데이터 불러왔는지 : 필수 !
const getDataBoolean = ref(false);

// 여행 공유 게시글 정조
let startDate = ref(new Date());
let endDate = ref(new Date());
let content = ref(null);
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
  planBoardObject.value.planBoard.planId = planDto.value.planId;
  planBoardObject.value.planBoard.startDate = planDto.value.startDate;
  planBoardObject.value.planBoard.endDate = planDto.value.endDate;
  if (planBoardObject.value.tagList.length > 3) {
    Swal.fire({
      icon: "error",
      text: "게시글 당 태그는 최대 3개까지 등록할 수 있습니다.",
    });
    return;
  }
  if (!getDataBoolean.value) {
    Swal.fire({
      icon: "error",
      text: "여행 계획에서 정보를 불러와주세요.",
    });
    return;
  }
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
  router.push({ name: "share-plan-list" });
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
      const gmap = mapRef.value.map;
      watch(markerLocations, (newLocations) => {
        if (newLocations.length === 0) return;
        const bounds = new google.maps.LatLngBounds();
        newLocations.forEach((dayLocation) => {
          // 일자별
          dayLocation.forEach((location) => {
            bounds.extend(
              new google.maps.LatLng(
                parseFloat(location.lat),
                parseFloat(location.lng)
              )
            );
          });
        });
        gmap.fitBounds(bounds);
      });
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
      expanded: true,
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
const beforeEnter = (el) => {
  el.style.height = "0";
  el.style.opacity = "0";
};
const enter = (el, done) => {
  el.style.height = el.scrollHeight + "px";
  el.style.opacity = "1";
  el.style.transition = "height 0.5s ease, opacity 0.5s ease";
  el.addEventListener("transitionend", done);
};
const leave = (el, done) => {
  el.style.height = el.scrollHeight + "px";
  el.style.opacity = "1";
  requestAnimationFrame(() => {
    el.style.height = "0";
    el.style.opacity = "0";
    el.style.transition = "height 0.5s ease, opacity 0.5s ease";
  });
  el.addEventListener("transitionend", done);
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
    tagResults.value = data;
  });
};
const addTag = (tag) => {
  const exists = planBoardObject.value.tagList.some(
    (t) => t.tagTypeId === tag.tagTypeId
  );
  if (!exists) {
    if (planBoardObject.value.tagList.length >= 3) {
      Swal.fire({
        icon: "warning",
        text: "게시글 당 태그는 최대 3개까지 등록할 수 있습니다.",
      });
      return;
    }
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
    <div>
      <!-- Map and Details -->
      <div class="row my-5 d-flex justify-content-between">
        <!-- Map Section -->
        <div class="col-md-4" style="margin-left: 20px">
          <GoogleMap
            ref="mapRef"
            :api-key="VITE_GOOGLE_MAP_KEY"
            style="height: 1000px; width: 100%"
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
        <!-- Plan Details Section -->
        <div class="col-md-3">
          <!-- Date -->
          <div class="date-section">
            <label>📆 여행 기간</label>
            <div class="date-inputs">
              <input
                type="date"
                v-model="planDto.startDate"
                :disabled="getDataBoolean"
              />
              <span class="mt-2">~</span>
              <input
                type="date"
                v-model="planDto.endDate"
                :min="planDto.startDate"
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
            <!-- 여행 세부 일정 -->
            <div class="schedule-section">
              <label>🕘 여행 일정</label>
              <button @click="toggleAll(true)" class="btn btn-light">
                모두 열기
              </button>
              <button @click="toggleAll(false)" class="btn btn-light">
                모두 닫기
              </button>
              <div
                v-for="(date, index1) in scheduleDates"
                :key="index1"
                class="day-schedule"
              >
                <div
                  @click="toggleAccordion(index1)"
                  :class="['schedule-date', `color-${(index1 % 5) + 1}`]"
                >
                  <span class="schedule-date">{{
                    scheduleDates[index1].date
                  }}</span>
                </div>
                <transition
                  name="accordion"
                  @before-enter="beforeEnter"
                  @enter="enter"
                  @leave="leave"
                >
                  <div
                    v-show="scheduleDates[index1].expanded"
                    class="accordion-content"
                  >
                    <table class="styled-table">
                      <thead>
                        <tr>
                          <th>시간</th>
                          <th>방문지</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(location, index2) in planLocations[index1]"
                          :key="index2"
                        >
                          <td>
                            <input
                              type="time"
                              v-model="planLocations[index1][index2].time"
                              disabled="true"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              v-model="planLocations[index1][index2].title"
                              disabled="true"
                            />
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
        <!-- Plan Board Details Section -->
        <div class="col-md-4" style="margin-right: 20px">
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
          <!-- Write Content -->
          <div class="mb-3" style="height: 200px">
            <QuillEditor toolbar="essential" theme="snow" ref="content" />
          </div>
          <!-- Tag 검색하기 -->
          <div class="mb-3" style="margin-top: 100px">
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
                {{ tag.name }}
              </button>
            </div>
          </div>
          <!-- Selected Tags -->
          <div class="mb-3" v-if="planBoardObject.tagList.length > 0">
            <div>선택된 해시태그</div>
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
.date-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.date-section .date-inputs {
  display: flex;
  gap: 10px;
}

.date-section label {
  margin-bottom: 10px;
}
input[type="text"],
input[type="date"],
input[type="time"],
select,
.form-control {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  border: 1px solid rgb(176, 176, 176);
  border-radius: 10px;
}
.schedule-section {
  margin-top: 20px;
  margin-bottom: 20px;
}
.schedule-section label {
  margin-bottom: 20px;
  display: block;
}
.accordion-enter-active,
.accordion-leave-active {
  transition: height 0.5s ease, opacity 0.5s ease;
}

.accordion-enter,
.accordion-leave-to {
  height: 0;
  opacity: 0;
}

.accordion-content {
  overflow: hidden;
}
.schedule-date {
  width: 100px;
  margin: 10px 0;
}

.schedule-date.color-1 {
  background-color: #f2f7ff;
  border-radius: 10px;
  padding: 4px 5px;
  cursor: pointer;
  color: #4e4e4e;
}

.schedule-date.color-2 {
  background-color: #fef4f4;
  border-radius: 10px;
  padding: 4px 5px;
  cursor: pointer;
  color: #4e4e4e;
}

.schedule-date.color-3 {
  background-color: #fcfce2;
  border-radius: 10px;
  padding: 4px 5px;
  cursor: pointer;
  color: #4e4e4e;
}

.schedule-date.color-4 {
  background-color: #f5fff4;
  border-radius: 10px;
  padding: 4px 5px;
  cursor: pointer;
  color: #4e4e4e;
}

.schedule-date.color-5 {
  background-color: #ffeec0;
  border-radius: 10px;
  padding: 4px 5px;
  cursor: pointer;
  color: #4e4e4e;
}
.btn-light {
  background-color: #e4e4e4;
  margin-bottom: 5px;
  margin-right: 10px;
}
.styled-table th,
.styled-table td {
  padding: 8px; /* Add padding to table cells */
}

.styled-table th {
  background-color: #f2f2f2; /* Add background color to table headers */
  text-align: left;
}

.styled-table tr:nth-child(even) {
  background-color: #f9f9f9; /* Add background color to even rows */
}

.styled-table th:first-child {
  border-top-left-radius: 10px; /* Top-left corner */
}

.styled-table th:last-child {
  border-top-right-radius: 10px; /* Top-right corner */
}

.styled-table td:first-child {
  border-bottom-left-radius: 10px; /* Bottom-left corner */
}

.styled-table td:last-child {
  border-bottom-right-radius: 10px; /* Bottom-right corner */
}
</style>
