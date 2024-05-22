<script setup>
import { ref, onMounted, watch } from "vue";
import { GoogleMap, Marker, Polyline } from "vue3-google-map";
import { localAxios } from "@/util/http-commons";
import { useRoute, useRouter } from "vue-router";
import PlanLiveChat from "@/components/plan/item/PlanLiveChat.vue";

const local = localAxios();
const route = useRoute();
const router = useRouter();

const planInfo = ref("");

const planDto = ref({});
const memberIds = ref([]);
const bookContents = ref([]);
const scheduleDates = ref([]);
const paymentDetails = ref([]);
const planLocations = ref([]);
const selectedDate = ref(""); // 추가된 선택된 날짜를 저장하는 변수
const planId = route.params.id;
const center = { lat: 36.35538, lng: 127.8 };
const zoom = ref(8);
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;
const showMemberModal = ref(false);
const newMemberId = ref("");
const allMemberList = ref([]);
const searchQuery = ref("");
const filteredMemberList = ref([]);
let selectDate = "";
const mapRef = ref(null);
const locations = ref([]);
const selectedLocation = ref(null); // 선택된 위치 정보를 저장할 ref
const showModal = ref(false); // 모달 표시 여부를 제어할 ref
const clickMarker = ref("");
const newMarkertitle = ref("");
import clickMarkerImage from "@/assets/img/click-marker-blue.png";
const addMarker = (event) => {
  clickMarker.value = {
    position: { lat: event.latLng.lat(), lng: event.latLng.lng() },
    icon: {
      url: clickMarkerImage, // 커스텀 마커 아이콘 URL
      scaledSize: new google.maps.Size(70, 70), // 아이콘 크기 조절
    },
  };
};

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

const fetchMemberList = async () => {
  try {
    const { data } = await local.get("/members/list");
    allMemberList.value = data;
    filterMembers();
  } catch (error) {
    console.error("Error fetching member list:", error);
  }
};

const filterMembers = () => {
  const query = searchQuery.value.toLowerCase();
  const existingMemberIds = memberIds.value.map((m) => m.memberId);
  filteredMemberList.value = allMemberList.value.filter(
    (member) =>
      !existingMemberIds.includes(member.memberId) && member.nickname.toLowerCase().includes(query)
  );
};

const searchOption = ref({
  sido: 0,
  gugun: 0,
  contentTypeId: 0,
  keyword: "",
});

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

const memberList = ref([{}]);

const getMemberNicknames = async () => {
  memberList.value = new Array(memberIds.value.length).fill(""); // nicknames 배열을 memberIds 길이만큼 초기화
  const memberPromises = memberIds.value.map(async (member, index) => {
    try {
      const { data } = await local.get(`/plans/getMember/${member.memberId}`);
      memberList.value[index] = data;
      if (memberList.value[index].image && !memberList.value[index].image.startsWith("http")) {
        memberList.value[index].image =
          "http://localhost/products/" + memberList.value[index].image;
      }
    } catch (error) {
      console.error("Error fetching nickname:", error);
    }
  });
  await Promise.all(memberPromises);
};
const getPlanDetail = async () => {
  try {
    const response = await local.get(`/plans/detail/${planId}`);
    planInfo.value = response.data;

    planDto.value = {
      planId: planInfo.value.planDto.planId,
      memberId: planInfo.value.planDto.memberId,
      title: planInfo.value.planDto.title,
      startDate: planInfo.value.planDto.startDate,
      endDate: planInfo.value.planDto.endDate,
    };
    memberIds.value = planInfo.value.memberIds;
    bookContents.value = planInfo.value.bookContents;
    scheduleDates.value = planInfo.value.scheduleDates.map((date) => ({
      ...date,
      expanded: false,
    }));
    paymentDetails.value = planInfo.value.paymentDetails;
    planLocations.value = planInfo.value.planLocations;
    getMarkerLocations();
    await getMemberNicknames(); // 닉네임 로드 함수 호출
  } catch (error) {
    console.error("Error fetching plan detail:", error);
  }
};

const markerLocations = ref([]);

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

const deletePlan = async () => {
  try {
    alert("정말 삭제하시겠습니까?");
    local.delete(`/plans/delete/${planId}`);
    alert("삭제가 완료되었습니다.");
    router.push({ name: "plan-list" });
  } catch (error) {
    console.error("여행 계획 삭제를 실패하였습니다:", error);
  }
};

