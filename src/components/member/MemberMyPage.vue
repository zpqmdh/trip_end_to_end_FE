<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { localAxios } from "@/util/http-commons";
import { logout, decodedTokenFunc } from "@/util/auth";
import Swal from "sweetalert2";
import MemberMyPageSidebarVue from "./MemberMyPageSidebar.vue";

// local url 환경 변수
const { VITE_LOCALHOST_URL } = import.meta.env;

// Axios 인스턴스 생성
const local = localAxios();

// Vue Router 설정
const router = useRouter();

// 현재 로그인된 아이디 호출
const loginedId = decodedTokenFunc();

const file = ref(null);
const fileNames = ref([]);
const isDragActive = ref(false);
const checkNoInput = ref("");

// 회원 정보
const member = ref({
  memberId: "",
  id: loginedId,
  password: "",
  name: "",
  birthdate: "",
  image: "",
  emailId: "",
  emailDomain: "",
  token: null,
  isActive: "",
  joinDate: "",
  type: "",
  nickname: "",
  sex: "",
  area: "",
  phoneNumber: "",
  mbti: "",
});

// 파일 변경 핸들러
function handleFileChange(event) {
  file.value = event.target.files[0];
  fileNames.value = [file.value.name];
  checkNoInput.value = "";
}

// 파일 입력 트리거
function triggerFileInput() {
  const fileInput = document.querySelector('input[type="file"]');
  fileInput.click();
}

// 드래그 앤 드롭 핸들러
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
    fileNames.value = [file.value.name];
    checkNoInput.value = "";
  }
}

// 회원 정보 로드
const loadMemberDetails = async () => {
  try {
    const id = loginedId;
    const response = await local.get(`/members/detail/${id}`);
    const data = response.data;
    member.value = {
      memberId: data.memberId,
      nickname: data.nickname,
      mbti: data.mbti,
      name: data.name,
      birthdate: data.birthdate,
      image: data.image,
      emailId: data.emailId,
      emailDomain: data.emailDomain,
      area: data.area,
      sex: data.sex,
      phoneNumber: data.phoneNumber,
    };
  } catch (error) {
    Swal.fire({
      icon: "error",
      text: "회원 정보를 불러오는 데 실패하였습니다.",
    });
    console.error("회원 정보를 불러오는 데 실패하였습니다.", error);
  }
};

// 시도 옵션 생성
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

