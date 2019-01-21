<template>
  <div class="tab-container" :id="id">
    <nav>
      <button
        :id="id + '_rtdb'"
        :class="!selectedTab && 'is-selected'"
        title="Realtime Database example"
        @focus="selectOnFocus(0, $event)"
        @click="selectedTab = 0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
          <path
            d="M24 120h144v32.016c0 8.832-7.144 15.984-15.96 15.984H39.96C31.144 168 24 160.816 24 152.016zm0-80.064C24 31.136 31.144 24 39.96 24h112.08c8.816 0 15.96 7.2 15.96 15.936v56.128c0 8.8-7.144 15.936-15.96 15.936H39.96C31.144 112 24 104.8 24 96.064zM40 40h112v24H40zm0 44.04C40 81.8 41.712 80 44.04 80h7.92C54.2 80 56 81.712 56 84.04v7.92C56 94.2 54.288 96 51.96 96h-7.92C41.8 96 40 94.288 40 91.96zm0 56c0-2.24 1.712-4.04 4.04-4.04h7.92c2.24 0 4.04 1.712 4.04 4.04v7.92c0 2.24-1.712 4.04-4.04 4.04h-7.92c-2.24 0-4.04-1.712-4.04-4.04z"
            fill-rule="evenodd"
          ></path>
        </svg>
      </button>
      <button
        :id="id + '_firestore'"
        :class="selectedTab && 'is-selected'"
        title="Cloudstore example"
        @focus="selectOnFocus(1, $event)"
        @click="selectedTab = 1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
          <path
            d="M96 104l-72 32v-32l72-32 72 32v28-6 10zm0-88l72 32v32L96 48 24 80V48zm27 116l36 16-63 28v-32z"
            fill-rule="evenodd"
          ></path>
        </svg>
      </button>
    </nav>
    <section>
      <keep-alive>
        <!-- the key forces recreation of the slot child instead of reusing it -->
        <div class="tab-content" :key="selectedTab">
          <SlotSelector :slot="$slots.default[selectedTab]" />
        </div>
      </keep-alive>
    </section>
  </div>
</template>

<script>
import "focus-visible";

export default {
  props: ['id'],
  data() {
    return {
      selectedTab: 0
    };
  },

  methods: {
    selectOnFocus(i, event) {
      if (!event.relatedTarget || event.relatedTarget.tagName !== 'A') return
      this.selectedTab = i
    }
  },

  components: {
    SlotSelector: {
      functional: true,
      render: (h, { props }) => props.slot
    }
  }
};
</script>

<style lang="stylus" scoped>
$bgColor = #fff;
$lightGray = #ddd;

.tab-container {
  background-color: $bgColor;

  & > nav {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    height: 2.5rem;

    @media (max-width: 419px) {
      & {
        margin: 0 -1.5rem -0.85rem;
      }
    }

    & > button {
      display: flex;
      align-items: center;
      height: 100%;
      // padding: 4.6rem 0.7rem 0;
      padding: 0 0.7rem;
      border: solid 1px $codeBgColor;
      border-bottom: none;
      background-color: lighten($codeBgColor, 10%);

      &:not(:first-child) {
        border-left: none;
      }

      &:not(:last-child) {
        border-right: none;
      }

      &:first-child {
        border-radius: 6px 0 0;
      }

      &:last-child {
        border-radius: 0 6px 0 0;
      }

      & > svg {
        width: 32px;
        height: 32px;
        // margin-top: -3.5rem;
        fill: darken($bgColor, 10%);
      }

      &:not([disabled]):hover {
        cursor: pointer;
        background-color: lighten($codeBgColor, 30%);

        & svg {
          fill: $bgColor;
        }
      }

      &.is-selected:hover {
        background-color: $codeBgColor;
      }

      &[disabled] {
        border-color: lighten($codeBgColor, 60%);

        & svg {
          fill: lighten($codeBgColor, 60%);
        }
      }

      &.is-selected {
        background-color: $codeBgColor;

        & svg {
          fill: $bgColor;
        }
      }
    }
  }

  .tab-content {
    & >>> div[class^='language-'] {
      border-radius: 6px 0 6px 6px;
    }

    & >>> pre[class^=language] {
      margin-top: 0;
      border-radius: 6px 0 6px 6px;
    }
  }
}
</style>
