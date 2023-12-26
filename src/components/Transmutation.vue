<script lang="ts">
import { defineComponent, ref, onMounted, onUpdated } from 'vue';
import { forward } from '@/mlmodel';
import { PCA } from 'ml-pca';

// @ts-ignore
import * as Papa from 'papaparse';

// @ts-ignore
import * as d3 from 'd3';


export default defineComponent({
  name: 'Transmutation',
  setup() {

    const sentence: any = ref(null);
    const sentences: any = ref([]);
    const embeddings: any = ref({});
    const embarr: any = ref([]);
    const csvData: any = ref(null);

    sentence.value = "The quick brown fox jumps over the lazy dog";

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

    const parseCSV = (file: any) => {
      Papa.parse(file, {
        complete: (results: any) => {
          let csvData = transformToColumns(results.data)[0];
          getEmbeddings(csvData);
          //this.csvHeaders = results.meta.fields;
        },
        header: false,
      });
    };

    function exampleCsv() {
      let url = "/data/example.csv";
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

    const calculatePCA = (embeddings: any) => {
      let pca = new PCA(embeddings);
      return pca.predict(embeddings, { nComponents: 2 });
    }

    const drawEmbeddings = (reducedData: any) => {
      const svg = d3.select('#svgContainer').append('svg')
        .attr('width', 800)
        .attr('height', 600);

      const xScale = d3.scaleLinear()
        .domain([d3.min(reducedData, (d: any[]) => d[0]), d3.max(reducedData, (d: any[]) => d[0])])
        .range([0, 800]);

      const yScale = d3.scaleLinear()
        .domain([d3.min(reducedData, (d: any[]) => d[1]), d3.max(reducedData, (d: any[]) => d[1])])
        .range([600, 0]);

      svg.selectAll('.dot')
        .data(reducedData)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', (d: any[]) => xScale(d[0]))
        .attr('cy', (d: any[]) => yScale(d[1]))
        .attr('r', 5);

    }

    const getEmbeddings = (sentences: any) => {
      console.log(sentences);
      forward(sentences).then((result: any) => {
        let emb = result.results
        let reducedData = calculatePCA(emb);
        console.log(reducedData);
        drawEmbeddings(reducedData);
      }).catch(err => {
        console.log(err);
      });;
    }

    const addSentence = () => {
      console.log("addSentence " + sentence.value);
      sentences.value.push(sentence.value);
      getEmbeddings(sentence.value);
      sentence.value = "";
    };

    onMounted(() => {

    });

    onUpdated(() => {
    });

    return {
      embeddings,
      sentences,
      sentence,
      addSentence,
      onDrop,
      exampleCsv
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
            <v-card-text class="text-center">Drag and drop a CSV file here</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="auto">
          <v-btn size="large" @click="exampleCsv">Read example file</v-btn>
        </v-col>
      </v-row>
      <!--
    <v-row align="center" no-gutters v-for="sentence in sentences">
        <br />
        <v-col cols="1" sm="1" align="end" />
        <v-col cols="10" sm="10">
          <pre class="pre-container" v-html="sentence" />
        </v-col>
      </v-row>

      <v-row align="center" no-gutters>

        <v-col cols="1" sm="1" align="end" />
        <v-col cols="10" sm="10">
          <v-text-field ref="editor" v-model="sentence" color="green" density="compact" variant="solo"
            append-inner-icon="mdi-plus" single-line hide-details @click:append-inner="addSentence()"
            v-on:keydown.enter.capture.prevent.stop="addSentence()"></v-text-field>
        </v-col>
      

        <br />
      </v-row>
    -->


      <v-row>
        <v-col cols="10" sm="10">
          <div id="svgContainer"></div>
        </v-col>
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
  background-color: #f5f5f5;
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
  height: 200px;
  background-color: #f5f5f5;
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
