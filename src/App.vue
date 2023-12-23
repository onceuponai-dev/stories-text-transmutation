<script lang="ts">
import axios from 'axios';
import Notebook from '@/nbcommon';
import Thumbellama from './components/Thumbellama.vue'
import { defineComponent, ref, onMounted, onUpdated } from 'vue';
import { parseMarkdown, highlight } from '@/mdcommon';
import { getCookie, parseBool, setCookie } from './common';
import { asyncRun, formatCode, init_code } from '@/pycommon';

export default defineComponent({
  name: 'App',
  components: {
    Thumbellama
  },
  setup(props, { emit }) {

    const cookieConsentKey = "cookie-consent";
    const cookieConsentBanner = ref(true);

    function acceptCookie() {
      setCookie(cookieConsentKey, "true", 365);
      cookieConsentBanner.value = false;
    }

    onMounted(() => {
      cookieConsentBanner.value = !parseBool(getCookie(cookieConsentKey));
    });


    return {
      cookieConsentBanner,
      acceptCookie,
      parseMarkdown,
    };
  }
});
</script>

<template>
  <v-container>
    <br />
    <v-row justify="center">
      <v-col cols="12" sm="12">
        <div class="text-h4 text-center font-weight-bold main-title" v-html="'Thumbellama'"></div>
      </v-col>
    </v-row>
    <v-row justify="center">

      <v-col cols="12" sm="12">
        <img src="/images/thumbellama55.png" width="200" class="center-image" />
      </v-col>
    </v-row>
    <br />
    <v-row justify="center">
      <v-col cols="12" sm="10">
        <Thumbellama></Thumbellama>
      </v-col>
    </v-row>
  </v-container>
  <br />
  <footer>
    <v-row justify="center" no-gutters>
      <img src="/images/logo200.png" width="100" />
    </v-row><br />
    <v-row justify="center" no-gutters>

      <v-btn class="mx-2" rounded="xl" href="https://www.onceuponai.dev">HOME</v-btn>
      <v-btn class="mx-2" rounded="xl" href="https://www.onceuponai.dev/cheatsheets/index.html">CHEATSHEETS</v-btn>
      <v-btn class="mx-2" rounded="xl" href="https://www.onceuponai.dev/#/terms">TERMS</v-btn>
      <v-col class="text-center mt-4" cols="12">
        <strong>© {{ new Date().getFullYear() }} <strong></strong>onceuponai.dev</strong>
      </v-col>
    </v-row>
  </footer>

  <v-snackbar v-model="cookieConsentBanner" color="white">
    🍪 We use cookies to enhance your experience on our site.
    By clicking OK or continuing to use our site, you agree that these cookies can be placed.
    <template v-slot:actions>
      <v-btn color="blue" variant="text" @click="acceptCookie">
        OK
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.main-title {
  font-family: 'Fontdiner Swanky' !important;
  line-height: 1.5;
}

.center-image {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
