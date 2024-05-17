import { reactive, computed } from "vue";
import { jwtDecode } from "jwt-decode";

const state = reactive({
  isAuthenticated: !!localStorage.getItem("accessToken"), // 토큰이 있는지 여부로 초기 로그인 상태 설정
});

const isAuthenticated = computed(() => state.isAuthenticated);

function login() {
  state.isAuthenticated = true;
}

function logout() {
  state.isAuthenticated = false;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

const loginedId = null;
const decodedTokenFunc = () => {
  const decodedToken = jwtDecode(token);
  loginedId = decodedToken.memberId;
};

export { isAuthenticated, login, logout, loginedId, decodedTokenFunc };
