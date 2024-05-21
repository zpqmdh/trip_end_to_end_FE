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
const selectedDate = ref(""); // 추가된 선택된 날짜를 저장하는 변수
const planId = route.params.id;
const center = { lat: 36.355387, lng: 127.29964 };
const zoom = ref(13);
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;
const showMemberModal = ref(false);
const newMemberId = ref("");
const allMemberList = ref([]);
const searchQuery = ref("");
const filteredMemberList = ref([]);

const mapRef = ref(null);
const locations = ref([]);
const selectedLocation = ref(null); // 선택된 위치 정보를 저장할 ref
const showModal = ref(false); // 모달 표시 여부를 제어할 ref

const fetchMemberList = async () => {
  try {
    const { data } = await local.get("/members/list");
    allMemberList.value = data;
    filterMembers();
  } catch (error) {
    console.error("Error fetching member list:", error);
  }
};

const addMember = (member) => {
  if (member) {
    memberIds.value.push({
      memberId: member.memberId,
      planId: planId,
    });
    searchQuery.value = "";
    filterMembers();
    getMemberNicknames();
    showMemberModal.value = false;
    console.log(memberIds);
  }
};

const filterMembers = () => {
  const query = searchQuery.value.toLowerCase();
  const existingMemberIds = memberIds.value.map((m) => m.memberId);
  filteredMemberList.value = allMemberList.value.filter(
    (member) =>
      !existingMemberIds.includes(member.memberId) &&
      member.nickname.toLowerCase().includes(query)
  );
};

const openMemberModal = () => {
  searchQuery.value = "";
  filterMembers(); // 모달을 열 때 필터링을 다시 적용
  showMemberModal.value = true;
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

const memberList = ref([{}]);

const getMemberNicknames = async () => {
  memberList.value = new Array(memberIds.value.length).fill(""); // nicknames 배열을 memberIds 길이만큼 초기화
  const memberPromises = memberIds.value.map(async (member, index) => {
    try {
      const { data } = await local.get(`/plans/getMember/${member.memberId}`);
      console.log(data);
      memberList.value[index] = data;
      if (
        memberList.value[index].image &&
        !memberList.value[index].image.startsWith("http")
      ) {
        memberList.value[index].image =
          "http://localhost/products/" + memberList.value[index].image;
      }
    } catch (error) {
      console.error("Error fetching nickname:", error);
    }
  });
  await Promise.all(memberPromises);
};
const loading = ref(true);
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

    await getMemberNicknames(); // 닉네임 로드 함수 호출
    loading.value = false;
  } catch (error) {
    console.error("Error fetching plan detail:", error);
  }
};