const showDetail = (location) => {
  local.get(`/shareplan/map/attractiondescription/${location.contentId}`).then(({ data }) => {
    selectedLocation.value = data;
    selectedLocation.value.title = location.title;
    selectedLocation.value.image = location.firstImage
      ? location.firstImage
      : `https://www.shoshinsha-design.com/wp-content/uploads/2020/05/noimage-760x460.png`;
    selectedLocation.value.addr = location.addr1 + " " + location.addr2;
    selectedLocation.value.latitude = location.latitude;
    selectedLocation.value.longitude = location.longitude;
    showModal.value = true;
  });
};
const showNewMarkerModal = ref(false);
const showAddModal = () => {
  showNewMarkerModal.value = !showNewMarkerModal.value;
};

watch(
  () => planDto.value.startDate,
  (newStartDate) => {
    if (newStartDate && planDto.value.endDate < newStartDate) {
      planDto.value.endDate = newStartDate;
    }
  }
);

watch(
  planLocations,
  (newVal) => {
    getMarkerLocations();
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  getPlanDetail();
  fetchMemberList();
  console.log(markerLocations.value);
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
</script>
<template>
  <PlanLiveChat :planDto="planDto" />
  <div class="container">
    <div class="map">
      <!-- 지도 부분 -->

      <!-- Map -->
      <div class="map-container">
        <GoogleMap
          ref="mapRef"
          :api-key="VITE_GOOGLE_MAP_KEY"
          style="height: 1200px; width: 700px"
          :center="center"
          :zoom="zoom"
          @click="addMarker"
        >
          <div v-for="(scheduleDate, index1) in planLocations">
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
                icon: getMarkerIcon(index1, index2),
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
            <Marker :options="clickMarker" @click="showAddModal()" />
          </div>
        </GoogleMap>
      </div>
    </div>

    <!-- 여행 정보 상세 -->
    <div class="details">
      <label class="mb-0">📝 제목 </label>
      <div class="title-section">
        <input type="text" v-model="planDto.title" disabled="true" />
        <button class="btn-submit" @click="deletePlan">삭제</button>
      </div>
      <div class="members-section">
        <label>👨‍👩‍👦 참여 멤버</label>
        <div class="members-list">
          <div v-for="(member, index) in memberIds" :key="index" class="member-profile">
            <img :src="memberList[index].image" alt="프로필 이미지" class="profile-image mb-0" />
            <p class="mb-0 mt-1">{{ memberList[index].nickname }}</p>
          </div>
          <div class="addMember"></div>
        </div>
      </div>

      <div class="date-section">
        <label>📆 여행 기간</label>
        <div class="date-inputs">
          <input type="date" v-model="planDto.startDate" disabled="true" />
          <span class="mt-2">~</span>
          <input type="date" v-model="planDto.endDate" :min="planDto.startDate" disabled="true" />
        </div>
      </div>

      <div class="schedule-section">
        <label>🕘 여행 일정</label>
        <button @click="toggleAll(true)" class="btn btn-light">모두 열기</button>
        <button @click="toggleAll(false)" class="btn btn-light">모두 닫기</button>
        <div v-for="(date, index1) in scheduleDates" :key="index1" class="day-schedule">
          <div
            @click="toggleAccordion(index1)"
            :class="['schedule-date', `color-${(index1 % 5) + 1}`]"
          >
            <span class="schedule-date">{{ scheduleDates[index1].date }}</span>
          </div>
          <transition name="accordion" @before-enter="beforeEnter" @enter="enter" @leave="leave">
            <div v-show="scheduleDates[index1].expanded" class="accordion-content">
              <table class="styled-table">
                <thead>
                  <tr>
                    <th>시간</th>
                    <th>방문지</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(location, index2) in planLocations[index1]" :key="index2">
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

      <div class="booking-section">
        <label>🚊 예약 내역</label>
        <div v-for="(content, index) in bookContents" :key="index" style="display: flex">
          <input type="text" v-model="bookContents[index].content" disabled="true" />
        </div>
      </div>
      <div class="payment-section">
        <label>💰 결제 내역</label>
        <table>
          <colgroup>
            <col style="width: 20%" />
            <col style="width: 30%" />
            <col style="width: 25%" />
            <col style="width: 25%" />
          </colgroup>
          <thead>
            <tr>
              <th>일자</th>
              <th>내역</th>
              <th>금액</th>
              <th>결제자</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, index) in paymentDetails" :key="index">
              <td>
                <input type="date" v-model="paymentDetails[index].date" disabled="true" />
              </td>
              <td>
                <input type="text" v-model="paymentDetails[index].content" disabled="true" />
              </td>
              <td>
                <input type="text" v-model="paymentDetails[index].price" disabled="true" />
              </td>
              <td>
                <select v-model="paymentDetails[index].memberId" disabled="true">
                  <option
                    v-for="(member, index) in memberIds"
                    :key="member.memberId"
                    :value="member.memberId"
                  >
                    {{ memberList[index].nickname }}
                  </option>
                </select>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- Attraction Description Modal -->
  <div
    v-if="showModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    @click.self="showModal = false"
  ></div>
</template>
<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: 100px auto;
  gap: 20px;
  justify-content: center;
}

