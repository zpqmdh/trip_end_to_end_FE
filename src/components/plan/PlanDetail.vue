<template>
  <PlanLiveChat />
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
        <button
          id="btn-search"
          class="btn btn-outline-success"
          type="button"
          @click="search"
        >
          검색
        </button>
      </form>
      <!-- Section 1 -->
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
    <div class="details">
      <form @submit.prevent="submitForm">
        <div class="field">
          <label for="title">제목</label>
          <input
            type="text"
            id="title"
            :value="planDto.title"
            class="form-control"
          />
        </div>
        <div class="field">
          <label for="participants">참여 멤버</label>
          <div class="participants">
            <span v-for="memberId in memberIds" :key="memberId.memberId">{{
              memberId.memberId
            }}</span>
          </div>
        </div>
        <div class="field">
          <label for="startDate">여행 기간</label>
          <input
            type="date"
            id="startDate"
            v-model="planDto.startDate"
            :placeholder="시작일"
            class="form-control"
          />
          <input
            type="date"
            id="endDate"
            v-model="planDto.endDate"
            placeholder="종료일"
            class="form-control"
          />
        </div>
        <div class="field">
          <label for="schedule">상세 일정</label>
          <div v-for="schedule in scheduleDates" :key="schedule.planScheduleId">
            <div>{{ schedule.date }}</div>
            <div v-for="location in planLocations" :key="location">
              <div v-for="loc in location" :key="loc.planLocationId">
                <template v-if="loc.planScheduleId == schedule.planScheduleId">
                  <input :value="loc.time" class="form-control" />
                  <input :value="loc.contentId" class="form-control" />
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="field">
          <label for="reservation">예약 정보</label>
          <div v-for="book in bookContents" :key="book.bookGroupId">
            <input
              type="text"
              id="reservation"
              :value="book.content"
              class="form-control"
            />
          </div>
        </div>
        <div class="field">
          <label for="payment">결제 정보</label>
          <div class="payment-info">
            <div
              v-for="payment in paymentDetails"
              :key="payment"
              class="payment"
            >
              <!-- <span>{{ payment.memberId }}</span>
              <span>{{ payment.date }}</span>
              <span>{{ payment.content }}</span>
              <span>{{ payment.price }}</span> -->
              <input
                class="form-control"
                :value="payment.date + payment.content + payment.price"
              />
            </div>
          </div>
        </div>
        <button type="submit">저장하기</button>
      </form>
    </div>
  </div>
</template>

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
    console.log(paymentDetails);
  } catch (error) {
    console.error("Error fetching plan detail:", error);
  }
};

const submitForm = () => {
  // 폼 제출 로직 작성
  console.log("Form submitted!", {
    title: planDto.value.title,
    startDate: planDto.value.startDate,
    endDate: planDto.value.endDate,
    reservationInfo: reservationInfo.value,
    schedule: scheduleDates.value,
    payments: paymentDetails.value,
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
</style>
