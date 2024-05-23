<script setup>
import { ref, onMounted } from "vue";
import { GoogleMap, Marker, Polyline } from "vue3-google-map";
import { useRoute, useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons.js";
import { decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const { VITE_LOCALHOST_URL } = import.meta.env;

const route = useRoute();
const router = useRouter();
const local = localAxios();

const { VITE_GOOGLE_MAP_KEY } = import.meta.env;
const center = { lat: 36.35538, lng: 127.8 };
const zoom = ref(7);
const mapRef = ref(null);

const planBoardObject = ref({
  planBoard: {},
  commentList: [],
  likeList: [],
  tagList: [],
});
const newComment = ref({
  planBoardId: "",
  memberId: "",
  content: "",
  depth: "-1",
  commentGroup: "-1",
});
const editingComment = ref(null); // 현재 편집 중인 댓글의 ID
const updateComment = ref({
  commentId: -1,
  content: "",
});
const newLike = ref({
  memberId: "",
  planBoardId: "",
});

const memberId = ref("");
const isClickedLike = ref(null);
onMounted(() => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    memberId.value = data.memberId;
    newComment.value.memberId = data.memberId;
    newLike.value.memberId = data.memberId;
  });
  getDetail();
});

const getDetail = () => {
  local.get(`/shareplan/${route.params.id}`).then(({ data }) => {
    console.log(data);
    // comment, like 에 planBoardId 추가
    newComment.value.planBoardId = data.planBoard.planBoardId;
    newLike.value.planBoardId = data.planBoard.planBoardId;

    planBoardObject.value.planBoard = data.planBoard;
    planBoardObject.value.commentList = data.commentList;
    planBoardObject.value.likeList = data.likeList;
    planBoardObject.value.tagList = data.tagList;
    if (!planBoardObject.value.planBoard.thumbnail.startsWith("http")) {
      planBoardObject.value.planBoard.thumbnail =
        `http://${VITE_LOCALHOST_URL}/products/` + planBoardObject.value.planBoard.thumbnail;
    }
    if (!planBoardObject.value.planBoard.image.startsWith("http")) {
      planBoardObject.value.planBoard.image =
        `http://${VITE_LOCALHOST_URL}/products/` + planBoardObject.value.planBoard.image;
    }
    planBoardObject.value.commentList.forEach((comment) => {
      if (!comment.image.startsWith("http")) {
        comment.image = `http://${VITE_LOCALHOST_URL}/products/` + comment.image;
      }
    });
    const like = planBoardObject.value.likeList.find((like) => like.memberId === memberId.value);
    if (like) {
      // 로그인 상태의 유저가 해당 게시글에 좋아요를 누른 상태
      isClickedLike.value = like;
    } else {
      isClickedLike.value = null;
    }
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
  local.get(`/plans/detail/${planBoardObject.value.planBoard.planId}`).then(({ data }) => {
    console.log(data);
    scheduleDates.value = data.scheduleDates.map((date) => ({
      ...date,
      expanded: false,
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
/* Comment */
const addComment = () => {
  local
    .post(`/shareplan/insert/${newComment.value.planBoardId}/comment`, newComment.value)
    .then(() => {
      getDetail();
      newComment.value.content = "";
    });
};

const startEditingComment = (comment) => {
  editingComment.value = comment.commentId;
  updateComment.value.commentId = comment.commentId;
  updateComment.value.content = comment.content;
};

const saveEditComment = (commentId) => {
  local.put(`/shareplan/comment/${commentId}`, updateComment.value).then(() => {
    getDetail();
    editingComment.value = null;
  });
};

const deleteComment = (commentId) => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success mx-3",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: "정말 삭제하실 건가요??",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "예",
      cancelButtonText: "아니오",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        local.delete(`/shareplan/comment/${commentId}`).then(() => {
          swalWithBootstrapButtons.fire({
            title: "삭제 완료",
            icon: "success",
          });
          getDetail();
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "취소되었습니다.",
          icon: "error",
        });
      }
    });
};

/* Like */
const clickLike = () => {
  console.log(isClickedLike.value);
  if (isClickedLike.value == null) {
    console.log("qwe");
    console.log(newLike.value);
    local
      .post(`/shareplan/insert/${newLike.value.planBoardId}/like`, newLike.value)
      .then(({ data }) => {
        console.log(data);
        getDetail();
      });
  } else {
    local.delete(`/shareplan/like/${isClickedLike.value.planLikeId}`).then(({ data }) => {
      console.log(data);
      getDetail();
    });
  }
};

const moveList = () => {
  router.push({ name: "share-plan-list" });
};
const moveModify = () => {
  router.push({
    name: "share-plan-modify",
    params: { id: planBoardObject.value.planBoard.planBoardId },
  });
};
const deleteArticle = () => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success mx-3",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: "정말 삭제하실 건가요??",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "예",
      cancelButtonText: "아니오",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        local
          .delete(`/shareplan/${planBoardObject.value.planBoard.planBoardId}`)
          .then(({ data }) => {
            swalWithBootstrapButtons.fire({
              title: "삭제 완료",
              icon: "success",
            });
            router.push({ name: "share-plan-list" });
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "취소되었습니다.",
          icon: "error",
        });
      }
    });
};
</script>

