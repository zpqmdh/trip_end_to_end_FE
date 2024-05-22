<script setup>
import { onMounted, ref } from "vue";
import { localAxios } from "@/util/http-commons.js";
import { useRoute, useRouter } from "vue-router";
import { decodedTokenFunc } from "@/util/auth";

const local = localAxios();
const route = useRoute();
const router = useRouter();

const notice = ref({});
const member = ref({});
onMounted(() => {
  getDetail(route.params.id);
  getMember();
});

const getDetail = (id) => {
  local.get("/notice/" + id).then(({ data }) => {
    console.log(data);
    notice.value = data;
  });
};
const getMember = () => {
  const loginedId = decodedTokenFunc();
  local.get(`/members/detail/${loginedId}`).then(({ data }) => {
    member.value = data;
    console.log(member.value);
  });
};

const mvList = () => {
  router.push({ name: "notice-list" });
};
const mvModify = () => {
  router.push({ name: "notice-modify", params: { id: notice.value.noticeBoardId } });
};
const deleteArticle = () => {
  const flag = confirm("정말 삭제하시겠습니까?");
  if (!flag) return;
  const id = route.params.id;
  local.delete("/notice/" + id).then(({ data }) => {
    console.log(data);
    router.push({ name: "notice-list" });
  });
};
</script>

<template>
  <div class="d-flex justify-content-center mt-3">
    <h1>📢 공지사항</h1>
  </div>
  <div class="container">
    <div class="d-flex justify-content-center">
      <h2>{{ notice.subject }}</h2>
    </div>
    <hr />
    <div class="meta">
      <span class="author">👤 작성자: {{ notice.nickname }}</span>
      <span class="divider">|</span>
      <span class="views">👁 조회수: {{ notice.hit }}</span>
      <span class="divider">|</span>
      <span class="time">🕒 {{ notice.registerTime }}</span>
    </div>
    <div class="content">{{ notice.content }}</div>
    <div class="col-auto text-end">
      <button id="btn-list" type="button" class="btn mb-3" @click="mvList">목록으로</button>
      <template v-if="member.type == 3">
        <button id="btn-modify" type="button" class="btn mb-3" @click="mvModify">수정하기</button>
        <button id="btn-delete" type="button" class="btn mb-3" @click.prevent="deleteArticle">
          삭제하기
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

h2 {
  font-size: 30px;
  margin-bottom: 10px;
}

hr {
  border: none;
  border-top: 1px solid #ccc;
  margin-bottom: 20px;
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

.content {
  font-size: 20px;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 100px;
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
</style>
