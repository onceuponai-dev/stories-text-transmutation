<script lang="ts">
import { defineComponent, ref, onMounted, onUpdated } from 'vue';

import Assistant from '@/llmcommon';
import { parseMarkdown, highlight } from '@/mdcommon';
import { getCookie, parseBool, setCookie } from '@/common';

// @ts-ignore
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
// @ts-ignore
import * as python from 'monaco-editor/esm/vs/basic-languages/python/python'

import { asyncRun, formatCode, init_code } from '@/pycommon';


export default defineComponent({
  name: 'Editor',

  props: {
  },
  watch: {
  },
  setup(props, { emit }) {

    const editor: any = ref(null);
    const editorCreated: any = ref(false);

    const running: any = ref(false);
    const loading = ref(true);

    const results: any = ref("");
    const error: any = ref("");
    const done: any = ref(false);

    const assistantDialog = ref(false);
    const assistantEnabled = ref(false);
    const assistant = new Assistant()
    const assistantConversation: any = ref([]);
    const assistantModel: any = ref("TinyLlama-1.1B-python-v0.1-q4f32_0");

    const assistantChange = async () => {
      await assistant.reload(assistantModel.value);
      assistantEnabled.value = true;
      assistantDialog.value = false;
    }

    const showAssistantDialog = () => {
      assistantDialog.value = true;
    }

    function runCode(code: any) {
      loading.value = true;
      return asyncRun(code, {}).then((data: any) => {
        loading.value = false;
        return data;
      }).catch(err => {
        console.log(err);
      });
    }

    function runCell() {
      let code_value = monaco.editor.getEditors()[0]?.getModel()?.getValue();
      if (!code_value) {
        return;
      }

      let code = formatCode(code_value);
      running.value = true;
      asyncRun(code, {}).then((data: any) => {
        results.value = data.results;
        error.value = data.error;
        running.value = false;
        done.value = true;
      }).catch(err => {
        console.log(err);
        error.value = err;
        results.value = "";
        running.value = false;
        done.value = true;
      });
    }

    function runInitCode(code: string) {
      return runCode(code);
    }

    onMounted(() => {
      runCode(init_code);
      if (!editorCreated.value) {
        editorCreated.value = true;
        monaco.languages.register({ id: "python" });
        monaco.languages.setMonarchTokensProvider('python', python.language);
        monaco.editor.create(editor.value, {
          value: "print('Hello, world!')",
          language: 'python',
          // theme: "vs-dark",
          contextmenu: false
        })
      }

    });

    onUpdated(() => {
    });

    const explainCode = async () => {
      let code_value = monaco.editor.getEditors()[0]?.getModel()?.getValue() ?? "";
      let len = assistantConversation.value.length;
      const conversationItem = {
        id: `assistant-conversation-${len}`,
        prompt: highlight(code_value),
        response: "",
        type: "explain"
      };
      assistantConversation.value.push(conversationItem);
      let response = await assistant.explain(code_value, conversationItem.id);
      console.log(response);
      assistantConversation.value[len].response = response;
    }

    return {
      loading,
      parseMarkdown,
      runCode,
      runCell,
      highlight,
      assistantEnabled,
      assistantChange,
      assistantConversation,
      explainCode,
      assistant,
      assistantModel,
      assistantDialog,
      showAssistantDialog,
      running,
      done,
      results,
      error,
      editor
    };
  }
});
</script>

<template>
  <v-card>
    <v-container>
      <v-row justify="center">

        <v-col cols="1" sm="1"></v-col>
        <v-col cols="7" sm="7">
          <v-select label="Assistant Model" v-model="assistantModel" :items="assistant.modelList()" variant="outlined">
          </v-select>
        </v-col>
        <v-col cols="4" sm="4">
          <v-btn :color="assistantEnabled ? 'green' : 'black'" @click="assistantChange" size="x-large" variant="text"
            :prepend-icon="assistantEnabled ? 'mdi-lightbulb-on-outline' : 'mdi-lightbulb-outline'" class="main-title">
            Load
          </v-btn>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="10" sm="10">
          <label id="init-label"> </label>
        </v-col>
      </v-row>
      <br />
      <v-divider></v-divider>
      <br />
      <v-row justify="center" v-if="assistantEnabled" v-for="conversationItem in assistantConversation">
        <v-col cols="1" sm="1" align="end">
          <v-btn variant="text" v-show="assistantEnabled" :icon="'mdi-account'" size="small"></v-btn>
        </v-col>
        <v-col cols="10" sm="10">
          <label v-if="conversationItem.type == 'explain'">Explain code:</label>
          <pre class="pre-container" v-html="conversationItem.prompt" v-if="conversationItem.type == 'explain'"></pre>
        </v-col>
        <v-col cols="1" sm="1" align="end"></v-col>
        <v-col cols="1" sm="1" align="end">
          <v-btn variant="text" v-show="assistantEnabled" :icon="'mdi-lightbulb-on-outline'" size="small"></v-btn>
        </v-col>
        <v-col cols="10" sm="10">
          <label :id="conversationItem.id" v-html="parseMarkdown(conversationItem.response)"></label>
        </v-col>
        <v-col cols="1" sm="1" align="end"></v-col>
      </v-row>

      <v-row justify="center">
        <br />
        <v-col cols="1" sm="1" align="end">
          <v-btn v-show="!running" @click="runCell()" :icon="done ? 'mdi-check' : 'mdi-arrow-right-drop-circle-outline'"
            size="small"></v-btn>
          <v-progress-circular v-show="running" indeterminate color="blue"></v-progress-circular>
          <v-btn variant="text" color="green" v-show="assistantEnabled" @click="explainCode()"
            :icon="'mdi-lightbulb-on-outline'" size="small"></v-btn>
        </v-col>

        <v-col cols="11" sm="11">
          <div id="editor" ref="editor"></div>
        </v-col>
        <br />
        <v-col cols="12" sm="12">
          <div class="results-container" v-html="results"></div>
          <v-card outlined color="red-lighten-3" v-if="error">
            <v-card-title class="error--text">
              Error
            </v-card-title>
            <v-card-text class="error--text">{{ error }}
            </v-card-text>
          </v-card>
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
</style>
