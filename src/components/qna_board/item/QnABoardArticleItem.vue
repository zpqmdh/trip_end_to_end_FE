<script setup>
defineProps({ article: Object });
</script>
<template>
  <tr class="text-center">
    <td>{{ article.qnaBoardId }}</td>
    <td>
      <router-link
        :to="{
          name: 'qna-detail',
          params: { id: article.qnaBoardId },
        }"
        >{{ article.subject }}</router-link
      >
    </td>
    <td>{{ article.memberId }}</td>
    <td>{{ article.hit }}</td>
    <td>{{ article.registerTime }}</td>
  </tr>
</template>
