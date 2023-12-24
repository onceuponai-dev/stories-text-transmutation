<script lang="ts">
import { defineComponent, ref, onMounted, onUpdated } from 'vue';
import { forward } from '@/mlmodel';


export default defineComponent({
  name: 'Transmutation',
  setup() {

    const sentence: any = ref(null);
    const embeddings: any = ref(null);


    sentence.value = "The quick brown fox jumps over the lazy dog";

    const getEmbeddings = async () => {
      console.log("getEmbeddings " + sentence.value);
      forward([sentence.value]).then((result: any) => {
        console.log("result " + result);
        embeddings.value = result;
      }).catch(err => {
        console.log(err);
      });;
    }

    onMounted(() => {

    });

    onUpdated(() => {
    });

    return {
      embeddings,
      sentence,
      getEmbeddings
    };
  }
});
</script>

<template>
  <v-card>
    <v-container>
      <br />

      <v-row justify="center">
        <v-col cols="10" sm="10">
          <label v-html="embeddings"></label>
        </v-col>
        <v-col cols="1" sm="1" align="end"></v-col>
      </v-row>

      <v-row align="center" no-gutters>
        <br />
        <v-col cols="1" sm="1" align="end" />
        <v-col cols="10" sm="10">
          <br />
          <v-text-field ref="editor" v-model="sentence" color="green"  density="compact"
            variant="solo" append-inner-icon="mdi-send" single-line hide-details @click:append-inner="getEmbeddings()"
            v-on:keydown.enter.capture.prevent.stop="getEmbeddings()"></v-text-field>
        </v-col>
        <br />
      </v-row>

    </v-container>
  </v-card>
</template>

<style scoped>
.code-container {
  font-family: monospace, monospace;
}

.pre-container {
  padding: 15px 16px;
  border-color: -internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));
  background-color: #F6F6F6;
  font-family: monospace, monospace;
  margin-bottom: 22px;
}


.results-container {
  font-family: monospace, monospace;
}

.markdown-container {}

.toolbar-switch {
  margin-top: 20px;
  width: 45px;
  font-size: 5px;
}

#editor {
  /* width: 40dvw; */
  height: 200px;
}

.results-container {
  margin-left: 10%;
}

.swanky-text {
  font-family: 'Fontdiner Swanky' !important;
  font-size: 20px;
  line-height: 1.5;
}

.position-absolute {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
