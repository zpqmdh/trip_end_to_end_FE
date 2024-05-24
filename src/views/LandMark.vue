<template>
  <div class="landmark-detection container mt-5">
    <h1 class="text-center mb-4">사진으로 관광지를 조회해보세요</h1>
    <form @submit.prevent="handleSubmit" class="mb-4 p-4 bg-light rounded shadow-sm">
      <div
        class="dnd-dropzone border border-primary border-dashed rounded p-4 text-center mb-4"
        @dragenter.prevent="handleDragEnter"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        :class="{ 'drag-over': isDragActive }"
      >
        <input type="file" @change="handleFileChange" class="d-none" ref="fileInput" />
        <p>
          Drag & Drop or
          <a href="#" @click.prevent="triggerFileInput">upload</a>
        </p>
        <p>지원 확장자: JPEG, JPG, PNG</p>
        <div v-if="fileNames.length > 0" class="mt-3 d-flex justify-content-center">
          <p><strong>파일명:</strong></p>
          <ul class="list-inline mb-0">
            <p v-for="(name, index) in fileNames" :key="index">
              {{ name }}
            </p>
          </ul>
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-100">장소 검색</button>
    </form>
    <p v-if="error" class="error text-danger">
      {{ error }}
    </p>

    <div v-if="landmarks.length > 0" class="row">
      <div class="col-md-6">
        <GoogleMap
          ref="mapRef"
          :api-key="VITE_GOOGLE_MAP_KEY"
          :center="mapCenter"
          :zoom="15"
          style="width: 100%; height: 100%"
          @load="onMapLoad"
        >
          <Marker
            v-for="(landmark, index) in landmarks"
            :key="index"
            :options="{
              position: {
                lat: parseFloat(landmark.latitude),
                lng: parseFloat(landmark.longitude),
              },
            }"
            @click="showModal(landmark.latitude, landmark.longitude)"
            :clickable="true"
            :draggable="false"
          />
        </GoogleMap>
      </div>
      <div class="col-md-6 mb-4">
        <div class="mb-4 text-center">
          <h2>이 장소를 찾고 계시나요?</h2>
          <img
            :src="previewImage"
            alt="Uploaded image preview"
            class="preview-image img-fluid mb-4 rounded shadow-sm"
          />
        </div>
        <ul class="list-group">
          <li v-for="(landmark, index) in landmarks" :key="index" class="list-group-item">
            <a href="#" @click.prevent="moveToLocation(landmark.latitude, landmark.longitude)">
              {{ landmark.description }}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="checkNoInput && landmarks.length == 0 && fileNames.length > 0">
      <p>{{ checkNoInput }}</p>
    </div>
    <!-- 여행 계획에 추가 -->
    <div v-if="isModalOpen" class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-footer">
            <select class="form-select mt-2" v-model="selectedPlan">
              <option value="" disabled selected>여행을 선택하세요</option>
              <option v-for="plan in plans" :key="plan.planId" :value="plan.planId">
                {{ plan.title }} | 기간: {{ plan.startDate }} -
                {{ plan.endDate }}
              </option>
            </select>
            <button type="button" class="btn btn-success" @click="addToExistingPlan(selectedPlan)">
              기존 여행 계획에 추가
            </button>
            <button type="button" class="btn btn-primary" @click="addToNewPlan()">
              새 여행 계획에 추가
            </button>
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div style="height: 200px"></div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";
import { localAxios } from "@/util/http-commons";
import { decodedTokenFunc } from "@/util/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const local = localAxios();
const file = ref(null);
const fileNames = ref([]);
const landmarks = ref([]);
const error = ref("");
const mapCenter = ref({ lat: 37.5665, lng: 126.978 }); // 초기 중심 좌표를 서울로 설정
const mapRef = ref(null);
const previewImage = ref(null); // 이미지 미리보기 URL을 저장하는 변수
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;
const isDragActive = ref(false);
const checkNoInput = ref("");

function handleFileChange(event) {
  file.value = event.target.files[0];
  previewImage.value = URL.createObjectURL(file.value); // 이미지 미리보기 URL 생성
  fileNames.value = [file.value.name];
  error.value = "";
  checkNoInput.value = "";
  // landmarks.value = null;
}

