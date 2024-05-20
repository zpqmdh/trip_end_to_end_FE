import { createRouter, createWebHistory } from "vue-router";
import TheMainView from "@/views/TheMainView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "main",
      component: TheMainView,
    },
    {
      path: "/chat",
      name: "chat",
      component: () => import("@/components/common/ChatBot.vue"),
    },
    {
      path: "/landmark",
      name: "landmark",
      component: () => import("@/views/LandMark.vue"),
    },
    {
      path: "/member",
      name: "member",
      component: () => import("@/views/TheMemberView.vue"),
      children: [
        {
          path: "login",
          name: "member-login",
          component: () => import("@/components/member/MemberLogIn.vue"),
        },
        {
          path: "mypage",
          name: "member-mypage",
          component: () => import("@/components/member/MemberMyPage.vue"),
        },
        {
          path: "myboard",
          name: "member-myboard",
          component: () => import("@/components/member/MemberMyBoard.vue"),
        },
        {
          path: "signup",
          name: "member-signup",
          component: () => import("@/components/member/MemberSignUp.vue"),
        },
        {
          path: "findpassword",
          name: "member-findpassword",
          component: () => import("@/components/member/MemberFindPassword.vue"),
        },
        {
          path: "changepassword",
          name: "member-changepassword",
          component: () =>
            import("@/components/member/MemberChangePassword.vue"),
        },
      ],
    },
    {
      path: "/plan",
      name: "plan",
      component: () => import("@/views/ThePlanView.vue"),
      children: [
        {
          path: "write",
          name: "plan-write",
          component: () => import("@/components/plan/PlanWrite.vue"),
        },
        {
          path: "list",
          name: "plan-list",
          component: () => import("@/components/plan/PlanList.vue"),
        },
        {
          path: "modify/:id",
          name: "plan-modify",
          component: () => import("@/components/plan/PlanModify.vue"),
        },
        {
          path: "detail/:id",
          name: "plan-detail",
          component: () => import("@/components/plan/PlanDetail.vue"),
        },
      ],
    },
    {
      path: "/notice",
      name: "notice",
      component: () => import("@/views/TheNoticeBoardView.vue"),
      children: [
        {
          path: "write",
          name: "notice-write",
          component: () =>
            import("@/components/notice_board/NoticeBoardWrite.vue"),
        },
        {
          path: "list",
          name: "notice-list",
          component: () =>
            import("@/components/notice_board/NoticeBoardList.vue"),
        },
        {
          path: "detail/:id",
          name: "notice-detail",
          component: () =>
            import("@/components/notice_board/NoticeBoardDetail.vue"),
        },
        {
          path: "modify/:id",
          name: "notice-modify",
          component: () =>
            import("@/components/notice_board/NoticeBoardModify.vue"),
        },
      ],
    },
    {
      path: "/qna",
      name: "qna",
      component: () => import("@/views/TheQnABoardView.vue"),
      children: [
        {
          path: "list",
          name: "qna-list",
          component: () => import("@/components/qna_board/QnABoardList.vue"),
        },
        {
          path: "write",
          name: "qna-write",
          component: () => import("@/components/qna_board/QnABoardWrite.vue"),
        },
        {
          path: "detail/:id",
          name: "qna-detail",
          component: () => import("@/components/qna_board/QnABoardDetail.vue"),
        },
        {
          path: "modify/:id",
          name: "qna-modify",
          component: () => import("@/components/qna_board/QnABoardModify.vue"),
        },
      ],
    },
    {
      path: "/shareplan",
      name: "share-plan",
      component: () => import("@/views/ThePlanBoardView.vue"),
      children: [
        {
          path: "list",
          name: "share-plan-list",
          component: () => import("@/components/plan_board/PlanBoardList.vue"),
        },
        {
          path: "write",
          name: "share-plan-write",
          component: () => import("@/components/plan_board/PlanBoardWrite.vue"),
        },
        {
          path: "detail/:id",
          name: "share-plan-detail",
          component: () =>
            import("@/components/plan_board/PlanBoardDetail.vue"),
        },
        {
          path: "modify/:id",
          name: "share-plan-modify",
          component: () =>
            import("@/components/plan_board/PlanBoardModify.vue"),
        },
      ],
    },
  ],
});

const passedPaths = [
  "/",
  "/main",
  "/member/login",
  "/member/signup",
  "/member/findpassword",
]; // 보호된 경로 배열

router.beforeEach((to, from, next) => {
  if (passedPaths.includes(to.path)) {
    next();
  } else {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("access token이 없습니다.");
    } else {
      next();
    }
  }
});
export default router;
