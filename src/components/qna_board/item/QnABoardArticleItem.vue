<script setup>
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

// QnABoardList.vue에서 props로 article 받기
const prop = defineProps({ article: Object });

const router = useRouter();

// 상세 게시글로 이동
const mvDetail = (id) => {
  // 만약 비밀글이라면
  if (prop.article.secret != 0) {
    Swal.fire({
      title: "🔒 비밀번호가 설정된 게시글입니다.",
      text: "비밀번호를 입력해주세요",
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "확인",
      showLoaderOnConfirm: true,
      preConfirm: (password) => {
        // 입력한 비밀번호와 게시글의 비밀번호가 일치하는지 판단
        if (password == prop.article.password) {
          // 일치하면 세부 페이지로 이동
          Swal.fire({
            icon: "success",
            title: "확인되었습니다.",
          });
          router.push({ name: "qna-detail", params: { id: id } });
        } else {
          // 일치하지 않는다면 이동 X
          Swal.fire({
            icon: "error",
            title: "비밀번호가 일치하지 않습니다",
          });
        }
      },
    });
  } else {
    // 비밀글이 아닐 때는 세부 페이지로 바로 이동
    router.push({ name: "qna-detail", params: { id: id } });
  }
};
</script>
<template>
  <tr class="text-center">
    <td>{{ article.qnaBoardId }}</td>
    <td>
      <!-- 비밀글일 때 자물쇠 이미지 -->
      <template v-if="article.secret != 0"
        ><img
          src="@/assets/img/lock.png"
          style="height: 20px; width: auto; margin-right: 3px"
      /></template>
      <!-- 제목: 누르면 세부 페이지 -->
      <a href="#" @click="mvDetail(article.qnaBoardId)" id="subject">{{
        article.subject
      }}</a>
      <!-- 해당 게시글에 답글이 달렸다면 "답변완료" 태그 표시 -->
      <template v-if="article.isAnswered != 0"
        ><button id="comment-state" class="btn" disabled>답변완료</button>
      </template>
    </td>
    <td>{{ article.hit }}</td>
    <td>{{ article.nickname }}</td>
    <td>{{ article.registerTime }}</td>
  </tr>
</template>
<style scoped>
#subject {
  text-decoration: none;
  color: black;
}
#subject:hover {
  color: #577b8d;
}
#comment-state {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: #fff;
  background-color: #577b8d;
  margin-left: 3px;
  border-radius: 10px;
}
</style>