<template>
  <div class="container">
    <!-- Main Section -->
    <div class="row">
      <!-- Title -->
      <h3 class="header">{{ planBoardObject.planBoard.subject }}</h3>
      <hr />
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
          <span class="time">🕒 {{ planBoardObject.planBoard.registerTime }}</span>
        </div>
      </div>
    </div>
  </div>
  <div>
    <div class="row my-5 justify-content-center">
      <!-- Map Section -->
      <div class="col-md-3" style="margin-right: 20px; margin-left: 20px">
        <GoogleMap
          ref="mapRef"
          :api-key="VITE_GOOGLE_MAP_KEY"
          style="height: 900px; width: 100%"
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
      <div class="col-md-3" style="margin-right: 20px; margin-left: 20px">
        <div class="mb-3">
          <!-- Date -->
          <div class="date-section">
            <label>📆 여행 기간</label>
            <div class="date-inputs">
              <input type="date" v-model="planBoardObject.planBoard.startDate" disabled />
              <span class="mt-2">~</span>
              <input type="date" v-model="planBoardObject.planBoard.endDate" disabled />
            </div>
          </div>
          <!-- Thumbnail -->
          <img
            id="thumbnail"
            :src="planBoardObject.planBoard.thumbnail"
            class="thumbnail"
            alt="Thumbnail"
          />
          <!-- 동행인 수 -->
          <div style="margin-bottom: 15px; margin-top: 20px">
            👥 동반인 수: {{ planBoardObject.planBoard.theNumberOfMembers }}
          </div>
          <!-- Content -->
          <div
            class="content-box"
            v-html="planBoardObject.planBoard.content"
            style="height: 370px"
          ></div>
        </div>
      </div>
      <div class="col-md-3" style="margin-right: 20px; margin-left: 20px">
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
      </div>
    </div>
  </div>
  <div class="container">
    <!-- Like Section -->
    <div class="like-section">
      <button @click="clickLike" class="like-button">
        <img v-show="isClickedLike" src="@/assets/img/like-on.png" class="like-icon" alt="Liked" />
        <img v-show="!isClickedLike" src="@/assets/img/like-off.png" class="like-icon" alt="Like" />
        <h5>{{ planBoardObject.likeList.length }}</h5>
      </button>
    </div>
    <!-- Tag Section -->
    <div class="tag-section">
      <button v-for="tag in planBoardObject.tagList" :key="tag.planBoardTagId" class="tag-btn">
        #{{ tag.name }}
      </button>
    </div>
    <!-- Modify Plan Board Article -->
    <div class="d-flex justify-content-end">
      <button id="btn-list" class="btn" @click="moveList">목록으로</button>
      <template v-if="planBoardObject.planBoard.memberId === memberId">
        <button id="btn-modify" class="btn" @click="moveModify">수정하기</button>
        <button id="btn-delete" class="btn" @click="deleteArticle">삭제하기</button>
      </template>
    </div>
    <hr />
    <!-- Comment Section -->
    <div class="comment-section">
      <h4>댓글</h4>
      <div class="comment-form d-flex justify-content-center">
        <textarea
          v-model="newComment.content"
          placeholder="댓글을 입력하세요..."
          class="form-control"
          rows="3"
        ></textarea>
        <button @click="addComment" class="btn">댓글 달기</button>
      </div>
      <div class="comment-list mt-4">
        <div v-for="comment in planBoardObject.commentList" :key="comment.id" class="comment-item">
          <!-- Existing Comments -->
          <template v-if="comment.deleted == 0">
            <div class="comment-header d-flex align-items-center justify-content-between">
              <span>
                <img :src="comment.image" alt="Profile Image" class="profile-image" />
                <span>{{ comment.nickname }}</span>
              </span>
              <p class="text-end ml-auto" style="font-size: 14px">🕒 {{ comment.registerTime }}</p>
            </div>
            <div
              v-if="editingComment !== comment.commentId"
              class="d-flex justify-content-between align-items-center mt-3"
            >
              <p>{{ comment.content }}</p>
              <div v-if="comment.memberId === memberId" class="comment-actions">
                <button @click="startEditingComment(comment)" class="btn btn-sm" id="btn-modify">
                  수정
                </button>
                <button
                  @click="deleteComment(comment.commentId)"
                  class="btn btn-sm"
                  id="btn-delete"
                >
                  삭제
                </button>
              </div>
            </div>
            <div v-else class="d-flex justify-content-center">
              <textarea
                v-model="updateComment.content"
                class="form-control"
                style="width: 80%; margin-right: 10px"
                rows="2"
              ></textarea>
              <button @click="saveEditComment(comment.commentId)" class="btn mt-2" id="btn-list">
                저장
              </button>
            </div>
          </template>
          <!-- Deleted Comments -->
          <template v-if="comment.deleted == 1">
            <div v-if="comment.depth != 0" class="col-1"></div>
            <div class="col">
              <p>
                <strong> - </strong>
              </p>
              <p>삭제된 댓글입니다.</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Header */
