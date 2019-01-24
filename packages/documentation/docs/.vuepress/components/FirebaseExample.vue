<template>
  <div class="tab-container" :id="id">
    <nav ref="nav">
      <button
        :id="id + '_rtdb'"
        :class="!selectedTab && 'is-selected'"
        title="Realtime Database example"
        @focus="selectOnFocus(0, $event)"
        @click="select(0)"
        :disabled="disable === '0'"
      >
        <rtdb-logo/>
      </button>
      <button
        :id="id + '_firestore'"
        :class="selectedTab && 'is-selected'"
        title="Cloudstore example"
        @focus="selectOnFocus(1, $event)"
        @click="select(1)"
        :disabled="disable === '1'"
      >
        <cloudstore-logo/>
      </button>
    </nav>
    <section>
      <keep-alive>
        <!-- the key forces recreation of the slot child instead of reusing it -->
        <div class="tab-content" :key="selectedTab">
          <SlotSelector :slot="$slots.default[selectedTab]"/>
        </div>
      </keep-alive>
    </section>
  </div>
</template>

<script>
import 'focus-visible'
import RtdbLogo from './RtdbLogo'
import CloudstoreLogo from './CloudstoreLogo'

const sharedState = {
  selectedTab: 1, // defaults to Firestore examples
}

export default {
  props: ['id', 'disable'],
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
    CloudstoreLogo,
    RtdbLogo,
    SlotSelector: {
      functional: true,
      render: (h, { props }) => props.slot,
    },
  },
}
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
      margin: 0;
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

      & /deep/ svg {
        width: 32px;
        height: 32px;
        // margin-top: -3.5rem;
        fill: darken($bgColor, 10%);
      }

      &:not([disabled]):hover {
        cursor: pointer;
        background-color: lighten($codeBgColor, 30%);

        & /deep/ svg {
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
    @media (min-width: 420px) {
      & >>> div[class^='language-'] {
        border-radius: 6px 0 6px 6px;
      }
    }

    & >>> pre[class^=language] {
      margin-top: 0;
      border-radius: 6px 0 6px 6px;
    }
  }
}
</style>