function triggerFileInput() {
  const fileInput = document.querySelector('input[type="file"]');
  fileInput.click();
}

function handleDragEnter() {
  isDragActive.value = true;
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

function handleDragLeave() {
  isDragActive.value = false;
}

function handleDrop(event) {
  event.preventDefault();
  isDragActive.value = false;
  if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    file.value = event.dataTransfer.files[0];
    previewImage.value = URL.createObjectURL(file.value);
    fileNames.value = [file.value.name];
    error.value = "";
    checkNoInput.value = "";
    // landmarks.value = null;
  }
}

async function handleSubmit() {
  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const response = await local.post("/detectLandmark", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    landmarks.value = response.data;
    if (landmarks.value.length > 0) {
      mapCenter.value = {
        lat: landmarks.value[0].latitude,
        lng: landmarks.value[0].longitude,
      };
    }
    checkNoInput.value = "장소를 찾을 수 없습니다. 다른 이미지로 다시 검색해주세요.";
  } catch (err) {
    error.value = "사진을 인식할 수 없습니다. 다시 시도해주세요.";
  }
}

const currentMarker = ref({
  latitude: "",
  longitude: "",
});

function onMapLoad(map) {
  watch(landmarks, (newLandmarks) => {
    if (newLandmarks.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newLandmarks.forEach((landmark) => {
        bounds.extend(new google.maps.LatLng(landmark.latitude, landmark.longitude));
      });
      map.fitBounds(bounds);
    }
  });
}

function moveToLocation(lat, lng) {
  mapCenter.value = { lat, lng };
  if (mapRef.value) {
    mapRef.value.panTo(new google.maps.LatLng(lat, lng));
  }
}
const isModalOpen = ref(false);
function showModal(latitude, longitude) {
  isModalOpen.value = true;
  currentMarker.value.latitude = latitude;
  currentMarker.value.longitude = longitude;
}
const planBoardObject = ref({
  planBoard: {
    memberId: "",
    subject: "",
    content: "",
    startDate: "",
    endDate: "",
    theNumberOfMembers: "",
    thumbnail: "",
  },
  tagList: [],
});

const loginedId = ref("");
const plans = ref([]);
const selectedPlan = ref("");
const getMemberId = () => {
  const logined = decodedTokenFunc();
  loginedId.value = logined;
  local.get(`/members/detail/${loginedId.value}`).then(({ data }) => {
    planBoardObject.value.planBoard.memberId = data.memberId;
    getDataListPlan();
  });
};
const getDataListPlan = () => {
  local.get(`/plans/list/all/${loginedId.value}`).then(({ data }) => {
    addPlanByCheckingDate(data);
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
    if (new Date(plan.endDate) >= todayDate) {
      plans.value.push(plan);
    }
  });
  plans.value.forEach((plan) => {
    console.log(plan);
  });
};
const addToNewPlan = () => {
  console.log(currentMarker.value.latitude, currentMarker.value.longitude);
  router.push({
    name: "plan-write-vision",
    params: { latitude: currentMarker.value.latitude, longitude: currentMarker.value.longitude },
  });
};
const addToExistingPlan = (selectedPlan) => {
  console.log(currentMarker.value.latitude, currentMarker.value.longitude);
  console.log(selectedPlan);
  router.push({
    name: "plan-detail-ongoing-vision",
    params: {
      id: selectedPlan,
      latitude: currentMarker.value.latitude,
      longitude: currentMarker.value.longitude,
    },
  });
};

onMounted(() => {
  getMemberId();
});
</script>

<style scoped>
.landmark-detection {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}
.error {
  color: red;
}
.preview-image {
  max-width: 100%;
  height: auto;
}
.dnd-dropzone {
  border: 2px dashed #007bff;
  border-radius: 5px;
  padding: 20px;
  cursor: pointer;
}
.dnd-dropzone.drag-over {
  background-color: #e0f7ff;
}

.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 5; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

.modal-content {
  background-color: #fefefe;
  margin: 50% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 500px;
  height: auto;
  align-content: center;
  flex-direction: column;
}
</style>
