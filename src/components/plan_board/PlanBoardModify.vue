<script setup>
import { ref, onMounted, watch } from "vue";
import { GoogleMap, Marker, Polyline } from "vue3-google-map";
import { localAxios } from "@/util/http-commons.js";
import { useRoute, useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import Swal from "sweetalert2";

const { VITE_LOCALHOST_URL } = import.meta.env;
const local = localAxios();
const route = useRoute();
const router = useRouter();

const { VITE_GOOGLE_MAP_KEY } = import.meta.env;
const center = { lat: 36.35538, lng: 127.8 };
const zoom = ref(7);
const mapRef = ref(null);

const planBoardObject = ref({
  planBoard: {},
  tagList: [],
});
const thumbnail = ref("");
onMounted(() => {
  getDetail(route.params.id);
});

const getMember = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    // 관리자 아님 -> 수정 권한 없음
    if (data.memberId != planBoardObject.value.planBoard.memberId) {
      Swal.fire({
        icon: "error",
        text: "게시글 수정 권한이 없습니다. ",
      });
      router.push({ name: "share-plan-list" });
    }
  });
  console.log(planBoardObject.value);
};

const getDetail = () => {
  local.get(`/shareplan/${route.params.id}`).then(({ data }) => {
    planBoardObject.value.planBoard = data.planBoard;
    planBoardObject.value.tagList = data.tagList;

    getMember(); // 수정 권한 확인
    getPlanDetail();
  });
};

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
import { sassTrue } from "sass";
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
const getPlanDetail = () => {
  local
    .get(`/plans/detail/${planBoardObject.value.planBoard.planId}`)
    .then(({ data }) => {
      console.log(data);
      scheduleDates.value = data.scheduleDates.map((date) => ({
        ...date,
        expanded: sassTrue,
      }));
      planLocations.value = data.planLocations;
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

const updateArticle = () => {
  console.log(planBoardObject.value);
  console.log(planBoardObject.value.tagList.length);
  if (planBoardObject.value.tagList.length > 3) {
    Swal.fire({
      icon: "error",
      text: "게시글 당 태그는 최대 3개까지 등록할 수 있습니다.",
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
    .put(
      `/shareplan/${planBoardObject.value.planBoard.planBoardId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    .then(({ data }) => {
      console.log(data);
      Swal.fire({
        icon: "success",
        text: "여행 공유 게시글이 등록되었습니다.",
      });
      router.push({
        name: "share-plan-detail",
        params: { id: planBoardObject.value.planBoard.planBoardId },
      });
    });
};

// 파일 선택 시 이벤트 핸들러
const onThumbnailChange = (event) => {
  const file = event.target.files[0];
  thumbnail.value = file;
};
</script>

<template>
  <div class="container">
    <!-- Title -->
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
    <!-- Sub-Title -->
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <span>
          <img
            :src="planBoardObject.planBoard.image"
            alt="Profile Image"
            class="article-profile-image"
          />
          <span>{{ planBoardObject.planBoard.nickname }}</span>
        </span>
      </div>
      <div class="meta">
        <span class="views">👁 조회수: {{ planBoardObject.planBoard.hit }}</span>
        <span class="divider">|</span>
        <span class="time"
          >🕒 {{ planBoardObject.planBoard.registerTime }}</span
        >
      </div>
    </div>
    <hr />
  </div>
  <div>
    <!-- Main Section -->
    <div class="row my-5 d-flex justify-content-center">
      <!-- Map Section -->
      <div class="col-md-3" style="margin-right: 20px; margin-left: 20px">
        <GoogleMap
          ref="mapRef"
          :api-key="VITE_GOOGLE_MAP_KEY"
          style="height: 700px; width: 100%"
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
      <!-- Information Section-->
      <div class="col-md-3" style="margin-right: 20px; margin-left: 20px">
        <div>
          <!-- Date -->
          <div class="date-section">
            <label>📆 여행 기간</label>
            <div class="date-inputs">
              <input
                type="date"
                v-model="planBoardObject.planBoard.startDate"
                disabled
              />
              <span class="mt-2">~</span>
              <input
                type="date"
                v-model="planBoardObject.planBoard.endDate"
                disabled
              />
            </div>
          </div>
          <!-- Thumbnail -->
          <div class="mb-3">
            <label for="thumbnailInput" class="form-label"
              >대표 사진 변경하기</label
            >
            <input
              class="form-control"
              type="file"
              id="thumbnailInput"
              @change="onThumbnailChange"
            />
          </div>
          <!-- 동행인 수 -->
          <div style="margin-bottom: 10px">
            👥 동반인 수: {{ planBoardObject.planBoard.theNumberOfMembers }}
          </div>
          <!-- 여행 일정 -->
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
      <!-- Content Section -->
      <div class="col-md-3" style="margin-right: 20px; margin-left: 20px">
        <!-- Content -->
        <div class="mb-3" style="height: 200px">
          <QuillEditor
            toolbar="essential"
            theme="snow"
            v-model:content="planBoardObject.planBoard.content"
            content-type="html"
            class="quill-editor"
          />
        </div>
        <!-- Selected Tags -->
        <div class="mb-3" style="margin-top: 100px">
          <label>선택된 태그</label>
          <div>
            <button
              v-for="selectedTag in planBoardObject.tagList"
              :key="selectedTag.tagTypeId"
              class="btn btn-outline-secondary m-1"
              @click="removeTag(selectedTag)"
            >
              {{ selectedTag.name }} <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
        <!-- Tag 검색 -->
        <div class="mb-3 text-center">
          <input
            id="search-tag"
            type="text"
            class="form-control"
            placeholder="Tag 검색"
            v-model="tagName"
            @input.prevent="searchTag"
          />
          <div class="mt-2">
            <button
              v-for="tag in tagResults"
              :key="tag.tagTypeId"
              class="btn btn-outline-secondary m-1"
              @click="addTag(tag)"
            >
              {{ tag.name }}
            </button>
          </div>
        </div>
        <!-- 수정 버튼 -->
        <div class="text-center">
          <button id="btn-update" class="btn w-100" @click="updateArticle">
            수정
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #fff;
}

.thumbnail {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.form-control-lg {
  font-size: 1.25rem;
  padding: 0.5rem 1rem;
}

.text-muted {
  color: #6c757d !important;
}
.quill-editor {
  height: 400px; /* 원하는 높이로 변경 */
}

button.btn-outline-secondary .bi-x {
  margin-left: 5px;
}

.article-profile-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 10px;
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

#btn-update {
  background-color: #5698ad;
  border-color: white;
  color: white;
}
#btn-update:hover {
  background-color: white;
  border-color: #5698ad;
  color: #5698ad;
}
.meta {
  margin-bottom: 20px;
  text-align: end;
  font-size: 16px;
}
.author,
.views,
.time {
  margin-right: 10px;
  color: #666;
}
.divider {
  color: #999;
}
</style>