const submitUpdatedDetail = async () => {
  try {
    // planDto 내용을 planInfo에 병합
    console.log(planInfo.value);
    planInfo.value.planDto = { ...planDto.value };

    // 업데이트된 planInfo를 서버로 전송
    await local.put(`/plans/update/${planId}`, planInfo.value);
    alert("성공!");
    router.push({ name: "plan-list" });
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

const addPlanLocation = (date_index, title, latitude, longitude, contentId) => {
  const scheduleId = scheduleDates.value[date_index].planScheduleId;
  console.log(scheduleId);
  planLocations.value[date_index].push({
    planScheduleId: scheduleId,
    latitude: latitude,
    longitude: longitude,
    contentId: contentId,
    time: "",
    title: title,
  });
  showModal.value = false;
  console.log(planLocations.value);
};

const showDetail = (location) => {
  local
    .get(`/shareplan/map/attractiondescription/${location.contentId}`)
    .then(({ data }) => {
      selectedLocation.value = data;
      selectedLocation.value.title = location.title;
      selectedLocation.value.image = location.firstImage
        ? location.firstImage
        : `https://www.shoshinsha-design.com/wp-content/uploads/2020/05/noimage-760x460.png`;
      selectedLocation.value.addr = location.addr1 + " " + location.addr2;
      selectedLocation.value.latitude = location.latitude;
      selectedLocation.value.longitude = location.longitude;
      console.log(selectedLocation.value);
      showModal.value = true;
    });
};

const removeMember = (index) => {
  memberIds.value.splice(index, 1);
  memberList.value.splice(index, 1);
};

const removeBookContent = (index) => {
  bookContents.value.splice(index, 1);
};

const removePaymentDetail = (index) => {
  paymentDetails.value.splice(index, 1);
};

const removePlanLocation = (date_index, index) => {
  planLocations.value[date_index].splice(index, 1);
};

watch(
  () => planDto.value.startDate,
  (newStartDate) => {
    if (newStartDate && planDto.value.endDate < newStartDate) {
      planDto.value.endDate = newStartDate;
    }
  }
);

onMounted(() => {
  local.get("/shareplan/map/sido").then(({ data }) => {
    makeOption(data);
  });
  getPlanDetail();
  fetchMemberList();
  console.log(memberList.value);
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
        <button
          id="btn-search"
          class="btn btn-outline-success"
          type="button"
          @click="search"
        >
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
        <div v-if="loading">로딩중</div>
        <div v-if="!loading" class="members-list">
          <div
            v-for="(member, index) in memberIds"
            :key="index"
            class="member-profile"
          >
            <img
              :src="memberList[index].image"
              alt="프로필 이미지"
              class="profile-image"
            />
            <p>{{ memberList[index].nickname }}</p>
            <button class="btn btn-remove" @click="removeMember(index)">
              X
            </button>
          </div>
          <div class="addMember">
            <button class="btn btn-link" @click="openMemberModal"></button>
            <p>추가</p>
          </div>
        </div>
        <div v-if="showMemberModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="showMemberModal = false">&times;</span>
            <h2>멤버 검색</h2>
            <input
              type="text"
              v-model="searchQuery"
              @input="filterMembers"
              placeholder="닉네임 검색"
            />
            <ul>
              <li v-for="member in filteredMemberList" :key="member.memberId">
                {{ member.nickname }}
                <button @click="addMember(member)">추가</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="date-section">
        <label>여행 기간</label>
        <div class="date-inputs">
          <input type="date" v-model="planDto.startDate" />
          <span class="mt-2">~</span>
          <input
            type="date"
            v-model="planDto.endDate"
            :min="planDto.startDate"
          />
        </div>
      </div>

      <div class="schedule-section">
        <label>여행 일정</label>
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
            :class="['schedule-date', `color-${(index1 % 4) + 1}`]"
          >
            <span class="schedule-date">{{ scheduleDates[index1].date }}</span>
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
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="planLocations[index1][index2].title"
                      />
                    </td>
                    <td>
                      <button
                        class="btn btn-remove"
                        @click="removePlanLocation(index1, index2)"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </transition>
        </div>
      </div>

      <div class="booking-section">
        <label>예약 내역</label>
        <div v-for="(content, index) in bookContents" :key="index">
          <input type="text" v-model="bookContents[index].content" />
          <button class="btn btn-remove" @click="removeBookContent(index)">
            X
          </button>
        </div>
        <button class="btn btn-outline-secondary" @click="addBookContent">
          +
        </button>
      </div>
      <div class="payment-section">
        <label>결제 내역</label>
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
                <input type="date" v-model="paymentDetails[index].date" />
              </td>
              <td>
                <input type="text" v-model="paymentDetails[index].content" />
              </td>
              <td>
                <input type="text" v-model="paymentDetails[index].price" />
              </td>
              <td>
                <select v-model="paymentDetails[index].memberId">
                  <option
                    v-for="(member, index) in memberIds"
                    :key="member.memberId"
                    :value="member.memberId"
                  >
                    {{ memberList[index].nickname }}
                  </option>
                </select>
              </td>
              <td>
                <button
                  class="btn btn-remove"
                  @click="removePaymentDetail(index)"
                >
                  X
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-outline-secondary" @click="addPaymentDetail">
          +
        </button>
      </div>
      <button class="btn btn-link" @click="submitUpdatedDetail">수정</button>
    </div>
  </div>
  <!-- Attraction Description Modal -->
  <div
    v-if="showModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
  >
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
          <select name="selectDate" id="selectDate" v-model="selectedDate">
            <option
              v-for="(schedule, index) in scheduleDates"
              :key="index"
              :value="index"
            >
              {{ schedule.date }}
            </option>
          </select>
          <button
            type="button"
            class="btn btn-primary"
            @click="
              addPlanLocation(
                selectedDate,
                selectedLocation.title,
                selectedLocation.latitude,
                selectedLocation.longitude,
                selectedLocation.contentId
              )
            "
          >
            여행 계획에 추가
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="showModal = false"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
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

.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  margin-bottom: 10px;
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
  padding: 10px;
  text-align: left;
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
  text-align: left; /* Align text to the left in table headers */
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

.addMember {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.addMember button {
  display: flex;
  width: 50px; /* 원하는 크기로 조정 */
  height: 50px; /* 원하는 크기로 조정 */
  border: none;
  background-image: url("https://cdn.icon-icons.com/icons2/3428/PNG/512/users_person_user_account_avatar_profile_add_icon_218731.png");
  background-size: cover;
  background-position: center;
  border-radius: 50%; /* 원형 버튼 */
  cursor: pointer;
  background-color: #e9e3e3;
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

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-outline-primary {
  background-color: transparent;
  color: #007bff;
  border: 2px solid #007bff;
}

.btn-outline-secondary {
  background-color: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.btn-outline-primary:hover,
.btn-outline-secondary:hover {
  background-color: #f0f2f5;
}

.btn-link {
  background-color: #577b8d;
  border: none;
  color: white;
  text-decoration: none;
  cursor: pointer;
}

.btn-remove {
  color: black;
  text-decoration: none;
}

button:hover {
  background: none;
}

.modal-body img {
  display: block;
  margin: 0 auto;
  max-width: 80%;
  height: auto;
}
</style>
