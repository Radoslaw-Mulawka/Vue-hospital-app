<template>
    <button @click='sortColumn(columnName)' class='table-grid__sort-button initial-arrows' :class='{
       "initial-arrows": justMounted == true,
       "sort-button--asc" : sortDirection == "desc" && justMounted == false,
       "sort-button--desc" : sortDirection == "asc" && justMounted == false,
    }'></button>
</template>

<script>
import { EventBus } from '../../main.js';
export default {
  props: [
    'config',
    'columnName',
    'queryString'],
  data: function() {
    return {
      sortDirection: 'asc',
      justMounted: true,
    };
  },
  created() {
    EventBus.$on('resetOtherSortButtons', ({ columnName, sortDirection }) => {
      let englishKey;
      for (const objectKey in this.config.columns) {
        if (this.config.columns[objectKey].label === this.columnName) {
          englishKey = objectKey;
          if (columnName !== englishKey) {
            this.sortDirection = 'asc';
            this.justMounted = true;
          } else {
            this.sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            this.justMounted = false;
          }
        }
      }
    });
  },
  methods: {
    sortColumn: function(key) {
      let englishKey;
      for (const objectKey in this.config.columns) {
        if (this.config.columns[objectKey].label === key) {
          englishKey = objectKey;
        }
      }
      EventBus.$emit('sortChanged', {
        columnName: englishKey,
        sortDirection: this.sortDirection,
      });
    },
  },
};
</script>

<style lang='scss'>
@import '../../css/variables';
.table-grid {
  &__sort-button {
    background-color: transparent;
    width: 15px;
    height: 15px;
    cursor: pointer;

    background-repeat: no-repeat;
    background-size: contain;
    background-position: center left, center right;
    border: none;
  }
  .initial-arrows {
    background-image:  url("../../static/images/icons/actions-general/arrow-up.png"), url("../../static/images/icons/actions-general/arrow-down.png");
  }
  .sort-button--asc {
      background-image: url("../../static/images/icons/actions-general/arrow-up.png"), url("../../static/images/icons/actions-general/arrow-down-active.png");
  }
  .sort-button--desc {
      background-image: url("../../static/images/icons/actions-general/arrow-up-active.png"), url("../../static/images/icons/actions-general/arrow-down.png");
  }
}
</style>
