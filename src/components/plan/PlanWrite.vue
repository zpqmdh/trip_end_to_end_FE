<script setup>
import { ref, onMounted, watch } from "vue";
import { GoogleMap, Marker, Polyline } from "vue3-google-map";
import { localAxios } from "@/util/http-commons";
import { useRoute, useRouter } from "vue-router";
import PlanLiveChat from "@/components/plan/item/PlanLiveChat.vue";
import { decodedTokenFunc } from "@/util/auth";
import dayjs from "dayjs"; // dayjs를 사용하여 날짜 조작
import redMarkerImage from "@/assets/img/marker-red.png";
import blueMarkerImage from "@/assets/img/marker-sky.png";
import greenMarkerImage from "@/assets/img/marker-green.png";
import orangeMarkerImage from "@/assets/img/marker-orange.png";
import yellowMarkerImage from "@/assets/img/marker-yellow.png";
import Swal from "sweetalert2";

const { VITE_LOCALHOST_URL } = import.meta.env;

const local = localAxios();
const route = useRoute();
const router = useRouter();

const planInfo = ref("");
const loginedId = decodedTokenFunc();

const memberId = ref("");

const getMemberId = async () => {
  try {
    const loginedId = decodedTokenFunc(); // 또는 실제 로그인된 사용자의 ID
    const { data } = await local.get(`/members/detail/${loginedId}`);
    memberId.value = data.memberId;
  } catch (error) {
    console.error("Error fetching member details:", error);
  }
};

const setMemberIdValue = async () => {
  await getMemberId();
};

const planDto = ref({
  planId: "",
  memberId: memberId.value,
  title: "",
  startDate: "",
  endDate: "",
});

const memberIds = ref([]);
const bookContents = ref([]);
const scheduleDates = ref([]);
const paymentDetails = ref([]);
const planLocations = ref([]);
const selectedDate = ref(""); // 추가된 선택된 날짜를 저장하는 변수

const center = { lat: 36.35538, lng: 127.8 };
const zoom = ref(8);
const { VITE_GOOGLE_MAP_KEY } = import.meta.env;
const showMemberModal = ref(false);
const allMemberList = ref([]);
const searchQuery = ref("");
const filteredMemberList = ref([]);
const mapRef = ref(null);
const locations = ref([]);
const selectedLocation = ref(null); // 선택된 위치 정보를 저장할 ref
const showModal = ref(false); // 모달 표시 여부를 제어할 ref
const clickMarker = ref("");
const newMarkertitle = ref("");
import clickMarkerImage from "@/assets/img/click-marker-blue.png";

// 날짜 범위 생성 함수
const generateDateRange = (start, end) => {
  const dateArray = [];
  let currentDate = dayjs(start);
  let idCounter = 1;
  while (currentDate.isBefore(dayjs(end).add(1, "day"))) {
    dateArray.push({
      planScheduleId: idCounter,
      date: currentDate.format("YYYY-MM-DD"),
      planId: null, // 필요에 따라 planId 할당
    });
    currentDate = currentDate.add(1, "day");
    idCounter += 1;
  }
  return dateArray;
};

// watch 함수 설정
watch(
  [() => planDto.value.startDate, () => planDto.value.endDate],
  ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate) {
      scheduleDates.value = generateDateRange(newStartDate, newEndDate);
      // planLocations 배열을 각 날짜별로 초기화
      planLocations.value = scheduleDates.value.map(() => []);
    }
  }
);

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