.header {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* Thumbnail */
.thumbnail {
  width: 100%;
  height: auto;
}

/* Content Box */
.content-box {
  background-color: #f0f0f0;
  min-height: 200px;
  padding: 15px;
  border-radius: 10px;
}

.sub-header {
  text-align: end;
}

#btn-list {
  border-color: #97654c;
  color: #97654c;
  background-color: white;
  margin-right: 5px;
}
#btn-list:hover {
  background-color: #97654c;
  color: white;
}
#btn-modify {
  border-color: #577b8d;
  color: #577b8d;
  background-color: white;
  margin-right: 5px;
}
#btn-modify:hover {
  background-color: #577b8d;
  color: white;
}
#btn-delete {
  border-color: #666;
  color: #666;
  background-color: white;
}
#btn-delete:hover {
  background-color: #666;
  color: white;
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
/* Like Section */
.like-section {
  text-align: center;
  margin-top: 20px;
}

.like-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.like-icon {
  width: 40px;
  height: auto;
  margin-right: 5px;
}

/* Tag Section */
.tag-section {
  text-align: center;
  margin-top: 20px;
}

.tag-btn {
  background-color: #577b8d;
  color: white;
  border-color: white;
  border-radius: 20px;
  padding: 5px 15px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}
.tag-btn:hover {
  background-color: white;
  color: #577b8d;
  border-color: #577b8d;
}

/* Comment Section */
.comment-section {
  margin-top: 20px;
}

.comment-form textarea {
  width: 80%;
  resize: vertical;
}
.comment-form button {
  margin-left: 10px;
  background-color: #5698ad;
  color: white;
  border-color: white;
}

.comment-list {
  display: flex;
  flex-direction: column; /* Ensures comments are displayed vertically */
  align-items: center;
}

.comment-item {
  border-bottom: 1px solid #ddd;
  padding: 15px 0;
  width: 100%; /* Ensure the comment item takes up full width */
}
.article-profile-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 10px;
}
.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
.comment-actions {
  display: flex;
  gap: 10px;
}

.comment-actions .btn {
  background-color: #577b8d;
  color: white;
}

.comment-actions .btn:hover {
  background-color: #475f6e;
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
@media (max-width: 768px) {
  .header {
    font-size: 1.5rem;
  }
}
</style>
