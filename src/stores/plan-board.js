import { ref } from "vue";
import { defineStore } from "pinia";

export const usePlanBoardStore = defineStore("planBoard", () => {
  const planBoardArticle = ref();

  const setArticle = (id) => {
    console.log("hi");
    // local.get("shareplan/detail/" + id).then(({ data }) => {
    //   console.log(data);
    // });
  };

  return { planBoardArticle, setArticle };
});