const addMember = (member) => {
  if (member) {
    memberIds.value.push({
      memberId: member.memberId,
      planId: "",
    });
    searchQuery.value = "";
    filterMembers();
    getMemberInfo();
    showMemberModal.value = false;
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

const resetSearch = () => {
  locations.value = "";
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
  const url = `/map/gugun/${sidoCode}`;
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

  local.get("/map/attractioninfo?" + queryString).then(({ data }) => {
    locations.value = data.attractionInfoList;
  });
};

const memberList = ref([{}]);

const getMemberInfo = async () => {
  memberList.value = new Array(memberIds.value.length).fill(""); // nicknames 배열을 memberIds 길이만큼 초기화
  const memberPromises = memberIds.value.map(async (member, index) => {
    try {
      const { data } = await local.get(`/plans/getMember/${member.memberId}`);
      memberList.value[index] = data;
      if (
        memberList.value[index].image &&
        !memberList.value[index].image.startsWith("http")
      ) {
        memberList.value[index].image =
          `http://${VITE_LOCALHOST_URL}/products/` +
          memberList.value[index].image;
      }
    } catch (error) {
      console.error("Error fetching nickname:", error);
    }
  });
  await Promise.all(memberPromises);
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

const submitUpdatedDetail = async () => {
  planDto.value.memberId = memberId.value;
  try {
    planInfo.value = {
      planDto: planDto.value,
      memberIds: memberIds.value,
      bookContents: bookContents.value,
      scheduleDates: scheduleDates.value,
      paymentDetails: paymentDetails.value,
      planLocations: planLocations.value,
    };

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success mx-3",
      },
      buttonsStyling: true,
    });
    swalWithBootstrapButtons;
    local.post(`/plans/create`, planInfo.value).then(() => {
      swalWithBootstrapButtons.fire({
        title: "작성 완료",
        icon: "success",
      });
      router.push({ name: "plan-list" });
    });
  } catch (error) {
    console.error("여행 계획 작성에 실패하였습니다:", error);
  }
};

const addPaymentDetail = () => {
  paymentDetails.value.push({
    date: "",
    content: "",
    price: "",
    memberId: "",
    planId: "",
  });
};

const addBookContent = () => {
  bookContents.value.push({
    planId: "",
    content: "",
  });
};

const addPlanLocation = (date_index, title, latitude, longitude, contentId) => {
  const scheduleId = scheduleDates.value[date_index].planScheduleId;
  planLocations.value[date_index].push({
    planScheduleId: scheduleId,
    latitude: latitude,
    longitude: longitude,
    contentId: contentId,
    time: "",
    title: title,
  });
  showModal.value = false;
  toggleAll(false);
  setTimeout(function () {
    toggleAll(true);
  }, 50);
  selectedDate.value = "";
  showNewMarkerModal.value = false;
};

