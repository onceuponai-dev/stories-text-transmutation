<script lang="ts">
import Transmutation from './components/Transmutation.vue'
import { defineComponent, ref, onMounted, onUpdated } from 'vue';
import { getCookie, parseBool, setCookie } from './common';

export default defineComponent({
  name: 'App',
  components: {
    Transmutation
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
    };
  }
});
</script>

<template>
  <v-container>
    <br />
    <v-row justify="center">
      <v-col cols="12" sm="12">
        <div class="text-h4 text-center font-weight-bold main-title" v-html="'Text Transmutation'"></div>
      </v-col>
    </v-row>
    <v-row justify="center">

      <v-col cols="12" sm="12">
        <img src="/images/text-transmutation.png" width="270" class="center-image" />
      </v-col>
    </v-row>
    <br />
    <v-row justify="center">
      <v-col cols="12" sm="10">
        <Transmutation></Transmutation>
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