// 회원 정보 수정
const handleUpdate = async () => {
  try {
    const id = loginedId;
    const formData = new FormData();
    formData.append(
      "updateMember",
      new Blob([JSON.stringify(member.value)], {
        type: "application/json",
      })
    );
    formData.append("image", file.value);
    const response = await local.put(`/members/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    Swal.fire({
      icon: "success",
      text: `${response.data}`,
    });
    loadMemberDetails();
  } catch (error) {
    Swal.fire({
      icon: "error",
      text: "회원 정보 수정에 실패하였습니다.",
    });
    console.error("회원 정보 수정에 실패하였습니다.", error);
  }
};

// 비밀번호 변경
const handlePasswordChange = async () => {
  router.push({ name: "member-changepassword" });
};

// 회원 탈퇴
const handleDelete = async () => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success mx-3",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: "정말 탈퇴하실 건가요??",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "예",
      cancelButtonText: "아니오",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        try {
          const id = loginedId;
          local.put(`/members/delete/${id}`).then(({ data }) => {
            swalWithBootstrapButtons.fire({
              title: "회원 탈퇴가 완료되었습니다.",
              icon: "success",
            });
            logout();
            router.push({ name: "main" });
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            text: "회원 탈퇴에 실패하였습니다.",
          });
          console.err(error);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "취소되었습니다.",
          icon: "error",
        });
      }
    });
};

// 컴포넌트 마운트 시 실행
onMounted(() => {
  loadMemberDetails();
  local.get("/map/sido").then(({ data }) => {
    makeOption(data);
  });
});
</script>

<template>
  <div class="mypage-container">
    <!-- 마이페이지 사이드바 컴포넌트 -->
    <MemberMyPageSidebarVue />
    <div class="content">
      <!-- 프로필 헤더 -->
      <div class="profile-header">
        <!-- 프로필 이미지 -->
        <img :src="member.image" alt="Profile Image" class="profile-image" />
        <!-- 드래그 앤 드롭 영역 -->
        <div
          class="dnd-dropzone p-4 text-center mb-2"
          @dragenter.prevent="handleDragEnter"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': isDragActive }"
        >
          <input
            type="file"
            @change="handleFileChange"
            class="d-none"
            ref="fileInput"
          />
          <div v-if="fileNames.length == 0">
            <p class="mb-0">프로필 사진을 등록하세요</p>
          </div>
          <div
            v-if="fileNames.length > 0"
            class="d-flex justify-content-center"
          >
            <p class="mb-0"><strong>파일명:</strong></p>
            <ul class="list-inline mb-0">
              <p v-for="(name, index) in fileNames" :key="index" class="mb-0">
                {{ name }}
              </p>
            </ul>
          </div>
          <p>
            Drag & Drop or
            <a href="#" @click.prevent="triggerFileInput">upload</a>
          </p>
        </div>
        <!-- 프로필 상세 입력 필드 -->
        <div class="profile-details">
          <input v-model="member.nickname" type="text" placeholder="닉네임" />
          <input v-model="member.mbti" type="text" placeholder="MBTI" />
        </div>
      </div>
      <!-- 상세 회원 정보 폼 -->
      <form class="member-details-form">
        <div class="form-group">
          <label for="name">이름</label>
          <input
            v-model="member.name"
            type="text"
            id="name"
            placeholder="이름"
          />
        </div>
        <div class="form-group">
          <label for="birthdate">생년월일</label>
          <input
            v-model="member.birthdate"
            type="date"
            id="birthdate"
            placeholder="생년월일"
          />
        </div>
        <div class="form-email">
          <label for="email">이메일</label>
          <div style="display: flex">
            <input
              v-model="member.emailId"
              type="text"
              id="email"
              placeholder="이메일"
            />
            <p style="margin: 2px 5px; margin-top: 9px">@</p>
            <input
              v-model="member.emailDomain"
              type="text"
              id="email"
              placeholder="이메일"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="area">지역</label>
          <select
            id="search-area"
            class="form-select"
            style="height: 45px"
            name="sidoCode"
            v-model="member.area"
          >
            <option value="member.area" selected>검색 할 지역 선택</option>
          </select>
        </div>
        <div class="form-group">
          <label for="sex">성별</label>
          <select v-model="member.sex" class="form-select" style="height: 45px">
            <option value="member.sex" selected></option>
            <option value="0">남</option>
            <option value="1">여</option>
          </select>
        </div>
        <div class="form-group">
          <label for="phoneNumber">휴대폰</label>
          <input
            v-model="member.phoneNumber"
            type="text"
            id="phoneNumber"
            placeholder="휴대폰"
          />
        </div>
        <div class="button-group">
          <button type="button" @click="handleUpdate">회원 정보 수정</button>
          <button type="button" @click="handlePasswordChange">
            비밀번호 변경
          </button>
          <button type="button" class="btn btn-secondary" @click="handleDelete">
            회원탈퇴
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* 마이페이지 컨테이너 */
.mypage-container {
  margin-top: 50px; /* 상단 마진 설정 */
  display: flex; /* 플렉스 박스 레이아웃 설정 */
}

/* 컨텐츠 영역 */
.content {
  width: 80%; /* 너비 설정 */
  padding: 20px; /* 패딩 설정 */
}

/* 프로필 헤더 */
.profile-header {
  display: flex; /* 플렉스 박스 레이아웃 설정 */
  align-items: center; /* 수직 정렬 */
  margin-bottom: 20px; /* 하단 마진 설정 */
}

/* 프로필 이미지 */
.profile-image {
  width: 100px; /* 너비 설정 */
  height: 100px; /* 높이 설정 */
  border-radius: 50%; /* 원형으로 설정 */
  margin-right: 15px; /* 우측 마진 설정 */
}

/* 프로필 상세 입력 필드 */
.profile-details input {
  margin-bottom: 10px; /* 하단 마진 설정 */
  padding: 10px; /* 패딩 설정 */
  border: 1px solid #ccc; /* 테두리 설정 */
  border-radius: 4px; /* 테두리 둥글게 설정 */
  width: 100%; /* 너비 100% 설정 */
}

/* 회원 상세 정보 폼 */
.member-details-form {
  display: grid; /* 그리드 레이아웃 설정 */
  grid-template-columns: repeat(2, 1fr); /* 2열 그리드 설정 */
  gap: 20px; /* 그리드 간격 설정 */
}

/* 폼 그룹 */
.form-group {
  display: flex; /* 플렉스 박스 레이아웃 설정 */
  flex-direction: column; /* 세로 정렬 */
}

/* 폼 그룹 레이블 */
.form-group label {
  margin-bottom: 5px; /* 하단 마진 설정 */
}

/* 폼 그룹 입력 필드 */
.form-group input {
  padding: 10px; /* 패딩 설정 */
  border: 1px solid #ccc; /* 테두리 설정 */
  border-radius: 4px; /* 테두리 둥글게 설정 */
  width: 100%; /* 너비 100% 설정 */
}

/* 이메일 입력 필드 */
.form-email input {
  padding: 10px; /* 패딩 설정 */
  border: 1px solid #ccc; /* 테두리 설정 */
  border-radius: 4px; /* 테두리 둥글게 설정 */
  width: 400px; /* 너비 설정 */
}

/* 폼 그룹 선택 필드 */
.form-group select {
  padding: 10px; /* 패딩 설정 */
  border: 1px solid #ccc; /* 테두리 설정 */
  border-radius: 4px; /* 테두리 둥글게 설정 */
  width: 100%; /* 너비 100% 설정 */
}

/* 버튼 그룹 */
.button-group {
  grid-column: span 2; /* 그리드 컬럼 span 설정 */
  display: flex; /* 플렉스 박스 레이아웃 설정 */
  justify-content: left; /* 왼쪽 정렬 */
}

/* 버튼 스타일 */
.button-group button {
  padding: 10px 20px; /* 패딩 설정 */
  border: none; /* 테두리 없음 */
  border-radius: 4px; /* 테두리 둥글게 설정 */
  cursor: pointer; /* 커서 포인터로 변경 */
}

/* 첫 번째 버튼 스타일 */
.button-group button:nth-child(1) {
  background-color: #5698ad; /* 배경색 설정 */
  color: white; /* 글자색 흰색 */
  margin-right: 5px; /* 오른쪽 마진 설정 */
}

/* 두 번째 버튼 스타일 */
.button-group button:nth-child(2) {
  background-color: #577b8d; /* 배경색 설정 */
  color: white; /* 글자색 흰색 */
  margin-left: 5px; /* 왼쪽 마진 설정 */
  margin-right: 5px; /* 오른쪽 마진 설정 */
}

/* 세 번째 버튼 스타일 */
.button-group button:nth-child(3) {
  /* background-color: #dc3545; */
  /* color: white; */
  margin-left: 5px; /* 왼쪽 마진 설정 */
  margin-right: 5px; /* 오른쪽 마진 설정 */
}

/* 드래그 앤 드롭 존 */
.dnd-dropzone {
  border: 2px dashed #ccc; /* 테두리 설정 */
  border-radius: 5px; /* 테두리 둥글게 설정 */
  padding: 20px; /* 패딩 설정 */
  margin-right: 15px; /* 오른쪽 마진 설정 */
  height: 100px; /* 높이 설정 */
}

/* 드래그 앤 드롭 존 (드래그 중) */
.dnd-dropzone.drag-over {
  background-color: #e0f7ff; /* 배경색 설정 */
}
</style>