const showDetail = (location) => {
  local
    .get(`/map/attractiondescription/${location.contentId}`)
    .then(({ data }) => {
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

watch(
  planLocations,
  (newVal) => {
    getMarkerLocations();
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  await setMemberIdValue();
  // 작성자 memberId 참여 멤버에 업데이트
  memberIds.value.push({
    memberId: memberId.value,
    planId: "",
  });
  // 작성자 정보 호출
  getMemberInfo();
  local.get("/map/sido").then(({ data }) => {
    makeOption(data);
  });
  fetchMemberList();
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
          class="btn-search"
          type="button"
          @click="search"
        >
          검색
        </button>
      </form>

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

          <button @click="resetSearch" class="btn-search-result">
            검색 결과 초기화
          </button>
        </GoogleMap>
      </div>
    </div>

    <!-- 여행 정보 상세 -->
    <div class="details">
      <form @submit.prevent="submitUpdatedDetail">
        <label class="mb-0">📝 제목 </label>
        <div :v-model="memberId"></div>
        <div class="title-section">
          <input type="text" v-model="planDto.title" required />
          <button class="btn-submit" type="submit">저장</button>
        </div>
      </form>
      <div class="members-section">
        <label>👨‍👩‍👦 참여 멤버</label>
        <div class="members-list">
          <div
            v-for="(member, index) in memberIds"
            :key="index"
            class="member-profile"
          >
            <img
              :src="memberList[index].image"
              alt="프로필 이미지"
              class="profile-image mb-0"
            />
            <p class="mb-0 mt-1">{{ memberList[index].nickname }}</p>
            <button
              class="btn btn-remove mt-0"
              style="padding: 0px; color: gray"
              @click="removeMember(index)"
            >
              X
            </button>
          </div>
          <div class="addMember">
            <button @click="openMemberModal">
              <i class="bi bi-person-plus"></i>
            </button>
            <p class="center">추가</p>
          </div>
        </div>
        <div
          v-if="showMemberModal"
          class="modal"
          @click.self="showMemberModal = false"
        >
          <div class="modal-content add-member">
            <span class="close" @click="showMemberModal = false">&times;</span>
            <h2>멤버 검색</h2>
            <input
              type="text"
              v-model="searchQuery"
              @input="filterMembers"
              placeholder="닉네임 검색"
            />
            <div v-show="searchQuery.length > 0">
              <ul class="member-list">
                <li v-for="member in filteredMemberList" :key="member.memberId">
                  <button class="member-button" @click="addMember(member)">
                    {{ member.nickname }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="date-section">
        <label>📆 여행 기간</label>
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
        <label>🚊 예약 내역</label>
        <div
          v-for="(content, index) in bookContents"
          :key="index"
          style="display: flex"
        >
          <input type="text" v-model="bookContents[index].content" />
          <button
            class="btn btn-remove mb-2"
            style="color: gray"
            @click="removeBookContent(index)"
          >
            X
          </button>
        </div>
        <button class="btn btn-outline-secondary" @click="addBookContent">
          +
        </button>
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
                  class="btn btn-remove mb-2"
                  @click="removePaymentDetail(index)"
                  style="color: gray"
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
    </div>
  </div>

  <!-- Attraction Description Modal -->
  <div
    v-if="showModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    @click.self="showModal = false"
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
            <option disabled value="">날짜 선택</option>
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
  <!-- API에 없는 현재 클릭한 마커 여행지 추가 -->
  <div
    v-if="showNewMarkerModal"
    class="modal fade show d-block"
    tabindex="-1"
    @click.self="showNewMarkerModal = false"
  >
    <div class="modal-content">
      <select name="selectDate" id="selectDate" v-model="selectedDate">
        <option disabled value="">날짜 선택</option>
        <option
          v-for="(schedule, index) in scheduleDates"
          :key="index"
          :value="index"
        >
          {{ schedule.date }}
        </option>
      </select>
      <input
        type="text"
        name="newMarkertitle"
        v-model="newMarkertitle"
        placeholder="여행지 이름을 입력하세요"
        required
      />
      <button
        type="button"
        class="btn btn-primary mb-2"
        :disabled="!newMarkertitle"
        @click="
          addPlanLocation(
            selectedDate,
            newMarkertitle,
            clickMarker.position.lat,
            clickMarker.position.lng,
            null
          )
        "
      >
        여행 계획에 추가
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        @click="showNewMarkerModal = false"
      >
        닫기
      </button>
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
  border-collapse: collapse;
}

.styled-table th,
.styled-table td {
  padding: 8px;
}

.styled-table th {
  background-color: #f2f2f2;
  text-align: left;
}

.styled-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.styled-table th:first-child {
  border-top-left-radius: 10px;
}

.styled-table th:last-child {
  border-top-right-radius: 10px;
}

.styled-table td:first-child {
  border-bottom-left-radius: 10px;
}

.styled-table td:last-child {
  border-bottom-right-radius: 10px;
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
  background-color: rgb(230, 230, 230);
}
.addMember button i {
  font-size: 24px;
  color: black;
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
  background-color: #577b8d;
  border: none;
  color: white;
  text-decoration: none;
  cursor: pointer;
  width: 80px;
  height: 80%;
  margin-left: 10px;
  border-radius: 8px;
}

.btn-submit:hover {
  background-color: #547586;
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
  z-index: 5;
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

.member-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.member-list li {
  margin-bottom: 10px;
}

.member-button {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  background: none;
  text-align: left;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.member-button:hover {
  background-color: #f0f0f0;
}

.modal-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
</style>
