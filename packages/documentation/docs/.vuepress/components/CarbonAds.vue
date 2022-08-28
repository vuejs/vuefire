<template>
  <div class="carbon_ad" ref="carbonads"></div>
</template>

<script>
export default {
  mounted() {
    if (this.$refs.carbonads.children.length) return
    const script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute(
      'src',
      '//cdn.carbonads.com/carbon.js?serve=CK7DL23N&placement=vuefirevuejsorg'
    )

    script.setAttribute('id', '_carbonads_js')
    this.$refs.carbonads.appendChild(script)
  },
  watch: {
    $route(to, from) {
      if (to.path !== from.path && typeof _carbonads === 'object') {
        _carbonads.refresh()
      }
    },
  },
}
</script>

<style lang="stylus">
.carbon_ad {
  min-height: 102px;
  padding: 1.5rem 1.5rem 0;
  margin-bottom: -0.5rem;
  font-size: 0.75rem;

  @media (max-width: $MQMobile) {
    .carbon-img img {
      width: 100px;
      height: 77px;
    }
  }

  a {
    color: #444;
    font-weight: normal;
    display: inline;
  }

  .carbon-img {
    float: left;
    margin-right: 1rem;
    border: 1px solid $borderColor;

    img {
      display: block;
    }
  }

  .carbon-poweredby {
    color: #999;
    display: block;
    margin-top: 0.5em;
  }

  .carbon_ad {
    .carbon-img img {
      width: 100px;
      height: 77px;
    }
  }
}
</style>
