<template>
  <div class="tab-container" :id="id">
    <nav ref="nav">
      <button
        :id="id + '_rtdb'"
        :class="!selectedTab && 'is-selected'"
        title="Realtime Database example"
        @focus="selectOnFocus(0, $event)"
        @click="select(0)"
        :disabled="disable == 0"
      >
        <rtdb-logo />
      </button>
      <button
        :id="id + '_firestore'"
        :class="selectedTab && 'is-selected'"
        title="Firestore example"
        @focus="selectOnFocus(1, $event)"
        @click="select(1)"
        :disabled="disable == 1"
      >
        <firestore-logo />
      </button>
    </nav>
    <section>
      <!-- the key forces recreation of the slot child instead of reusing it -->
      <keep-alive>
        <div class="tab-content" :key="selectedTab">
          <component :is="$slots.default()[selectedTab]" />
          <!-- <SlotSelector :slot="$slots.default[selectedTab]" /> -->
        </div>
      </keep-alive>
    </section>
  </div>
</template>

<script>
import 'focus-visible'
import RtdbLogo from './RtdbLogo.vue'
import FirestoreLogo from './FirestoreLogo.vue'

const sharedState = {
  selectedTab: 1, // defaults to Firestore examples
}

let id = 0

export default {
  props: {
    id: {
      type: String,
      default: () => `code-example-${id++}`,
    },
    disable: {
      type: String,
    },
  },
  data() {
    return sharedState
  },

  methods: {
    selectOnFocus(i, event) {
      if (!event.relatedTarget || event.relatedTarget.tagName !== 'A') return
      this.selectedTab = i
      // NOTE: only works on Chrome. using $nextTick doesn't change anything
      window.scrollBy(0, -70)
    },

    // select a tab and keep the scroll position
    async select(i) {
      this.selectedTab = i
      const offset = this.$refs.nav.offsetTop - window.scrollY
      await this.$nextTick()
      window.scrollTo(0, this.$refs.nav.offsetTop - offset)
    },
  },

  components: {
    FirestoreLogo,
    RtdbLogo,
    SlotSelector: {
      functional: true,
      render: (h, { props }) => props.slot,
    },
  },
}
</script>

<style>
:root {
  --code-bg-color-lighter: #323232;
  --code-bg-color-lightest: #616161;
}
</style>

<style>
.tab-container > nav {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  height: 2.5rem;
}

.tab-content [class^='language-'] {
  margin-top: 0;
}

@media (max-width: 419px) {
  .tab-container > nav {
    margin: 0 -1.5rem 0;
  }
}

.tab-container > nav > button {
  display: flex;
  align-items: center;
  height: 100%;
  /* padding: 4.6rem 0.7rem 0; */
  padding: 0 0.7rem;
  margin: 0;
  border: solid 1px var(--vp-code-block-bg);
  border-bottom: none;
  /* filter: brightness(1.1); */
  /* background-color: lighten(var(--code-bg-color), 10%); */
  background-color: var(--code-bg-color-lighter);
}

.tab-container > nav > button svg {
  width: 32px;
  height: 32px;
  /* margin-top: -3.5rem; */
  fill: var(--vp-code-block-color);
  /* filter: brightness(0.8); */
}

.tab-container > nav > button:not(:first-child) {
  border-left: none;
}

.tab-container > nav > button:not(:last-child) {
  border-right: none;
}

.tab-container > nav > button:first-child {
  border-radius: 6px 0 0;
}

.tab-container > nav > button:last-child {
  border-radius: 0 6px 0 0;
}

.tab-container > nav > button:not([disabled]):hover {
  cursor: pointer;
  /* background-color: lighten(var(--code-bg-color), 30%); */
  background-color: var(--code-bg-color-lightest);
  /* filter: brightness(1.3); */
}

.tab-container > nav > button:not([disabled]):hover svg {
  fill: var(--vp-code-block-color);
}

.tab-container > nav > button:not([disabled]):hover svg {
  fill: var(--vp-code-block-color);
}

.tab-container > nav > button svg {
  opacity: 0.7;
}
.tab-container > nav > button.is-selected svg {
  opacity: 1;
}

.tab-container > nav > button[disabled] {
  /* border-color: lighten(var(--vp-code-block-bg), 60%); */
  border-color: var(--vp-code-block-bg);
  /* filter: brightness(1.6); */
}

.tab-container > nav > button[disabled] svg {
  fill: var(--vp-code-block-bg);
  /* filter: brightness(1.6); */
}

.tab-container > nav > button.is-selected {
  background-color: var(--vp-code-block-bg);
}

.tab-container > nav > button.is-selected svg {
  fill: var(--vp-code-block-color);
}

@media (min-width: 420px) {
  .tab-container .tab-content div[class^='language-'] {
    border-radius: 6px 0 6px 6px;
  }
}

.tab-container .tab-content [class^='language'] {
  margin-top: 0;
  border-radius: 6px 0 6px 6px;
}
</style>
