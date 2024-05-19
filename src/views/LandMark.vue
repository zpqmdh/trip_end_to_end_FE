<template>
  <div class="landmark-detection">
    <h1>Landmark Detection</h1>
    <form @submit.prevent="handleSubmit">
      <input type="file" @change="handleFileChange" />
      <button type="submit">Upload and Detect</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <div v-if="landmarks.length > 0">
      <h2>Detected Landmarks:</h2>
      <ul>
        <li v-for="(landmark, index) in landmarks" :key="index">
          {{ landmark }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { localAxios } from "@/util/http-commons";

const local = localAxios();
const file = ref(null);
const landmarks = ref([]);
const error = ref("");

function handleFileChange(event) {
  file.value = event.target.files[0];
}

async function handleSubmit() {
  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const response = await local.post("/detectLandmark", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    landmarks.value = response.data;
  } catch (err) {
    error.value = "Error detecting landmarks. Please try again.";
  }
}
</script>

<style scoped>
.landmark-detection {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
.error {
  color: red;
}
</style>