.map {
  flex: 1;
  height: 100%;
}
.map-container {
  position: relative;
}
.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-section {
  display: flex;
  height: 60px;
}

.title-section,
.members-section,
.booking-section,
.schedule-section,
.payment-section {
  margin-bottom: 20px;
}

.title-section label,
.members-section label,
.booking-section label,
.schedule-section label,
.payment-section label {
  display: block;
  margin-bottom: 20px;
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

table th,
table td {
  padding: 10px;
  text-align: left;
}

button:hover {
  background: #9a9a9a;
}

.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
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
  margin: 10% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 500px;
  height: auto;
  align-content: center;
  flex-direction: column;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.member-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.profile-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
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

.styled-table {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
  border-collapse: collapse; /* Collapse borders to have single border */
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

.addMember p {
  margin-top: 4px;
  text-align: center;
}

.addMember button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background-color: rgb(230, 230, 230); /* 투명 배경 */
}

.addMember button i {
  font-size: 24px; /* 아이콘 크기 조절 */
  color: black; /* 아이콘 색상 */
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border-radius: 4px;
}

.btn-search {
  width: 200px;
  height: 45px;

  background-color: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
  border-radius: 8px;
}

.btn-search:hover {
  background-color: #6c757d;
  color: white;
  border: 2px solid #6c757d;
  border-radius: 8px;
}

.btn-light {
  background-color: #e4e4e4;
  margin-bottom: 5px;
  margin-right: 10px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0268d4;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #8b8b8b;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #7c7c7c;
  color: white;
  border: none;
}

.btn-outline-primary {
  background-color: transparent;
  color: #007bff;
  border: 2px solid #007bff;
}

.btn-outline-secondary {
  width: 92%;
  background-color: transparent;
  color: #565d63;
  border: 1px solid #6c757d;
  border-radius: 8px;
}

.btn-outline-primary:hover,
.btn-outline-secondary:hover {
  background-color: #f0f2f5;
}

.btn-submit {
  background-color: white;
  border: 2px solid #577b8d;
  color: #577b8d;
  text-decoration: none;
  cursor: pointer;
  width: 80px;
  height: 80%;
  margin-left: 10px;
  border-radius: 8px;
}

.btn-submit:hover {
  background-color: #e2e9ec;
}

.btn-remove {
  color: black;
  text-decoration: none;
}

.btn-search-result {
  background-color: white;
  border: none;
  color: rgb(44, 44, 44);
  padding: 4px 7px;
  margin: 5px 0;
  z-index: 9999;
  position: absolute;
  top: 5px;
  right: 60px;
  height: 40px;
}

.btn-search-result:hover {
  background-color: #eaecec;
}

.modal-body img {
  display: block;
  margin: 0 auto;
  max-width: 80%;
  height: auto;
}

/* ul과 li 스타일 설정 */
.member-list {
  list-style-type: none; /* 불릿 기호 제거 */
  padding: 0;
  margin: 0;
}

.member-list li {
  margin-bottom: 10px;
}

/* 버튼 스타일 설정 */
.member-button {
  display: block;
  width: 100%;
  padding: 10px;
  border: none; /* 버튼 스타일 제거 */
  background: none; /* 배경 제거 */
  text-align: left; /* 텍스트 왼쪽 정렬 */
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease; /* 부드러운 전환 효과 */
}

/* Hover 효과 */
.member-button:hover {
  background-color: #f0f0f0; /* 밝은 회색 */
}

.modal-footer {
  display: flex;
  align-items: center;
  gap: 10px; /* 간격 조절 */
  justify-content: center; /* 중앙 정렬 */
}
</style>
