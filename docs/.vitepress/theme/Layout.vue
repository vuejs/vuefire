<template>
  <ParentLayout>
    <template #navbar-search>
      <AlgoliaSearchBox :options="$site.themeConfig.algolia" />
    </template>
    <template #page-top>
      <CarbonAds
        v-if="$site.themeConfig.carbonAds"
        :key="'carbon' + $page.path"
        :code="$site.themeConfig.carbonAds.carbon"
        :placement="$site.themeConfig.carbonAds.placement"
      />
    </template>
    <!-- <template #page-bottom>
      <BuySellAds
        v-if="$site.themeConfig.carbonAds"
        :key="'custom' + $page.path"
        :code="$site.themeConfig.carbonAds.custom"
        :placement="$site.themeConfig.carbonAds.placement"
      />
    </template> -->
  </ParentLayout>
</template>

<script>
import DefaultTheme from 'vitepress/dist/client/theme-default'
import CarbonAds from './components/CarbonAds.vue'
import BuySellAds from './components/BuySellAds.vue'
import AlgoliaSearchBox from './components/AlgoliaSearchBox.vue'

export default {
  name: 'Layout',

  components: {
    ParentLayout: DefaultTheme.Layout,
    CarbonAds,
    BuySellAds,
    AlgoliaSearchBox,
  },
}
</script>

<style>
form {
  margin-block-end: 0;
}
.custom-blocks {
  overflow-x: auto;
}

form {
  margin-block-end: 0;
}

.custom-blocks {
  overflow-x: auto;
}

.reset-button {
  /* reset button style */
  border: none;
  padding: 0;
  margin: 0;
  width: auto;
  overflow: visible;
  background: transparent;
  color: inherit;
  font: inherit;
}

.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}

blockquote.warning {
  background-color: rgba(255, 229, 100, 0.3);
  border-color: #e7c000;
  color: #6b5900;
}
</style>
