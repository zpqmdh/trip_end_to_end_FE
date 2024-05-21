<template>
  <PlanLiveChat :planDto="planDto" />
  <div class="container">
    <div class="map">
      <!-- 지도 부분 -->
      <form class="d-flex" role="search">
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
      <!-- Map -->
      <div>
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
    </div>
    <!-- 여행 정보 상세 -->
    <div class="details">
      <div class="title-section">
        <label>
          제목
          <input type="text" v-model="planDto.title" />
        </label>
      </div>
      <div class="members-section">
        <label>참여 멤버</label>
        <div v-for="(member, index) in memberIds" :key="index">
          <input type="text" v-model="memberIds[index].memberId" />
        </div>
        <button @click="showMemberModal = true">맴버 추가하기</button>
        <div v-if="showMemberModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="showMemberModal = false">&times;</span>
            <h2>멤버 검색</h2>
            <input type="text" v-model="newMemberId" placeholder="Enter member ID" />
            <button @click="addMember">추가</button>
          </div>
        </div>
      </div>
      <div class="date-section">
        <label>여행 기간</label>
        <input type="date" v-model="planDto.startDate" />
        <input type="date" v-model="planDto.endDate" />
      </div>
      <div class="booking-section">
        <label>예약 내역</label>
        <div v-for="(content, index) in bookContents" :key="index">
          <input type="text" v-model="bookContents[index].content" />
        </div>
        <button @click="addBookContent">+</button>
      </div>
      <div class="schedule-section">
        <label>여행 일정</label>
        <div v-for="(date, index1) in scheduleDates" :key="index1" class="day-schedule">
          <input type="text" v-model="scheduleDates[index1].date" />
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(location, index2) in planLocations" :key="index2">
                <template v-for="(loc, index3) in location" :key="index3">
                  <template v-if="loc.planScheduleId == date.planScheduleId">
                    <td>
                      <input type="text" v-model="planLocations[index2][index3].time" />
                    </td>
                    <tr>
                      <td>
                        <input type="text" v-model="planLocations[index2][index3].title" />
                      </td>
                    </tr>
                  </template>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="payment-section">
        <label>결제 내역</label>
        <table>
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
                <input type="text" v-model="paymentDetails[index].date" />
              </td>
              <td>
                <input type="text" v-model="paymentDetails[index].content" />
              </td>
              <td>
                <input type="text" v-model="paymentDetails[index].price" />
              </td>
              <td>
                <input type="text" v-model="paymentDetails[index].memberId" />
              </td>
            </tr>
          </tbody>
        </table>
        <button @click="addPaymentDetail">+</button>
      </div>
    </div>
    <button @click="submitUpdatedDetail">Update</button>
  </div>
</template>
<style scoped>
.container {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  gap: 20px;
}
.map {
  flex: 1;
  height: 100%;
}
.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.title-section,
.members-section,
.date-section,
.booking-section,
.schedule-section,
.payment-section {
  margin-bottom: 20px;
}
.title-section label,
.members-section label,
.date-section label,
.booking-section label,
.schedule-section label,
.payment-section label {
  display: block;
  margin-bottom: 10px;
}
input[type="text"],
input[type="date"],
select,
.form-control {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
table th,
table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background: #0056b3;
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
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
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
</style>

<script setup>
import { ref, onMounted, watch } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";
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

const center = { lat: 36.355387, lng: 127.29964 };
const zoom = ref(13);
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;
const showMemberModal = ref(false);
const newMemberId = ref("");

const addMember = () => {
  if (newMemberId.value) {
    memberIds.value.push({ memberId: newMemberId.value });
    newMemberId.value = "";
    showMemberModal.value = false;
  }
};

const searchOption = ref({
  sido: 0,
  gugun: 0,
  contentTypeId: 0,
  keyword: "",
});

const mapRef = ref(null);
const locations = ref([]);
const selectedLocation = ref(null); // 선택된 위치 정보를 저장할 ref
const showModal = ref(false); // 모달 표시 여부를 제어할 ref

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

const planId = route.params.id;
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
    scheduleDates.value = planInfo.value.scheduleDates;
    paymentDetails.value = planInfo.value.paymentDetails;
    planLocations.value = planInfo.value.planLocations;
  } catch (error) {
    console.error("Error fetching plan detail:", error);
  }
};

const submitUpdatedDetail = async () => {
  try {
    // planDto 내용을 planInfo에 병합
    planInfo.value.planDto = { ...planDto.value };

    // 업데이트된 planInfo를 서버로 전송
    await local.put(`/plans/update/${planId}`, planInfo.value);
    alert("성공!");
  } catch (error) {
    console.error("여행 계획 수정에 실패하였습니다:", error);
  }
};

const addPaymentDetail = () => {
  paymentDetails.value.push({
    date: "",
    content: "",
    price: "",
    memberId: "",
    planId: planId,
  });
};

const addBookContent = () => {
  bookContents.value.push({
    planId: planId,
    content: "",
  });
};
onMounted(() => {
  local.get("/shareplan/map/sido").then(({ data }) => {
    makeOption(data);
  });

  getPlanDetail();
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

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  gap: 20px;
}
.map {
  flex: 1;
  height: 100%;
}
.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.field {
  display: flex;
  flex-direction: column;
}
.participants {
  display: flex;
  gap: 10px;
}
.participants img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.schedule {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.day-schedule {
  background: #f9f9f9;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.event {
  display: flex;
  justify-content: space-between;
}
.payment-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.payment {
  display: flex;
  justify-content: space-between;
}
button {
  align-self: flex-start;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background: #0056b3;
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
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
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
</style>
