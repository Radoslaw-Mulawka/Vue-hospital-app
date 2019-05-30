<template>
    <td @click='showRowDetails(oneObject,index, $event)' v-if='selectedComponent == null' v-html='value.value'></td>
    <td @click='showRowDetails(oneObject,index, $event)' v-else>
        <component :is='selectedComponent' hello="AAAAAAAAA"></component>
    </td>
</template>

<script>
export default {
  props: ['value', 'columnName', 'config', 'showRowDetails', 'index', 'oneObject'],
  data: function() {
    return {
      selectedComponent: null,
    };
  },
  created() {
    if (this.config.columns[this.columnName].component !== undefined) {
      this.$options.components = {
        ...this.$options.components,
        [this.config.columns[this.columnName].component]: () => import(`./${this.config.columns[this.columnName].component}.vue`),
      };
      this.selectedComponent = this.config.columns[this.columnName].component;
    }
  },
};
</script>

