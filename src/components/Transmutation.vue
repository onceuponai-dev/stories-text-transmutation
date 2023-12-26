<script lang="ts">
import { defineComponent, ref, onMounted, onUpdated } from 'vue';
import { forward, cosineSimilarity } from '@/mlmodel';

type Embedding = any[]
// @ts-ignore
import * as Papa from 'papaparse';

export default defineComponent({
  name: 'Transmutation',
  setup() {

    const loading: any = ref(false);
    const loaded: any = ref(false);
    const showDialog: any = ref(false);
    const dialogSentence: any = ref(null);
    const sentence: any = ref(null);
    const sentences: any = ref([]);
    const mostSimilarId: any = ref(null);
    sentence.value = "Potion of Liquid Starlight";

    function transformToColumns(data: any[]): Record<string, string[]> {
      const columns: Record<string, string[]> = {};
      data.forEach((row, rowIndex) => {
        if (rowIndex === 0) {
          for (const key in row) {
            columns[key] = [];
          }
        }

        for (const key in row) {
          columns[key].push(row[key]);
        }
      });

      return columns;
    }

    function parseCSV(file: any) {
      Papa.parse(file, {
        complete: async (results: any) => {
          loading.value = true;
          let csvData = transformToColumns(results.data)[0];
          let embeddings = await getEmbeddings(csvData);
          sentences.value = csvData.map((v: string, i: number) => { return { text: v, similarity: 0, embedding: embeddings[i] }; });
          loading.value = false;
          loaded.value = true;
          //this.csvHeaders = results.meta.fields;
        },
        header: false,
      });
    };

    function exampleCsv() {
      let url = "data/example.csv";
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then(csvText => {
          parseCSV(csvText);
        })
        .catch(error => {
          console.error('Fetching and parsing CSV failed:', error);
        });
    }

    const onDrop = (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        parseCSV(file);
      }
    };

    async function getEmbeddings(sentences: any): Promise<Embedding[]> {
      let result: any = await forward(sentences);
      return result.results;
    }


    function showEmbeddings(sentence: any) {
      dialogSentence.value = sentence;
      showDialog.value = true
    }

    async function search(sentence: string) {
      console.log("search" + sentence);
      let searchEmbedding = (await getEmbeddings([sentence]))[0];
      let highestSimilarity = -1;
      let mostSimilarSentence: string = "";

      sentences.value.forEach((sentence: any, index: number) => {
        const similarity = cosineSimilarity(searchEmbedding, sentence.embedding);
        sentence.similarity = similarity;
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          mostSimilarSentence = sentence.text;
        }
      });

      sentences.value = sentences.value.sort((a: any, b: any) => b.similarity - a.similarity);

      console.log(mostSimilarSentence);

    };

    onMounted(() => {

    });

    onUpdated(() => {
    });

    return {
      sentences,
      sentence,
      search,
      onDrop,
      exampleCsv,
      loading,
      loaded,
      showEmbeddings,
      showDialog,
      dialogSentence
    };
  }
});
</script>

<template>
  <v-card>
    <v-container>
      <br />
      <v-row justify="center">
        <v-col cols="12" sm="12" md="12">
          <v-card class="pa-2" outlined tile @drop.prevent="onDrop" @dragover.prevent @dragenter.prevent>
            <v-card-text class="text-center">Drag and drop a file here (sentence per line)</v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="12" md="12" align="center">
          OR
        </v-col>


        <v-col cols="12" sm="12" md="12" align="center">
          <v-btn size="large" @click="exampleCsv">Read example recipes</v-btn>
        </v-col>



      </v-row>
      <br />


      <v-divider></v-divider>
      <br />
      <v-row align="center" v-if="loading">
        <v-col cols="12" sm="12" md="12">
          <v-progress-linear color="deep-purple-accent-4" striped indeterminate rounded height="10">
          </v-progress-linear>
        </v-col>

      </v-row>
      <v-row align="center" no-gutters v-if="loaded">
        <v-col cols="1" sm="1" align="end" />
        <v-col cols="10" sm="10">
          <v-text-field v-model="sentence" color="green" density="compact" variant="solo" append-inner-icon="mdi-magnify"
            single-line hide-details @click:append-inner="search(sentence)"
            v-on:keydown.enter.capture.prevent.stop="search(sentence)"></v-text-field>
        </v-col>
        <br />
      </v-row>
      <br />
      <v-divider></v-divider>

      <v-table v-if="loaded">
        <thead>
          <tr>
            <th class="text-left">
              Sentence
            </th>
            <th class="text-left">
              Similarity
            </th>
            <th class="text-left">
              Embeddings
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sentence in sentences" align="left">
            <td>{{ sentence.text }}</td>
            <td>{{ sentence.similarity }}</td>
            <td>
              <v-btn @click="showEmbeddings(sentence)">Show</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

    </v-container>
  </v-card>

  <v-dialog width="auto" v-model="showDialog">
    <v-toolbar dark color="primary">
      <v-btn icon dark @click="showDialog = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ dialogSentence.text }}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-card>
      <v-card-text>
        {{ dialogSentence.embedding }}
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.code-container {
  font-family: monospace, monospace;
}

.pre-container {
  padding: 15px 16px;
  border-color: -internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));
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

.pa-2 {
  height: 100px;
  background-color: #f5f5f5;
}

.main-title {
  font-family: 'Fontdiner Swanky' !important;
  line-height: 1.5;
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
